import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { ContentBlockParam, MessageParam, TextBlockParam, Tool } from "@anthropic-ai/sdk/resources/messages/messages";
import { aiKey } from "../appSecrets";
import { decide } from "./mockPolicy";

/**
 * The model behind every agent, behind one small interface.
 *
 * `anthropic` is the real thing and needs ANTHROPIC_API_KEY. `mock` is a
 * scripted stand-in used by the automated tests: it drives the same tools
 * through the same loop, so the browser, the film renderer and the site
 * tools are exercised for real even when no model is reachable.
 */

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface Turn {
  text: string;
  calls: ToolCall[];
  /** The assistant's turn exactly as the model produced it, to be sent back verbatim on the next turn. */
  content: ContentBlockParam[];
  usage: { input: number; output: number; cached: number };
}

export interface CompleteRequest {
  model: string;
  system: string;
  messages: MessageParam[];
  tools: Tool[];
  maxTokens?: number;
  /** Which agent is asking: lets the scripted provider behave sensibly. */
  task: "site" | "browse" | "plan" | "import" | "audit";
  /** Groups the turns of one job, for providers that keep state. */
  session: string;
}

export interface Provider {
  readonly name: string;
  complete(request: CompleteRequest): Promise<Turn>;
}

/** API ids for the short names the portal uses. */
export const MODEL_IDS: Record<string, string> = {
  "claude-sonnet-5": "claude-sonnet-5",
  "claude-opus-5": "claude-opus-5",
  "claude-haiku-4-5": "claude-haiku-4-5-20251001",
};

export async function providerName(): Promise<"anthropic" | "mock" | "none"> {
  if (process.env.AI_PROVIDER === "mock") return "mock";
  if (await aiKey()) return "anthropic";
  return "none";
}

export async function provider(): Promise<Provider> {
  const which = await providerName();
  if (which === "mock") return new MockProvider();
  const key = await aiKey();
  if (which === "anthropic" && key) return new AnthropicProvider(key);
  throw new Error("No model key is set. Paste your Anthropic API key under Settings → Connections (or set ANTHROPIC_API_KEY in .env).");
}

/* ---------------- Anthropic ---------------- */

/** How many of the most recent screenshots the model still sees; older ones are replaced by a note. */
const IMAGES_KEPT = 2;

/**
 * A browsing transcript carries a screenshot per page read. The model only
 * needs the recent ones to act; sending every earlier one again on every
 * turn would cost more with each step for nothing.
 */
export function pruneImages(messages: MessageParam[], keep = IMAGES_KEPT): MessageParam[] {
  let seen = 0;
  const out: MessageParam[] = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (typeof m.content === "string") {
      out.unshift(m);
      continue;
    }
    const content = m.content.map((block): ContentBlockParam => {
      if (block.type !== "tool_result" || !Array.isArray(block.content)) return block;
      const inner = block.content.map((c) => {
        if (c.type !== "image") return c;
        seen += 1;
        return seen <= keep ? c : ({ type: "text", text: "(an earlier screenshot, no longer shown)" } as TextBlockParam);
      });
      return { ...block, content: inner };
    });
    out.unshift({ ...m, content });
  }
  return out;
}

/** What the operator reads when the API says no. */
function explain(error: unknown): Error {
  if (error instanceof Anthropic.APIConnectionTimeoutError) return new Error("The model took too long to answer and the request was abandoned after retries. Try again, or ask for something smaller.");
  if (error instanceof Anthropic.AuthenticationError) return new Error("The model refused the API key (401). Check ANTHROPIC_API_KEY in .env and restart.");
  if (error instanceof Anthropic.PermissionDeniedError) return new Error("The API key is not allowed to use this model (403). Check the key's permissions or choose another model.");
  if (error instanceof Anthropic.NotFoundError) return new Error("The model id was not found (404). Choose another model in the composer.");
  if (error instanceof Anthropic.RateLimitError) return new Error("The model is rate-limited right now (429) and retries were exhausted. Try again in a minute.");
  if (error instanceof Anthropic.BadRequestError) return new Error(`The model rejected the request (400): ${error.message.slice(0, 300)}`);
  if (error instanceof Anthropic.InternalServerError) return new Error(`The model service had a problem (${error.status}) and retries were exhausted. Try again shortly.`);
  if (error instanceof Anthropic.APIConnectionError) return new Error("Could not reach the model service. Check the server's internet connection.");
  if (error instanceof Anthropic.APIError) return new Error(`The model service answered ${error.status ?? "with an error"}: ${error.message.slice(0, 300)}`);
  return error instanceof Error ? error : new Error(String(error));
}

