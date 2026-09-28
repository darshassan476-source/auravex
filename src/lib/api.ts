/**
 * The one way the browser talks to the API.
 *
 * JSON in, JSON out, errors as `ApiError` carrying the server's message so a
 * screen can show it verbatim. A 401 inside the portal means the session has
 * gone, so the browser is sent to the login screen rather than left staring
 * at failed requests.
 */

/** One redirect for a dead session, however many requests notice it. */
let redirecting = false;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface Options {
  method?: string;
  /** JSON body. */
  body?: unknown;
  /** Multipart body; wins over `body`. */
  form?: FormData;
  signal?: AbortSignal;
}

export async function api<T = unknown>(path: string, options: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (options.form) {
    body = options.form;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const response = await fetch(path, {
    method: options.method ?? (body ? "POST" : "GET"),
    headers,
    body,
    credentials: "same-origin",
    cache: "no-store",
    signal: options.signal,
  });

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      (data as { error?: string } | null)?.error ?? `The server answered ${response.status}.`;

    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      if (response.status === 401 && window.location.pathname !== "/admin/login" && !redirecting) {
        redirecting = true;
        const back = window.location.pathname + window.location.search;
        window.location.assign(`/admin/login?next=${encodeURIComponent(back)}`);
      }
    }
    throw new ApiError(response.status, message);
  }

  return data as T;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
