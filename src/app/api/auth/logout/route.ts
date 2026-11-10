import { backendFetch, parseJsonBody } from "@/lib/server/backend";
import { clearSession, readAccessToken } from "@/lib/server/session";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request);
  if ("error" in parsed) return parsed.error;

  // Ending the session on the backend is best effort: whatever it says, the
  // cookies go, so the person is signed out here either way.
  const bearer = await readAccessToken();
  if (bearer) {
    await backendFetch("/auth/sign-out", {
      method: "POST",
      bearer,
      userAgent: request.headers.get("user-agent"),
    });
  }
  await clearSession();
  return new Response(null, { status: 204 });
}
