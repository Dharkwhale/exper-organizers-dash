import { proxy } from "@/lib/server/backend";
import { setRecovery, type Tokens } from "@/lib/server/session";

// The recovery session stays in an httpOnly cookie; the page only learns the email.
export async function POST(request: Request) {
  return proxy<Tokens & { email: string }>(
    request,
    "/organizer/auth/reset-password/verify",
    async ({ data }) => {
      await setRecovery(data);
      return Response.json({ email: data.email });
    },
  );
}
