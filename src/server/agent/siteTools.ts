import "server-only";
import type { Tool } from "@anthropic-ai/sdk/resources/messages/messages";
import { CONTENT_DEFAULTS, CONTENT_GROUPS } from "@/cms/contentSchema";
import { BACKGROUND_IDS, HERO_BACKGROUNDS, type BackgroundId } from "@/data/backgrounds";
import { PRODUCTS } from "@/data/products";
import { BLOCK_SLOTS, PAGE_KEYS, PALETTE_KEYS, PALETTE_META, type Block, type PageKey, type PaletteKey } from "@/lib/cms";
import type { Product } from "@/lib/types";
import { getSetting, uid } from "../db";
import { applySettings, listMedia, type SettingKey } from "../site";

/**
 * What the site-editing agent can do, and the record of what it did.
 *
 * Every write goes through `applySettings`, the same path the portal uses,
 * and the first write to each key snapshots the value before it — so a job
 * can be reverted as a whole with `revert()`, and the operator's Discard
 * button genuinely puts things back.
 */

/** One thing a job changed: which entry of which setting, what was there, what the job left. */
export interface LedgerEntry {
  key: SettingKey;
  /** The entry inside the setting: a text id, a page, a token, a slug, or page/blockId. Empty = the whole setting (older records). */
  sub: string;
  /** undefined (absent) when the entry did not exist before. */
  before: unknown;
  /** What the job left there; null when it removed the entry. */
  after?: unknown;
}

export interface LedgerRecord {
  v: 2;
  entries: LedgerEntry[];
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const splitSub = (sub: string): [string, string] => {
  const i = sub.indexOf("/");
  return i < 0 ? [sub, ""] : [sub.slice(0, i), sub.slice(i + 1)];
};

/** The entry `sub` of a setting's value; undefined when absent. */
function readEntry(value: unknown, key: SettingKey, sub: string): unknown {
  if (key === "customProducts") return Array.isArray(value) ? (value as Product[]).find((p) => p?.slug === sub) : undefined;
  if (key === "blocks") {
    const [page, id] = splitSub(sub);
    const list = isRecord(value) ? value[page] : undefined;
    return Array.isArray(list) ? (list as Block[]).find((b) => b?.id === id) : undefined;
  }
  return isRecord(value) ? value[sub] : undefined;
}

/** The setting's value with entry `sub` replaced by `entry`, or removed when `entry` is undefined. */
function writeEntry(value: unknown, key: SettingKey, sub: string, entry: unknown): unknown {
  if (key === "customProducts") {
    const list = Array.isArray(value) ? [...(value as Product[])] : [];
    const i = list.findIndex((p) => p?.slug === sub);
    if (entry === undefined) {
      if (i >= 0) list.splice(i, 1);
    } else if (i >= 0) list[i] = entry as Product;
    else list.push(entry as Product);
    return list;
  }
  if (key === "blocks") {
    const [page, id] = splitSub(sub);
    const all = isRecord(value) ? { ...value } : {};
    const list = Array.isArray(all[page]) ? [...(all[page] as Block[])] : [];
    const i = list.findIndex((b) => b?.id === id);
    if (entry === undefined) {
      if (i >= 0) list.splice(i, 1);
    } else if (i >= 0) list[i] = entry as Block;
    else list.push(entry as Block);
    all[page] = list;
    return all;
  }
  const map = isRecord(value) ? { ...value } : {};
  if (entry === undefined) delete map[sub];
  else map[sub] = entry;
  return map;
}

export class Ledger {
  entries: LedgerEntry[] = [];
  touched: string[] = [];

  /** Records what an entry holds before the job's first write to it. */
  async mark(key: SettingKey, sub: string) {
    if (this.entries.some((e) => e.key === key && e.sub === sub)) return;
    const before = readEntry(await getSetting<unknown>(key, null), key, sub);
    // Checked again: another write may have marked this entry while the read was in flight.
    if (this.entries.some((e) => e.key === key && e.sub === sub)) return;
    this.entries.push({ key, sub, before });
  }

  note(what: string) {
    this.touched.push(what);
  }

  /** The record to store: every entry, with what the job has left there. */
  async record(): Promise<LedgerRecord> {
    const entries: LedgerEntry[] = [];
    for (const e of this.entries) entries.push({ ...e, after: readEntry(await getSetting<unknown>(e.key, null), e.key, e.sub) ?? null });
    return { v: 2, entries };
  }

