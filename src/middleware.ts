import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";
import { NextResponse, type NextRequest } from "next/server";

export default async function authMiddleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  );

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");
  const isDashboardRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/jobs") ||
    request.nextUrl.pathname.startsWith("/analytics") ||
    request.nextUrl.pathname.startsWith("/settings");

  if (isAuthRoute && session) {
    // Log activity: User visited login page but was already authenticated
    // We use fetch here because we can't use DB directly in middleware
    try {
      fetch(`${request.nextUrl.origin}/api/log-activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.userId,
          activityType: "login",
          title: "User Login (Middleware)",
          description:
            "User accessed login page but was already authenticated (Redirected to Dashboard)",
          metadata: {
            ip: request.headers.get("x-forwarded-for") || "unknown",
            path: request.nextUrl.pathname,
          },
        }),
      }).catch((e) =>
        console.error("Failed to log activity in middleware:", e),
      );
    } catch {
      // Ignore errors
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboardRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jobs/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/login",
  ],
};
