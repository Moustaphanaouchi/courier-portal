import { NextResponse } from "next/server";
import type { NextRequest } from "next/request";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("courier_session");

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isAdminRoute = pathname.startsWith("/admin");
  const isMerchantRoute = pathname.startsWith("/merchant");
  const isDriverRoute = pathname.startsWith("/driver");

  let user: { role?: string } | null = null;
  if (sessionCookie) {
    try {
      user = JSON.parse(sessionCookie.value);
    } catch {
      user = null;
    }
  }

  // 1. If trying to access protected route without valid session -> redirect to login
  if (!user && (isAdminRoute || isMerchantRoute || isDriverRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If logged in and visiting /login or /register -> redirect to appropriate dashboard
  if (user && isAuthRoute) {
    if (user.role === "COURIER_ADMIN") return NextResponse.redirect(new URL("/admin/dispatch", request.url));
    if (user.role === "DRIVER") return NextResponse.redirect(new URL("/driver/run", request.url));
    return NextResponse.redirect(new URL("/merchant/parcels", request.url));
  }

  // 3. Enforce Role Separation on Protected Routes
  if (user) {
    if (isAdminRoute && user.role !== "COURIER_ADMIN") {
      const redirectPath = user.role === "DRIVER" ? "/driver/run" : "/merchant/parcels";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    if (isDriverRoute && user.role !== "DRIVER") {
      const redirectPath = user.role === "COURIER_ADMIN" ? "/admin/dispatch" : "/merchant/parcels";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    if (isMerchantRoute && user.role !== "MERCHANT" && user.role !== "COURIER_ADMIN") {
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
    "/login",
    "/register",
  ],
};