import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";

export default function TermsPage() {
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

      <main className="max-w-3xl mx-auto px-4 py-12 w-full space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Agreement</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Terms of Service</h1>
          <p className="text-xs text-slate-400 mt-1">Effective Date: September 2026</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Scope of Services</h2>
            <p>
              Cedex Logistics provides parcel collection, regional hub sortation, last-mile delivery, and cash collection throughout the Lebanese territory. By booking shipments on our portal, merchants agree to comply with Lebanese transport laws and transport standards.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Cash-on-Delivery (COD) & Remittances</h2>
            <p>
              Couriers collect cash payments from recipients upon parcel handover according to the currency specified on the package (USD or LBP). Net merchant payouts (gross COD minus standard delivery fees) are settled according to agreed schedules via Whish Money, OMT, direct cash dispatch, or Lebanese bank transfers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Prohibited Goods & Packaging</h2>
            <p>
              Merchants must properly package fragile items. Cedex Logistics prohibits the transport of counterfeit goods, unlicensed firearms, hazardous materials, illegal substances, and any materials prohibited under Lebanese penal legislation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Undelivered & Returned Parcels</h2>
            <p>
              In cases of incorrect recipient details, repeated customer unavailability, or delivery refusal, shipments will be flagged as Failed Delivery and safely returned to the dispatch hub for merchant retrieval or re-attempt.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="flex justify-center items-center gap-6 mb-2 text-slate-500">
          <Link href="/about" className="hover:text-slate-800 transition">About</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-slate-800 transition">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-slate-800 font-semibold transition">Terms of Service</Link>
        </div>
        <p className="text-[11px] text-slate-400">© 2026 Cedex Logistics. All rights reserved.</p>
      </footer>
    </div>
  );
}