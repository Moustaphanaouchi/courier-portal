import Link from "next/link";
import { Package, ShieldCheck, MapPin, Truck, Phone, ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 hover:opacity-80 transition">
            <Package className="w-5 h-5 text-blue-600" />
            <span>Cedex Logistics</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Company Overview</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">About Cedex Logistics</h1>
          <p className="text-slate-600 leading-relaxed text-sm md:text-base">
            Cedex Logistics is a next-generation logistics and dispatch platform built specifically for the Lebanese e-commerce market. We bridge the gap between local retail merchants, couriers, and end customers through automated dispatching, multi-currency cash-on-delivery (USD & LBP) tracking, and prompt settlement processing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-900 text-base">Nationwide Coverage</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Operating across Beirut, Mount Lebanon, Tripoli, the North, Sidon, Tyre, and the Bekaa with dedicated regional hubs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-900 text-base">Dual-Currency COD</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time handling of USD and Lebanese Pound cash collections with automated daily reconciliations and direct payouts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-900 text-base">Live WhatsApp Tracking</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instant parcel status updates, automated delivery notifications, and waybill barcode scanning for customers and merchants.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
          <h2 className="font-bold text-slate-900 text-sm">Central Hub & Support Desk</h2>
          <p className="text-xs text-slate-600 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            Hamra Central Logistics Hub, Beirut, Lebanon
          </p>
          <p className="text-xs text-slate-600 flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            Support: +961 3 448 482 | Direct: +90 545 682 8864</p>
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="flex justify-center items-center gap-6 mb-2 text-slate-500">
          <Link href="/about" className="hover:text-slate-800 font-semibold transition">About</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-slate-800 transition">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-slate-800 transition">Terms of Service</Link>
        </div>
        <p className="text-[11px] text-slate-400">© 2026 Cedex Logistics. All rights reserved.</p>
      </footer>
    </div>
  );
}
