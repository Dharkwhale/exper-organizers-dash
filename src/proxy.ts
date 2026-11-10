import { NextResponse, type NextRequest } from "next/server";
import { COOKIE } from "@/lib/server/session";

// A cheap gate: it only checks that a session cookie exists. The backend still
// validates the token, and a 401 there sends the person back to sign in.
export function proxy(request: NextRequest): NextResponse {
  if (request.cookies.has(COOKIE.access)) return NextResponse.next();
  return NextResponse.redirect(new URL("/sign-in", request.url));
}

export const config = { matcher: ["/overview/:path*", "/events/:path*"] };
