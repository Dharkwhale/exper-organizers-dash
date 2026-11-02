import { proxy } from "@/lib/server/backend";
import { setSession, withoutTokens, type Tokens } from "@/lib/server/session";

export async function POST(request: Request) {
  return proxy<Tokens>(request, "/organizer/auth/login", async ({ data }) => {
    await setSession(data);
    return Response.json(withoutTokens(data));
  });
}
