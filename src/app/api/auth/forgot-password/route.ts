import { proxy } from "@/lib/server/backend";

export async function POST(request: Request) {
  return proxy<unknown>(
    request,
    "/organizer/auth/forgot-password",
    () => new Response(null, { status: 204 }),
  );
}
