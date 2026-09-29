import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface SessionUser {
  userId: string;
  email: string;
  name: string;
  role: "COURIER_ADMIN" | "MERCHANT" | "DRIVER";
  merchantId: string | null;
  driverId: string | null;
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow public static assets and zero-auth routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/auth/me") ||
    pathname.startsWith("/api/track") ||
    pathname.startsWith("/track") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/about" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Read session cookie
  const sessionCookie = req.cookies.get("courier_session");

  if (!sessionCookie?.value) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let session: SessionUser | null = null;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("courier_session");
    return response;
  }

  if (!session?.role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = session.role;

  // 3. Enforce Role Isolation
  // Admin-only routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin") || pathname.startsWith("/api/settlements")) {
    if (role !== "COURIER_ADMIN") {
      const redirectPath = role === "DRIVER" ? "/driver/run" : "/merchant/parcels/new";
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
  }

  // Driver-only routes
  if (pathname.startsWith("/driver") || pathname.startsWith("/api/driver")) {
    if (role !== "DRIVER" && role !== "COURIER_ADMIN") {
      return NextResponse.redirect(new URL("/merchant/parcels/new", req.url));
    }
  }

  // Merchant-only routes
  if (pathname.startsWith("/merchant") || pathname.startsWith("/api/merchant")) {
    if (role !== "MERCHANT" && role !== "COURIER_ADMIN") {
      const redirectPath = role === "DRIVER" ? "/driver/run" : "/admin/dispatch";
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};