import { cookies } from "next/headers";

export const COOKIE = {
  access: "exper_at",
  refresh: "exper_rt",
  recovery: "exper_recovery",
} as const;

export type Tokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const RECOVERY_MAX_AGE = 600;

const base = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
});

const secondsLeft = (expiresAt: number) =>
  Math.max(expiresAt - Math.floor(Date.now() / 1000), 0);

export async function setSession(tokens: Tokens): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE.access, tokens.accessToken, {
    ...base(),
    maxAge: secondsLeft(tokens.expiresAt),
  });
  jar.set(COOKIE.refresh, tokens.refreshToken, {
    ...base(),
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function readAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE.access)?.value;
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE.access);
  jar.delete(COOKIE.refresh);
  jar.delete(COOKIE.recovery);
}

export async function setRecovery(tokens: Tokens): Promise<void> {
  const jar = await cookies();
  const { accessToken, refreshToken, expiresAt } = tokens;
  jar.set(COOKIE.recovery, JSON.stringify({ accessToken, refreshToken, expiresAt }), {
    ...base(),
    maxAge: Math.min(RECOVERY_MAX_AGE, secondsLeft(expiresAt)),
  });
}

export async function readRecovery(): Promise<Tokens | undefined> {
  const jar = await cookies();
  const raw = jar.get(COOKIE.recovery)?.value;
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw) as Partial<Tokens>;
    if (
      typeof value.accessToken === "string" &&
      typeof value.refreshToken === "string" &&
      typeof value.expiresAt === "number"
    ) {
      return value as Tokens;
    }
  } catch {
    // A damaged cookie is treated as no recovery session.
  }
  return undefined;
}

export async function clearRecovery(): Promise<void> {
  (await cookies()).delete(COOKIE.recovery);
}

// Tokens stay on the server; the browser only gets the session summary.
export function withoutTokens<T extends object>(body: T) {
  const rest = { ...body } as Record<string, unknown>;
  delete rest.accessToken;
  delete rest.refreshToken;
  delete rest.expiresAt;
  return rest;
}
