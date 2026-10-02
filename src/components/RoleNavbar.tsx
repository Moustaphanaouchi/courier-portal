"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Package,
  Truck,
  ShieldAlert,
  Receipt,
  LogOut,
  User,
  FileSpreadsheet,
  Search,
  Printer,
  Menu,
  X,
  CreditCard,
  PlusCircle,
  History,
} from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";

interface SessionUser {
  userId: string;
  name: string;
  email: string;
  role: "COURIER_ADMIN" | "DRIVER" | "MERCHANT";
}

export function RoleNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand & Mobile Hamburger Toggle */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight hover:opacity-90 transition">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-sm">
              C
            </span>
            <span className="hidden sm:inline">{t("brandName")}</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 text-xs font-semibold">
          {/* Admin Links */}
          {user?.role === "COURIER_ADMIN" && (
            <>
              <Link
                href="/admin/parcels"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname.startsWith("/admin/parcels") ? "bg-slate-800 text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                {t("allParcels")}
              </Link>
              <Link
                href="/admin/dispatch"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/admin/dispatch" ? "bg-slate-800 text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                {t("dispatchRuns")}
              </Link>
              <Link
                href="/admin/settlements"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/admin/settlements" ? "bg-slate-800 text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                {t("settlements")}
              </Link>
              <Link
                href="/admin/payouts"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/admin/payouts" ? "bg-slate-800 text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                {t("payoutBatches")}
              </Link>
              <Link
                href="/track"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/track" ? "bg-slate-800 text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                {t("liveTracker")}
              </Link>
            </>
          )}

          {/* Merchant Links */}
          {user?.role === "MERCHANT" && (
            <>
              <Link
                href="/merchant/parcels"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/merchant/parcels" ? "bg-slate-800 text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                {t("myParcels")}
              </Link>
              <Link
                href="/merchant/parcels/new"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/merchant/parcels/new" ? "bg-slate-800 text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                + {t("newParcel")}
              </Link>
              <Link
                href="/merchant/parcels/import"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/merchant/parcels/import" ? "bg-slate-800 text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                {t("bulkUpload")}
              </Link>
              <Link
                href="/merchant/payouts"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/merchant/payouts" ? "bg-slate-800 text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                {t("payoutHistory")}
              </Link>
            </>
          )}

          {/* Driver Links */}
          {user?.role === "DRIVER" && (
            <>
              <Link
                href="/driver/run"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/driver/run" ? "bg-slate-800 text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                {t("activeRunSheet")}
              </Link>
              <Link
                href="/driver/history"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/driver/history" ? "bg-slate-800 text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                {t("tripHistory")}
              </Link>
            </>
          )}
        </div>

        {/* User Identity, Language Toggle & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />

          {loading ? (
            <div className="w-16 sm:w-20 h-7 bg-slate-800 animate-pulse rounded-lg" />
          ) : user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold leading-none text-slate-200">{user.name}</div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  {user.role === "COURIER_ADMIN" ? t("hubAdmin") : user.role === "DRIVER" ? t("driver") : t("merchant")}
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  user.role === "COURIER_ADMIN"
                    ? "bg-purple-900/60 text-purple-300 border border-purple-700"
                    : user.role === "DRIVER"
                    ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700"
                    : "bg-blue-900/60 text-blue-300 border border-blue-700"
                }`}
              >
                {user.role === "COURIER_ADMIN" ? "ADMIN" : user.role}
              </span>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition ml-1 cursor-pointer"
                title={t("logout")}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 py-3 space-y-1">
          {user.role === "COURIER_ADMIN" && (
            <>
              <Link href="/admin/parcels" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
                {t("allParcels")}
              </Link>
              <Link href="/admin/dispatch" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
                {t("dispatchRuns")}
              </Link>
              <Link href="/admin/settlements" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
                {t("settlements")}
              </Link>
              <Link href="/admin/payouts" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
                {t("payoutBatches")}
              </Link>
              <Link href="/track" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
                {t("liveTracker")}
              </Link>
            </>
          )}

          {user.role === "MERCHANT" && (
            <>
              <Link href="/merchant/parcels" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
                {t("myParcels")}
              </Link>
              <Link href="/merchant/parcels/new" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
                + {t("newParcel")}
              </Link>
              <Link href="/merchant/parcels/import" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
                {t("bulkUpload")}
              </Link>
              <Link href="/merchant/payouts" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
                {t("payoutHistory")}
              </Link>
            </>
          )}

          {user.role === "DRIVER" && (
            <>
              <Link href="/driver/run" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
                {t("activeRunSheet")}
              </Link>
              <Link href="/driver/history" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
                {t("tripHistory")}
              </Link>
            </>
          )}

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1"
            >
              {t("logout")}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
export default RoleNavbar;
