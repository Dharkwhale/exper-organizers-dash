import { proxy } from "@/lib/server/backend";

export async function POST(request: Request) {
  return proxy<unknown>(request, "/auth/resend-otp", ({ data }) =>
    Response.json(data ?? { ok: true }),
  );
}