class AnthropicProvider implements Provider {
  readonly name = "anthropic";
  private client: Anthropic;

  constructor(apiKey: string) {
    // Overloads, rate limits and timeouts are retried with backoff before a job is failed.
    // The clock is generous: a turn's budget includes the model's own reasoning.
    this.client = new Anthropic({ apiKey, maxRetries: 3, timeout: 600_000 });
  }

  async complete(request: CompleteRequest, retried = false): Promise<Turn> {
    // The system prompt and the tool list are identical on every turn of a job, so they are cached.
    const system: TextBlockParam[] = [{ type: "text", text: request.system, cache_control: { type: "ephemeral" } }];
    const tools = request.tools.map((t, i) => (i === request.tools.length - 1 ? { ...t, cache_control: { type: "ephemeral" as const } } : t));

    let response: Anthropic.Message;
    try {
      response = await this.client.messages.create({
        model: MODEL_IDS[request.model] ?? request.model,
        max_tokens: request.maxTokens ?? 16_000,
        system,
        messages: pruneImages(request.messages),
        ...(tools.length ? { tools } : {}),
      });
    } catch (error) {
      throw explain(error);
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();
    const calls = response.content
      .filter((block): block is Anthropic.ToolUseBlock => block.type === "tool_use")
      .map((block) => ({ id: block.id, name: block.name, input: (block.input ?? {}) as Record<string, unknown> }));

    // A cut-off answer is never acted on: a half-written tool call could do the wrong thing.
    // The budget covers the model's reasoning too, so one retry with twice the room comes first.
    if (response.stop_reason === "max_tokens") {
      if (!retried) return this.complete({ ...request, maxTokens: (request.maxTokens ?? 16_000) * 2 }, true);
      throw new Error("The model's turn ran past its output budget, even with a larger one. Ask for it in smaller steps.");
    }
    if (response.stop_reason === "refusal") {
      const details = (response as { stop_details?: { category?: string; explanation?: string } | null }).stop_details;
      const why = details?.explanation ?? details?.category;
      throw new Error(`The model declined this request${why ? ` (${why})` : ""}. Rephrase it, or ask for something else.`);
    }
    if (String(response.stop_reason) === "model_context_window_exceeded") {
      throw new Error("The conversation no longer fits the model's context window. Start a new job.");
    }

    return {
      text,
      calls,
      // Sent back verbatim next turn, so any thinking blocks keep their signatures.
      content: response.content as unknown as ContentBlockParam[],
      usage: {
        input: response.usage.input_tokens + (response.usage.cache_creation_input_tokens ?? 0) + (response.usage.cache_read_input_tokens ?? 0),
        output: response.usage.output_tokens,
        cached: response.usage.cache_read_input_tokens ?? 0,
      },
    };
  }
}

/* ---------------- Scripted stand-in ---------------- */

const MOCK_USAGE = { input: 1200, output: 80, cached: 0 };

/** The scripted operator: the shared policy, answered in process. */
class MockProvider implements Provider {
  readonly name = "mock";

  async complete(request: CompleteRequest): Promise<Turn> {
    const turn = decide(request.task, request.messages);
    const content: ContentBlockParam[] = [
      ...(turn.text ? [{ type: "text" as const, text: turn.text }] : []),
      ...turn.calls.map((c) => ({ type: "tool_use" as const, id: c.id, name: c.name, input: c.input })),
    ];
    return { text: turn.text, calls: turn.calls, content, usage: MOCK_USAGE };
  }
}
