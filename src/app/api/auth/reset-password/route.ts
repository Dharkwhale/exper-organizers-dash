import { backendFetch, errorResponse, parseJsonBody } from "@/lib/server/backend";
import { clearRecovery, readRecovery, setSession } from "@/lib/server/session";

export async function POST(request: Request) {
  const recovery = await readRecovery();
  if (!recovery) {
    return Response.json(
      { message: "Your reset session expired. Request a new link." },
      { status: 401 },
    );
  }

  const parsed = await parseJsonBody(request);
  if ("error" in parsed) return parsed.error;

  const { newPassword, signOutOtherDevices } = parsed.body;
  const result = await backendFetch<Record<string, unknown>>(
    "/organizer/auth/reset-password",
    {
      method: "POST",
      body: {
        newPassword,
        ...(signOutOtherDevices === undefined ? {} : { signOutOtherDevices }),
      },
      bearer: recovery.accessToken,
      userAgent: request.headers.get("user-agent"),
    },
  );

  if (!result.ok) {
    // A refused password keeps the session so the person can retry.
    if (result.status === 401) await clearRecovery();
    return errorResponse(result);
  }

  // The person stays signed in with the tokens from the reset link.
  await setSession(recovery);
  await clearRecovery();
  return Response.json(result.data);
}
