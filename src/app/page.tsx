"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Package, 
  Truck, 
  Receipt, 
  ShieldAlert, 
  ArrowRight, 
  UploadCloud, 
  Search, 
  Printer,
  CheckCircle2,
  Lock
} from "lucide-react";

interface SessionUser {
  userId: string;
  name: string;
  role: "COURIER_ADMIN" | "DRIVER" | "MERCHANT";
}

export default function HomePage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingCode, setTrackingCode] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 flex flex-col justify-between">
      <main className="max-w-6xl mx-auto px-4 py-10 w-full flex-1">
        {/* Banner Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
            {user ? `${user.role.replace(/_/g, " ")} WORKSPACE` : "PUBLIC LOGISTICS PLATFORM"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {user ? `Welcome back, ${user.name}` : "Lebanese Regional Courier Engine"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Multi-currency USD & LBP cash-on-delivery tracking, hub dispatching, and automated settlements.
          </p>
        </div>

        {/* Public Parcel Quick Search Bar */}
        <div className="max-w-xl mx-auto mb-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (trackingCode.trim()) {
                window.location.href = `/track/${trackingCode.trim().toUpperCase()}`;
              }
            }}
            className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500"
          >
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Track any shipment by waybill (e.g. LB-2026-XXXXXX)..."
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className="w-full text-xs sm:text-sm px-2 py-2 outline-none font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shrink-0"
            >
              Track
            </button>
          </form>
        </div>

        {/* Filtered Grid by Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Admin Cards */}
          {(user?.role === "COURIER_ADMIN" || !user) && (
            <>
              <Link
                href="/admin/dispatch"
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-500 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-purple-600 transition">
                      Hub Dispatch Board
                    </h3>
                    {!user && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Assign incoming parcels to drivers by Lebanese governorate and trigger WhatsApp tracking webhooks.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700">
                  <span>Open Dispatch</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link
                href="/admin/settlements"
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-600 transition">
                      Cash Settlements
                    </h3>
                    {!user && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Reconcile physical USD and LBP cash handed over by drivers at the hub counter.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                  <span>Reconcile Cash</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link
                href="/admin/parcels/print-batch"
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition">
                      Batch Waybill Printing
                    </h3>
                    {!user && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Continuous 4×6 inch thermal roll printing with scannable barcodes.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
                  <span>Print Labels</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            </>
          )}

          {/* Driver Cards */}
          {(user?.role === "DRIVER" || !user) && (
            <Link
              href="/driver/run"
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-600 transition">
                    Driver Mobile Run Sheet
                  </h3>
                  {!user && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Mobile view with customer calling, WhatsApp routing, camera barcode scanner, and live cash tallies.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Start Run</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          )}

          {/* Merchant Cards */}
          {(user?.role === "MERCHANT" || !user) && (
            <>
              <Link
                href="/merchant/parcels/new"
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition">
                      Book Single Parcel
                    </h3>
                    {!user && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Register delivery orders with Lebanese regional governorates and dual USD/LBP COD.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
                  <span>Create Order</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link
                href="/merchant/parcels/import"
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition">
                      Bulk CSV Manifest Ingestion
                    </h3>
                    {!user && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload Shopify/WooCommerce CSV exports to generate dozens of waybills in seconds.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
                  <span>Upload Manifest</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link
                href="/merchant/payouts"
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-600 transition">
                      Merchant Payout Statements
                    </h3>
                    {!user && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Track gross COD collected, deducted delivery fees, and net payable balances.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                  <span>View Statement</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="flex justify-center items-center gap-6 mb-3 text-xs font-medium text-slate-500">
          <Link href="/about" className="hover:text-slate-800 transition">About</Link>
          <span className="text-slate-300">•</span>
          <Link href="/privacy" className="hover:text-slate-800 transition">Privacy Policy</Link>
          <span className="text-slate-300">•</span>
          <Link href="/terms" className="hover:text-slate-800 transition">Terms of Service</Link>
        </div>
        <p className="text-[11px] text-slate-400">
          Courier & Logistics Management System • Multi-Tenant RBAC Isolation Enforced
        </p>
      </footer>
    </div>
  );
}