  /** A stored ledger, whichever shape it was written in. */
  static read(raw: unknown): LedgerRecord | null {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    if (r.v === 2 && Array.isArray(r.entries)) return r.entries.length ? (r as unknown as LedgerRecord) : null;
    // Older records held whole settings; each becomes one entry with no sub-key.
    const before = (r.before && typeof r.before === "object" && !Array.isArray(r.before) ? r.before : r) as Record<string, unknown>;
    const entries = Object.entries(before).map(([key, value]) => ({ key: key as SettingKey, sub: "", before: value }));
    return entries.length ? { v: 2, entries } : null;
  }

  /**
   * Puts back exactly what the job changed, entry by entry, merged into the
   * settings as they stand now — so discarding one job never touches another
   * job's product, block or field. An entry that someone else has changed
   * since is left as it is and reported.
   */
  static async revert(raw: unknown): Promise<{ restored: string[]; kept: string[] }> {
    const rec = Ledger.read(raw);
    if (!rec) return { restored: [], kept: [] };
    const values: Partial<Record<SettingKey, unknown>> = {};
    const restored: string[] = [];
    const kept: string[] = [];
    for (const e of [...rec.entries].reverse()) {
      if (!(e.key in values)) values[e.key] = await getSetting<unknown>(e.key, null);
      const label = e.sub ? `${e.key}/${e.sub}` : e.key;
      if (!e.sub) {
        values[e.key] = e.before;
        restored.push(label);
        continue;
      }
      if ("after" in e && !same(readEntry(values[e.key], e.key, e.sub), e.after)) {
        kept.push(label);
        continue;
      }
      values[e.key] = writeEntry(values[e.key], e.key, e.sub, e.before);
      restored.push(label);
    }
    if (restored.length) await applySettings(values as Record<string, unknown>);
    return { restored, kept };
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

async function write(ledger: Ledger, key: SettingKey, sub: string, value: unknown) {
  await ledger.mark(key, sub);
  try {
    await applySettings({ [key]: value });
  } catch (error) {
    if (error instanceof Response) throw new Error(`The server refused that value for ${key}.`);
    throw error;
  }
}

const trunc = (s: string, n = 90) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export async function catalogue(): Promise<Product[]> {
  const custom = await getSetting<unknown>("customProducts", []);
  return [...PRODUCTS, ...(Array.isArray(custom) ? (custom as Product[]) : [])];
}

/** A compact picture of the site for the model: ids it can act on, and what they hold now. */
export async function siteOverview(): Promise<string> {
  const text = await getSetting<Record<string, string>>("text", {});
  const backgrounds = await getSetting<Record<string, { kind: string; id?: string; mediaId?: string }>>("backgrounds", {});
  const palette = await getSetting<Record<string, string>>("palette", {});
  const products = await getSetting<Record<string, Record<string, unknown>>>("products", {});
  const blocks = await getSetting<Record<string, Block[]>>("blocks", {});

  const lines: string[] = [];
  lines.push("PAGES: " + PAGE_KEYS.join(", "));
  lines.push("BACKGROUND PLATES: " + BACKGROUND_IDS.map((id) => `${id} (${HERO_BACKGROUNDS[id].label})`).join("; "));
  lines.push("CURRENT BACKGROUNDS: " + (Object.keys(backgrounds).length ? Object.entries(backgrounds).map(([p, c]) => `${p}=${c.kind === "media" ? `media:${c.mediaId}` : c.id}`).join(", ") : "all default"));
  lines.push("PALETTE TOKENS: " + PALETTE_KEYS.map((k) => `${k} (${PALETTE_META[k].label}${palette[k] ? ` = ${palette[k]}` : ""})`).join(", "));
  lines.push("");
  lines.push("PRODUCTS (slug: name · status · hidden?):");
  for (const p of await catalogue()) {
    const o = products[p.slug] ?? {};
    lines.push(`- ${p.slug}: ${String(o.name ?? p.name)} · ${String(o.status ?? p.status)}${o.hidden ? " · HIDDEN" : ""}`);
  }
  lines.push("");
  // Only an index: every group's fields together run to hundreds of lines, and
  // the overview rides along on every turn. find_text / get_text_group fetch
  // the ones a request is about.
  lines.push("TEXT GROUPS (group id: label — fields; open with get_text_group, or search with find_text):");
  for (const group of CONTENT_GROUPS) {
    const edited = group.fields.filter((f) => text[f.id] !== undefined).length;
    lines.push(`- ${group.id}: ${group.label} — ${group.fields.length}${edited ? ` (${edited} edited)` : ""}`);
  }
  lines.push("");
  const blockCount = Object.values(blocks).reduce((a, l) => a + (l?.length ?? 0), 0);
  lines.push(`PAGE BLOCKS: ${blockCount} (slots: ${BLOCK_SLOTS.join(", ")})`);
  lines.push(`MEDIA: ${(await listMedia()).length} uploaded files`);
  return lines.join("\n");
}

export function siteTools(ledger: Ledger): { tools: Tool[]; run: (name: string, input: Record<string, unknown>) => Promise<string> } {
  const tools: Tool[] = [
    {
      name: "get_site_overview",
      description: "Every editable id on the site with its current value: pages, text fields, products, palette tokens, background plates.",
      input_schema: { type: "object", properties: {} },
    },
    {
      name: "find_text",
      description: "Search the site's editable text by what it says or what it is (e.g. 'contact heading', 'Request a Demo'). Returns matching field ids with their current values.",
      input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
    },
    {
      name: "get_text_group",
      description: "Every text field in one group from the overview's TEXT GROUPS, with ids and current values.",
      input_schema: { type: "object", properties: { group: { type: "string" } }, required: ["group"] },
    },
    {
      name: "get_product",
      description: "One product's full current copy and facts by slug: name, tagline, summary, description, sector, category, tags, stack, figures, links, status. Read it before writing or rewriting product copy.",
      input_schema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] },
    },
    {
      name: "set_text",
      description: "Replace the copy of one text field. `id` must be a field id from find_text or get_text_group. Keep meaning and length in step with the original unless asked otherwise; never invent facts, names or numbers.",
      input_schema: { type: "object", properties: { id: { type: "string" }, value: { type: "string" } }, required: ["id", "value"] },
    },
    {
      name: "reset_text",
      description: "Put a text field back to its built-in copy.",
      input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    },
    {
      name: "set_background",
      description: "Choose the photographic background plate for a page (plateId from the overview), or an uploaded image by mediaId. Omit both to restore the default.",
      input_schema: { type: "object", properties: { page: { type: "string" }, plateId: { type: "string" }, mediaId: { type: "string" } }, required: ["page"] },
    },
    {
      name: "set_palette",
      description: "Set one palette token to a hex colour on the public site (scope 'site') or the admin portal (scope 'portal'). Text stays readable automatically. Pass an empty value to clear.",
      input_schema: { type: "object", properties: { scope: { type: "string", enum: ["site", "portal"] }, token: { type: "string" }, value: { type: "string" } }, required: ["scope", "token", "value"] },
    },
    {
      name: "update_product",
      description: "Edit a product's copy or state by slug. Any of: name, tagline, summary, description, status (live|beta|development|coming-soon), accent (hex), sector, hidden (true hides it from the site).",
      input_schema: {
        type: "object",
        properties: {
          slug: { type: "string" }, name: { type: "string" }, tagline: { type: "string" }, summary: { type: "string" }, description: { type: "string" },
          status: { type: "string" }, accent: { type: "string" }, sector: { type: "string" }, hidden: { type: "boolean" },
        },
        required: ["slug"],
      },
    },
    {
      name: "add_block",
      description: "Add a content block to a page. type: text (title+body), stats (items of value+label), quote (body, author, role), image (mediaId, title as caption), video (url). slot: after-hero or before-cta.",
      input_schema: {
        type: "object",
        properties: {
          page: { type: "string" }, slot: { type: "string" }, type: { type: "string" }, title: { type: "string" }, body: { type: "string" },
          items: { type: "array", items: { type: "object", properties: { value: { type: "string" }, label: { type: "string" } } } },
          author: { type: "string" }, role: { type: "string" }, mediaId: { type: "string" }, url: { type: "string" },
        },
        required: ["page", "slot", "type"],
      },
    },
    {
      name: "remove_block",
      description: "Remove a content block from a page by its id.",
      input_schema: { type: "object", properties: { page: { type: "string" }, id: { type: "string" } }, required: ["page", "id"] },
    },
    {
      name: "list_blocks",
      description: "The content blocks on a page, with ids.",
      input_schema: { type: "object", properties: { page: { type: "string" } }, required: ["page"] },
    },
    {
      name: "list_media",
      description: "Uploaded images the site can use, with ids and names.",
      input_schema: { type: "object", properties: {} },
    },
  ];

