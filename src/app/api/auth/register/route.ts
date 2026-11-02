import { proxy } from "@/lib/server/backend";

export async function POST(request: Request) {
  return proxy<unknown>(request, "/organizer/auth/register", ({ status, data }) =>
    Response.json(data ?? { ok: true }, { status }),
  );
}
