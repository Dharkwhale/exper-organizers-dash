const APP_VERSION = "0.1.0";

export type BackendFailure = {
  ok: false;
  status: number;
  message: string;
  retryAfter?: number;
};
export type BackendResult<T> =
  | { ok: true; status: number; data: T }
  | BackendFailure;

type BackendInit = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  bearer?: string;
  userAgent?: string | null;
};

function failure(
  status: number,
  message: string,
  retryAfter?: number,
): BackendFailure {
  return retryAfter === undefined
    ? { ok: false, status, message }
    : { ok: false, status, message, retryAfter };
}

// The backend sends `message` as a string, or a list for validation errors.
function extractMessage(body: unknown): string | undefined {
  if (!body || typeof body !== "object" || !("message" in body)) return undefined;
  const { message } = body as { message: unknown };
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.map(String).join(". ");
  return undefined;
}

export async function backendFetch<T = unknown>(
  path: string,
  init: BackendInit = {},
): Promise<BackendResult<T>> {
  const base = process.env.BACKEND_URL?.replace(/\/+$/, "");
  if (!base) {
    return failure(500, "The backend is not configured. Set BACKEND_URL.");
  }

  const headers: Record<string, string> = {
    accept: "application/json",
    "user-agent": `Exper-Organizer/${APP_VERSION} (${init.userAgent ?? "unknown"})`,
  };
  if (init.body !== undefined) headers["content-type"] = "application/json";
  if (init.bearer) headers.authorization = `Bearer ${init.bearer}`;

  let response: Response;
  try {
    response = await fetch(`${base}/api/v1${path}`, {
      method: init.method ?? "GET",
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch {
    return failure(502, "Couldn't reach the server. Try again.");
  }

  if (response.status === 204) {
    return { ok: true, status: 204, data: undefined as T };
  }

  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch {
    parsed = undefined;
  }

  if (response.ok) {
    return { ok: true, status: response.status, data: parsed as T };
  }

  const retryAfter = Number(response.headers.get("retry-after"));
  return failure(
    response.status,
    extractMessage(parsed) ?? "Something went wrong. Try again.",
    Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
  );
}

// Only same-origin JSON is accepted, which cross-site forms cannot send.
export async function parseJsonBody(
  request: Request,
): Promise<{ body: Record<string, unknown> } | { error: Response }> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) {
    return {
      error: Response.json(
        { message: "Send the request as JSON." },
        { status: 415 },
      ),
    };
  }
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return { body: body as Record<string, unknown> };
    }
  } catch {
    // Falls through to the error below.
  }
  return {
    error: Response.json({ message: "Invalid request body." }, { status: 400 }),
  };
}

export function errorResponse(result: BackendFailure): Response {
  const headers = new Headers();
  if (result.retryAfter !== undefined) {
    headers.set("retry-after", String(result.retryAfter));
  }
  return Response.json(
    { message: result.message },
    { status: result.status, headers },
  );
}

// Forwards a JSON POST to the backend and lets `onSuccess` shape the reply.
export async function proxy<T>(
  request: Request,
  path: string,
  onSuccess: (result: { status: number; data: T }) => Response | Promise<Response>,
): Promise<Response> {
  const parsed = await parseJsonBody(request);
  if ("error" in parsed) return parsed.error;

  const result = await backendFetch<T>(path, {
    method: "POST",
    body: parsed.body,
    userAgent: request.headers.get("user-agent"),
  });
  return result.ok ? onSuccess(result) : errorResponse(result);
}
