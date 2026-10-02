"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
Package,
Truck,
Users,
LogOut,
LayoutDashboard,
Printer,
Menu,
X,
CreditCard,
PlusCircle,
History,
FileSpreadsheet,
} from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";

interface SessionUser {
userId: string;
email: string;
name: string;
role: "COURIER_ADMIN" | "MERCHANT" | "DRIVER";
merchantId?: string | null;
driverId?: string | null;
}

export default function RoleNavbar() {
const pathname = usePathname();
const router = useRouter();
const { t, isRTL } = useLanguage();
const [user, setUser] = useState<SessionUser | null>(null);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

useEffect(() => {
async function checkAuth() {
  try {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
    } else {
      setUser(null);
    }
  } catch {
    setUser(null);
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

// Hide navbar on waybill printing pages
if (pathname.includes("/waybill")) return null;

return (
<nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 print:hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
    {/* Left: Brand + Role Badge */}
    <div className="flex items-center gap-6">
      <Link href="/" className="flex items-center gap-2 font-black text-lg tracking-tight">
        <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
          CX
        </span>
        <span>Cedex</span>
      </Link>

      {/* Desktop Navigation Links based on Role */}
      {user && (
        <div className="hidden md:flex items-center gap-1 text-xs font-semibold">
          {user.role === "COURIER_ADMIN" && (
            <>
              <Link
                href="/admin/parcels"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/admin/parcels"
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {t("navAllParcels")}
              </Link>
              <Link
                href="/admin/dispatch"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/admin/dispatch"
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {t("navDispatch")}
              </Link>
              <Link
                href="/admin/settlements"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/admin/settlements"
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {t("navSettlements")}
              </Link>
              <Link
                href="/admin/parcels/print-batch"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname.startsWith("/admin/parcels/print-batch")
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {t("navPrintBatch")}
              </Link>
            </>
          )}

          {user.role === "MERCHANT" && (
            <>
              <Link
                href="/merchant/parcels"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/merchant/parcels"
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {t("navMyParcels")}
              </Link>
              <Link
                href="/merchant/parcels/new"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/merchant/parcels/new"
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {t("navCreateParcel")}
              </Link>
              <Link
                href="/merchant/parcels/import"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/merchant/parcels/import"
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {t("navBulkImport")}
              </Link>
              <Link
                href="/merchant/payouts"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/merchant/payouts"
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {t("navPayouts")}
              </Link>
            </>
          )}

          {user.role === "DRIVER" && (
            <Link
              href="/driver/run"
              className={`px-3 py-1.5 rounded-lg transition ${
                pathname === "/driver/run"
                  ? "bg-slate-800 text-blue-400"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {t("navRunSheet")}
            </Link>
          )}
        </div>
      )}
    </div>

    {/* Right side: Language Toggle + User Identity */}
    <div className="flex items-center gap-2 sm:gap-3">
      <LanguageToggle />

      {user ? (
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-300">
            {user.name}
          </span>
          <span
            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
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
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white"
        >
          {t("loginTitle")}
        </Link>
      )}

      {/* Mobile hamburger button */}
      {user && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-400"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      )}
    </div>
  </div>

  {/* Mobile Menu Drawer */}
  {isMobileMenuOpen && user && (
    <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 py-3 space-y-1">
      {user.role === "COURIER_ADMIN" && (
        <>
          <Link href="/admin/parcels" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
            {t("navAllParcels")}
          </Link>
          <Link href="/admin/dispatch" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
            {t("navDispatch")}
          </Link>
          <Link href="/admin/settlements" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
            {t("navSettlements")}
          </Link>
          <Link href="/admin/parcels/print-batch" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
            {t("navPrintBatch")}
          </Link>
        </>
      )}
      {user.role === "MERCHANT" && (
        <>
          <Link href="/merchant/parcels" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
            {t("navMyParcels")}
          </Link>
          <Link href="/merchant/parcels/new" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
            {t("navCreateParcel")}
          </Link>
          <Link href="/merchant/parcels/import" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
            {t("navBulkImport")}
          </Link>
          <Link href="/merchant/payouts" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
            {t("navPayouts")}
          </Link>
        </>
      )}
      {user.role === "DRIVER" && (
        <Link href="/driver/run" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200">
          {t("navRunSheet")}
        </Link>
      )}
    </div>
  )}
</nav>
);
}