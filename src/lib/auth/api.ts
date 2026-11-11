export type SessionSummary = {
  user: { id: string; email: string; user_metadata?: { full_name?: string } };
  roles: string[];
  isAdmin: boolean;
  workspace: { id: string; name: string } | null;
  data: unknown[];
};

export type AuthErrorCode =
  | "invalid_credentials"
  | "not_verified"
  | "not_organizer"
  | "rate_limited"
  | "email_taken"
  | "bad_code"
  | "link_expired"
  | "password_refused"
  | "session_expired"
  | "google_failed"
  | "validation"
  | "network"
  | "unknown";

export type AuthResult<T = undefined> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: AuthErrorCode;
      message: string;
      retryAfterSeconds?: number;
    };

export type AuthFailure = Extract<AuthResult<unknown>, { ok: false }>;

// Copy for the person; rate limits get a concrete wait instead of the raw message.
export function friendlyMessage(failure: AuthFailure): string {
  if (failure.code !== "rate_limited") return failure.message;
  if (!failure.retryAfterSeconds) return "Too many attempts. Try again later.";
  const minutes = Math.max(1, Math.ceil(failure.retryAfterSeconds / 60));
  return `Too many attempts. Try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`;
}

type Endpoint =
  | "login"
  | "google"
  | "logout"
  | "register"
  | "verify"
  | "resend"
  | "forgot"
  | "resetVerify"
  | "resetPassword";

function classify(endpoint: Endpoint, status: number, message: string): AuthErrorCode {
  if (status === 429) return "rate_limited";
  switch (endpoint) {
    case "login":
      if (status === 401) return "invalid_credentials";
      if (status === 403) {
        return /not verified/i.test(message) ? "not_verified" : "not_organizer";
      }
      break;
    case "google":
      if (status === 401) return "google_failed";
      if (status === 403) return "not_organizer";
      break;
    case "register":
      if (status === 409) return "email_taken";
      if (status === 400) return "validation";
      break;
    case "verify":
      if (status === 400) return "bad_code";
      if (status === 403) return "not_organizer";
      break;
    case "resetVerify":
      if (status === 400) return "link_expired";
      break;
    case "resetPassword":
      if (status === 400) return "password_refused";
      if (status === 401) return "session_expired";
      break;
  }
  return status === 400 ? "validation" : "unknown";
}

async function post<T>(
  endpoint: Endpoint,
  path: string,
  body: unknown,
): Promise<AuthResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return {
      ok: false,
      code: "network",
      message: "Couldn't reach the server. Try again.",
    };
  }

  if (response.ok) {
    const text = await response.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = undefined;
    }
    return { ok: true, data: data as T };
  }

  let message = "";
  try {
    const parsed = (await response.json()) as { message?: unknown };
    if (typeof parsed.message === "string") message = parsed.message;
  } catch {
    // The body was not JSON; the generic message below applies.
  }
  message ||= "Something went wrong. Try again.";

  const code = classify(endpoint, response.status, message);
  const retryAfter = Number.parseInt(response.headers.get("retry-after") ?? "", 10);
  return code === "rate_limited" && retryAfter > 0
    ? { ok: false, code, message, retryAfterSeconds: retryAfter }
    : { ok: false, code, message };
}

export const signIn = (email: string, password: string) =>
  post<SessionSummary>("login", "/api/auth/login", { email, password });

export type GoogleCredential = { idToken: string; nonce: string };

// One backend route for both: it signs in an existing organiser, or creates the
// workspace when the workspace name and the accepted terms come along.
export const signInWithGoogle = ({ idToken, nonce }: GoogleCredential) =>
  post<SessionSummary>("google", "/api/auth/google", { idToken, nonce });

export const signUpWithGoogle = (
  input: GoogleCredential & { workspaceName: string; acceptedTerms: boolean },
) =>
  post<SessionSummary>("google", "/api/auth/google", {
    idToken: input.idToken,
    nonce: input.nonce,
    workspaceName: input.workspaceName,
    acceptedTerms: input.acceptedTerms,
  });

export const signOut = () => post("logout", "/api/auth/logout", {});

export const signUp = (input: {
  fullName: string;
  email: string;
  workspaceName: string;
  password: string;
  acceptedTerms: boolean;
}) => post("register", "/api/auth/register", input);

export const verifyCode = (email: string, token: string) =>
  post<SessionSummary>("verify", "/api/auth/verify", { email, token });

export const resendCode = (email: string) =>
  post("resend", "/api/auth/resend", { email });

export const requestReset = (email: string) =>
  post("forgot", "/api/auth/forgot-password", { email });

export const checkResetLink = (tokenHash: string) =>
  post<{ email: string }>("resetVerify", "/api/auth/reset-password/verify", {
    tokenHash,
  });

export const setPassword = (newPassword: string, signOutOtherDevices: boolean) =>
  post("resetPassword", "/api/auth/reset-password", {
    newPassword,
    signOutOtherDevices,
  });
