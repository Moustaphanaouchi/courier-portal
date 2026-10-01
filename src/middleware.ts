import { NextResponse } from "next/server";
import type { NextRequest } from "next/request";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("courier_session");

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin") || pathname.startsWith("/api/settlements");
  const isMerchantRoute = pathname.startsWith("/merchant") || pathname.startsWith("/api/merchant");
  const isDriverRoute = pathname.startsWith("/driver") || pathname.startsWith("/api/driver");

  let user: { role?: string } | null = null;
  if (sessionCookie?.value) {
    try {
      user = JSON.parse(sessionCookie.value);
    } catch {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("courier_session");
      return res;
    }
  }

  // 1. Unauthenticated users trying to access protected UI or APIs
  if (!user && (isAdminRoute || isMerchantRoute || isDriverRoute)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Already logged in and hitting /login or /register
  if (user && isAuthRoute) {
    if (user.role === "COURIER_ADMIN") return NextResponse.redirect(new URL("/admin/dispatch", request.url));
    if (user.role === "DRIVER") return NextResponse.redirect(new URL("/driver/run", request.url));
    return NextResponse.redirect(new URL("/merchant/parcels", request.url));
  }

  // 3. Role-based isolation
  if (user) {
    if (isAdminRoute && user.role !== "COURIER_ADMIN") {
      if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const dest = user.role === "DRIVER" ? "/driver/run" : "/merchant/parcels";
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (isDriverRoute && user.role !== "DRIVER" && user.role !== "COURIER_ADMIN") {
      if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.redirect(new URL("/merchant/parcels", request.url));
    }

    if (isMerchantRoute && user.role !== "MERCHANT" && user.role !== "COURIER_ADMIN") {
      if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.redirect(new URL("/driver/run", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/merchant/:path*",
    "/driver/:path*",
    "/api/admin/:path*",
    "/api/merchant/:path*",
    "/api/driver/:path*",
    "/api/settlements/:path*",
    "/login",
    "/register",
  ],
};