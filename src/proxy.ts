import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface SessionUser {
  userId: string;
  email: string;
  name: string;
  role: "COURIER_ADMIN" | "MERCHANT" | "DRIVER";
  merchantId?: string | null;
  driverId?: string | null;
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow static files, Next.js internals, and public endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/track") ||
    pathname.startsWith("/track") ||
    pathname.startsWith("/api/webhooks") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/about" ||
    pathname === "/terms" ||
    pathname === "/privacy"
  ) {
    return NextResponse.next();
  }

  // 2. Read session cookie
  const sessionCookie = req.cookies.get("courier_session");

  if (!sessionCookie?.value) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let session: SessionUser | null = null;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Invalid session" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("courier_session");
    return response;
  }

  if (!session?.role) {
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("courier_session");
    return response;
  }

  // 3. Role-based Route Protection for Pages
  if (pathname.startsWith("/admin") && session.role !== "COURIER_ADMIN") {
    return NextResponse.redirect(new URL(session.role === "MERCHANT" ? "/merchant/parcels" : "/driver/run", req.url));
  }

  if (pathname.startsWith("/merchant") && session.role !== "MERCHANT") {
    return NextResponse.redirect(new URL(session.role === "COURIER_ADMIN" ? "/admin/dispatch" : "/driver/run", req.url));
  }

  if (pathname.startsWith("/driver") && session.role !== "DRIVER") {
    return NextResponse.redirect(new URL(session.role === "COURIER_ADMIN" ? "/admin/dispatch" : "/merchant/parcels", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/merchant/:path*",
    "/driver/:path*",
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};