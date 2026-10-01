import Link from "next/link";
import { ArrowLeft, Truck, ShieldCheck, Clock, MapPin, Phone, Mail, Camera } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600 transition">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Operations
          </Link>
          <span className="font-bold text-slate-900 tracking-tight text-base">Cedex Logistics</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">About Cedex Logistics</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Reliable courier, cash-on-delivery (COD) management, and express regional dispatch across Lebanon.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Regional Coverage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full transit coverage spanning Greater Beirut, Mount Lebanon, North, South, and Bekaa with dedicated daily run-sheets.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Secure COD Settlements</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Guaranteed cash-on-delivery collection in both USD and LBP with rapid merchant payout reconciliation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Same-Day & Exchange</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Express urban dispatch and dedicated reverse-logistics for commercial retail return & exchange orders.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="font-bold text-slate-900 text-sm">Central Hub & Direct Operations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Hamra Central Logistics Hub, Beirut, Lebanon</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Lebanon: +961 3 448 482 | Direct: +90 545 682 8864</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span>mnaouchi@outlook.com</span>
            </p>
            <p className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Instagram: @steve.naouchi</span>
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="flex justify-center items-center gap-6 mb-2 text-slate-500">
          <Link href="/about" className="hover:text-slate-800 font-semibold transition">About</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-slate-800 transition">Privacy Policy</Link>
        </div>
        <p>© {new Date().getFullYear()} Cedex Logistics. All rights reserved.</p>
      </footer>
    </div>
  );
}