  const run = async (name: string, input: Record<string, unknown>): Promise<string> => {
    switch (name) {
      case "get_site_overview":
        return siteOverview();

      case "find_text": {
        const words = String(input.query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
        if (!words.length) return "Say what to look for.";
        const text = await getSetting<Record<string, string>>("text", {});
        const hits: string[] = [];
        for (const group of CONTENT_GROUPS) {
          for (const field of group.fields) {
            const value = text[field.id] ?? CONTENT_DEFAULTS[field.id] ?? "";
            const hay = `${group.label} ${field.label} ${field.id} ${value}`.toLowerCase();
            if (words.every((w) => hay.includes(w))) {
              hits.push(`${field.id} [${group.label} · ${field.label}] = "${trunc(value.replace(/\s+/g, " "), 160)}"`);
            }
          }
        }
        if (!hits.length) return `Nothing matches "${input.query}". Try fewer or different words, or open a group.`;
        return hits.slice(0, 25).join("\n") + (hits.length > 25 ? `\n… ${hits.length - 25} more; be more specific.` : "");
      }

      case "get_text_group": {
        const group = CONTENT_GROUPS.find((g) => g.id === String(input.group ?? ""));
        if (!group) return `No group "${input.group}". Groups: ${CONTENT_GROUPS.map((g) => g.id).join(", ")}.`;
        const text = await getSetting<Record<string, string>>("text", {});
        return [
          `[${group.label}] ${group.description}`,
          ...group.fields.map((field) => {
            const value = text[field.id] ?? CONTENT_DEFAULTS[field.id] ?? "";
            return `${field.id} (${field.label}) = "${trunc(value.replace(/\s+/g, " "), 400)}"${text[field.id] !== undefined ? " (edited)" : ""}`;
          }),
        ].join("\n");
      }

      case "get_product": {
        const slug = String(input.slug ?? "");
        const base = (await catalogue()).find((p) => p.slug === slug);
        if (!base) return `No product with slug "${slug}".`;
        const patch = (await getSetting<Record<string, Record<string, unknown>>>("products", {}))[slug] ?? {};
        const p = { ...base, ...patch } as Product & Record<string, unknown>;
        return JSON.stringify(
          {
            slug, name: p.name, tagline: p.tagline, summary: p.summary, description: p.description,
            status: p.status, sector: p.sector, category: p.category, tags: p.tags, stack: p.stack,
            year: p.year, metrics: p.metrics, links: p.links, demoNote: p.demoNote,
          },
          null,
          1,
        );
      }

      case "set_text": {
        const id = String(input.id ?? "");
        const value = String(input.value ?? "");
        if (!(id in CONTENT_DEFAULTS)) return `Unknown text id "${id}". Use an id from the overview.`;
        const text = await getSetting<Record<string, string>>("text", {});
        await write(ledger, "text", id, { ...text, [id]: value });
        ledger.note(`${id} → "${trunc(value, 60)}"`);
        return `Set ${id}.`;
      }

      case "reset_text": {
        const id = String(input.id ?? "");
        const text = await getSetting<Record<string, string>>("text", {});
        if (!(id in text)) return `${id} already shows its built-in copy.`;
        const next = { ...text };
        delete next[id];
        await write(ledger, "text", id, next);
        ledger.note(`${id} reset`);
        return `Reset ${id}.`;
      }

      case "set_background": {
        const page = String(input.page ?? "") as PageKey;
        if (!(PAGE_KEYS as readonly string[]).includes(page)) return `Unknown page "${page}".`;
        const backgrounds = { ...(await getSetting<Record<string, unknown>>("backgrounds", {})) };
        if (input.mediaId) {
          const id = String(input.mediaId);
          if (!(await listMedia()).some((m) => m.id === id)) return `No uploaded image with id ${id}.`;
          backgrounds[page] = { kind: "media", mediaId: id };
        } else if (input.plateId) {
          const id = String(input.plateId) as BackgroundId;
          if (!(BACKGROUND_IDS as readonly string[]).includes(id)) return `Unknown plate "${id}".`;
          backgrounds[page] = { kind: "plate", id };
        } else {
          delete backgrounds[page];
        }
        await write(ledger, "backgrounds", page, backgrounds);
        ledger.note(`${page} background → ${String(input.mediaId ?? input.plateId ?? "default")}`);
        return `Background of ${page} updated.`;
      }

      case "set_palette": {
        const scope = input.scope === "portal" ? "portalPalette" : "palette";
        const token = String(input.token ?? "") as PaletteKey;
        if (!(PALETTE_KEYS as readonly string[]).includes(token)) return `Unknown token "${token}".`;
        const value = String(input.value ?? "").trim();
        if (value && !/^#[0-9a-f]{6}$/i.test(value) && !/^rgba?\(/i.test(value)) return "Colours must be hex like #2563eb.";
        const palette = { ...(await getSetting<Record<string, string>>(scope, {})) };
        if (value) palette[token] = value;
        else delete palette[token];
        await write(ledger, scope, token, palette);
        ledger.note(`${scope}.${token} → ${value || "default"}`);
        return `Palette token ${token} ${value ? `set to ${value}` : "cleared"} on the ${input.scope === "portal" ? "portal" : "site"}.`;
      }

      case "update_product": {
        const slug = String(input.slug ?? "");
        if (!(await catalogue()).some((p) => p.slug === slug)) return `No product with slug "${slug}".`;
        const allowed = ["name", "tagline", "summary", "description", "status", "accent", "sector", "hidden"] as const;
        const patch: Record<string, unknown> = {};
        for (const key of allowed) if (input[key] !== undefined) patch[key] = input[key];
        if (patch.status && !["live", "beta", "development", "coming-soon"].includes(String(patch.status))) return "status must be live, beta, development or coming-soon.";
        if (!Object.keys(patch).length) return "Nothing to change: pass at least one field.";
        const products = await getSetting<Record<string, Record<string, unknown>>>("products", {});
        await write(ledger, "products", slug, { ...products, [slug]: { ...(products[slug] ?? {}), ...patch } });
        ledger.note(`product ${slug}: ${Object.keys(patch).join(", ")}`);
        return `Updated ${slug} (${Object.keys(patch).join(", ")}).`;
      }

      case "add_block": {
        const page = String(input.page ?? "") as PageKey;
        if (!(PAGE_KEYS as readonly string[]).includes(page)) return `Unknown page "${page}".`;
        const slot = String(input.slot ?? "after-hero");
        if (!(BLOCK_SLOTS as readonly string[]).includes(slot)) return `slot must be one of ${BLOCK_SLOTS.join(", ")}.`;
        const type = String(input.type ?? "");
        if (!["text", "stats", "quote", "image", "video"].includes(type)) return "type must be text, stats, quote, image or video.";
        const block: Block = { id: uid("blk"), type: type as Block["type"], slot: slot as Block["slot"] };
        if (typeof input.title === "string") block.title = input.title;
        if (typeof input.body === "string") block.body = input.body;
        if (typeof input.author === "string") block.author = input.author;
        if (typeof input.role === "string") block.role = input.role;
        if (typeof input.url === "string") block.url = input.url;
        if (typeof input.mediaId === "string") block.mediaId = input.mediaId;
        if (Array.isArray(input.items)) {
          block.items = input.items.filter(isRecord).map((i) => ({ value: String(i.value ?? ""), label: String(i.label ?? "") })).slice(0, 6);
        }
        const blocks = await getSetting<Record<string, Block[]>>("blocks", {});
        await write(ledger, "blocks", `${page}/${block.id}`, { ...blocks, [page]: [...(blocks[page] ?? []), block] });
        ledger.note(`${type} block added to ${page}`);
        return `Added ${type} block ${block.id} to ${page} (${slot}).`;
      }

      case "remove_block": {
        const page = String(input.page ?? "") as PageKey;
        const id = String(input.id ?? "");
        const blocks = await getSetting<Record<string, Block[]>>("blocks", {});
        const list = blocks[page] ?? [];
        if (!list.some((b) => b.id === id)) return `No block ${id} on ${page}.`;
        await write(ledger, "blocks", `${page}/${id}`, { ...blocks, [page]: list.filter((b) => b.id !== id) });
        ledger.note(`block ${id} removed from ${page}`);
        return `Removed ${id}.`;
      }

      case "list_blocks": {
        const page = String(input.page ?? "");
        const list = (await getSetting<Record<string, Block[]>>("blocks", {}))[page] ?? [];
        return list.length ? list.map((b) => `${b.id}: ${b.type} in ${b.slot} — ${trunc(b.title ?? b.body ?? b.url ?? "", 60)}`).join("\n") : "No blocks on that page.";
      }

      case "list_media":
        return (await listMedia()).map((m) => `${m.id}: ${m.name} (${m.width}×${m.height})`).join("\n") || "Nothing uploaded yet.";

      default:
        return `Unknown tool ${name}.`;
    }
  };

  return { tools, run };
}
