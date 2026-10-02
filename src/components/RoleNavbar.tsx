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
  Search,
  Printer,
  Menu,
  X,
  FileSpreadsheet,
} from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";

interface SessionUser {
  userId: string;
  name: string;
  email: string;
  role: "COURIER_ADMIN" | "DRIVER" | "MERCHANT";
}

export default function RoleNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkSession() {
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
    checkSession();
  }, [pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  if (pathname.includes("/waybill")) return null;

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-sm tracking-tight block">Courier Portal</span>
              <span className="text-[10px] text-slate-400">Cedex Logistics</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 text-xs font-semibold ml-4">
            {/* Admin Links */}
            {user?.role === "COURIER_ADMIN" && (
              <>
                <Link
                  href="/admin/parcels"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/admin/parcels" ? "bg-slate-800 text-blue-400 font-semibold" : "text-slate-300 hover:text-white"
                  }`}
                >
                  All Parcels
                </Link>
                <Link
                  href="/admin/dispatch"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/admin/dispatch" ? "bg-slate-800 text-blue-400" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Dispatch Board
                </Link>
                <Link
                  href="/admin/payouts"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/admin/payouts" ? "bg-slate-800 text-emerald-400 font-semibold" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Merchant Payouts
                </Link>
                <Link
                  href="/admin/settlements"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/admin/settlements" ? "bg-slate-800 text-emerald-400" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Cash Settlements
                </Link>
                <Link
                  href="/admin/parcels/print-batch"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/admin/parcels/print-batch" ? "bg-slate-800 text-purple-400" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Batch Waybills
                </Link>
              </>
            )}

            {/* Merchant Links */}
            {user?.role === "MERCHANT" && (
              <>
                <Link
                  href="/merchant/parcels"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/merchant/parcels" ? "bg-slate-800 text-blue-400 font-semibold" : "text-slate-300 hover:text-white"
                  }`}
                >
                  📦 All Parcels
                </Link>
                <Link
                  href="/merchant/parcels/new"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/merchant/parcels/new" ? "bg-slate-800 text-blue-400" : "text-slate-300 hover:text-white"
                  }`}
                >
                  New Order
                </Link>
                <Link
                  href="/merchant/parcels/import"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/merchant/parcels/import" ? "bg-slate-800 text-blue-400" : "text-slate-300 hover:text-white"
                  }`}
                >
                  CSV Bulk Upload
                </Link>
                <Link
                  href="/merchant/payouts"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/merchant/payouts" ? "bg-slate-800 text-emerald-400" : "text-slate-300 hover:text-white"
                  }`}
                >
                  COD Payouts
                </Link>
              </>
            )}

            {/* Driver Links */}
            {user?.role === "DRIVER" && (
              <Link
                href="/driver/run"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === "/driver/run" ? "bg-slate-800 text-emerald-400" : "text-slate-300 hover:text-white"
                }`}
              >
                My Delivery Run
              </Link>
            )}

            {/* Shared Public Link */}
            <Link
              href="/track"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition flex items-center gap-1"
            >
              <Search className="w-3 h-3 text-slate-400" />
              <span>Track Parcel</span>
            </Link>
          </div>
        </div>

        {/* Right side: Language Toggle + User Identity */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />

          {loading ? (
            <div className="w-16 sm:w-20 h-7 bg-slate-800 animate-pulse rounded-lg" />
          ) : user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold leading-none text-slate-200">{user.name}</div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  {user.role === "COURIER_ADMIN" ? "Hub Admin" : user.role}
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
                {user.role === "COURIER_ADMIN" ? "Admin" : user.role}
              </span>

              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur px-4 py-3 space-y-1 text-sm font-medium">
          {user.role === "COURIER_ADMIN" && (
            <>
              <Link
                href="/admin/parcels"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  pathname === "/admin/parcels" ? "bg-slate-800 text-blue-400 font-bold" : "text-slate-300"
                }`}
              >
                <Package className="w-4 h-4" /> All Parcels
              </Link>
              <Link
                href="/admin/dispatch"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  pathname === "/admin/dispatch" ? "bg-slate-800 text-blue-400 font-bold" : "text-slate-300"
                }`}
              >
                <Truck className="w-4 h-4" /> Dispatch Board
              </Link>
              <Link
                href="/admin/payouts"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  pathname === "/admin/payouts" ? "bg-slate-800 text-emerald-400 font-bold" : "text-slate-300"
                }`}
              >
                <Receipt className="w-4 h-4" /> Merchant Payouts
              </Link>
              <Link
                href="/admin/settlements"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  pathname === "/admin/settlements" ? "bg-slate-800 text-emerald-400 font-bold" : "text-slate-300"
                }`}
              >
                <ShieldAlert className="w-4 h-4" /> Cash Settlements
              </Link>
              <Link
                href="/admin/parcels/print-batch"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  pathname === "/admin/parcels/print-batch" ? "bg-slate-800 text-purple-400 font-bold" : "text-slate-300"
                }`}
              >
                <Printer className="w-4 h-4" /> Batch Waybills
              </Link>
            </>
          )}

          {user.role === "MERCHANT" && (
            <>
              <Link
                href="/merchant/parcels"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  pathname === "/merchant/parcels" ? "bg-slate-800 text-blue-400 font-bold" : "text-slate-300"
                }`}
              >
                <Package className="w-4 h-4" /> All Parcels
              </Link>
              <Link
                href="/merchant/parcels/new"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  pathname === "/merchant/parcels/new" ? "bg-slate-800 text-blue-400 font-bold" : "text-slate-300"
                }`}
              >
                ➕ New Order
              </Link>
              <Link
                href="/merchant/parcels/import"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  pathname === "/merchant/parcels/import" ? "bg-slate-800 text-blue-400 font-bold" : "text-slate-300"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" /> CSV Bulk Upload
              </Link>
              <Link
                href="/merchant/payouts"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  pathname === "/merchant/payouts" ? "bg-slate-800 text-emerald-400 font-bold" : "text-slate-300"
                }`}
              >
                <Receipt className="w-4 h-4" /> COD Payouts
              </Link>
            </>
          )}

          {user.role === "DRIVER" && (
            <Link
              href="/driver/run"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                pathname === "/driver/run" ? "bg-slate-800 text-emerald-400 font-bold" : "text-slate-300"
              }`}
            >
              <Truck className="w-4 h-4" /> My Delivery Run
            </Link>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-3">
            <span>Signed in as <b className="text-slate-200">{user.name}</b></span>
            <button onClick={handleLogout} className="text-red-400 hover:underline">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}