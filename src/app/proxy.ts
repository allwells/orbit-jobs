import { NextResponse, type NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Allow public access to login page and auth API
  if (path.startsWith("/login") || path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 2. Check for BetterAuth session cookie
  // BetterAuth defaults to [prefix].session_token
  const sessionCookie = request.cookies.get("orbit-jobs.session_token");

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Configure which paths are protected by this proxy.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
