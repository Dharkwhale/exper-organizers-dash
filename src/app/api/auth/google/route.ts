import { proxy } from "@/lib/server/backend";
import { setSession, withoutTokens, type Tokens } from "@/lib/server/session";

// Google sign-in and sign-up share one backend route: it signs in an existing
// organiser, or creates the workspace when the body carries workspaceName and
// acceptedTerms. Either way the session goes into httpOnly cookies.
export async function POST(request: Request) {
  return proxy<Tokens>(request, "/organizer/auth/google", async ({ data }) => {
    await setSession(data);
    return Response.json(withoutTokens(data));
  });
}
