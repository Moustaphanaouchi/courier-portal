import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Legal & Transparency</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Privacy Policy</h1>
          <p className="text-xs text-slate-400 mt-1">Last updated: September 2026</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              To process parcel shipments and execute door-to-door courier services in Lebanon, Cedex Logistics collects:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li><strong>Merchant Information:</strong> Store/business name, contact phone number, email address, and pickup address.</li>
              <li><strong>Recipient Information:</strong> Customer full name, mobile number, governorate, destination address, and optional landmarks.</li>
              <li><strong>Financial Data:</strong> COD values (in USD or LBP), remittance preferences (Whish Money, OMT, bank wire, or office cash pickup).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. How Information Is Used</h2>
            <p>
              All customer data is strictly utilized for dispatch planning, driver route optimization, automated SMS/WhatsApp delivery alerts, and cash-on-delivery settlement. We do not sell or rent merchant client lists or buyer records to any third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Data Security & Multi-Tenant Isolation</h2>
            <p>
              Our infrastructure employs strict role-based access control (RBAC). Merchants have zero visibility into other stores' consignments, earnings, or customer databases. All session keys and passwords are salted and hashed using industry-standard cryptography.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Contact Inquiries</h2>
            <p>
              For privacy inquiries, data deletion requests, or merchant account management, contact our compliance team at <strong>mnaouchi@outlook.com</strong>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="flex justify-center items-center gap-6 mb-2 text-slate-500">
          <Link href="/about" className="hover:text-slate-800 transition">About</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-slate-800 font-semibold transition">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-slate-800 transition">Terms of Service</Link>
        </div>
        <p className="text-[11px] text-slate-400">© 2026 Cedex Logistics. All rights reserved.</p>
      </footer>
    </div>
  );
}
