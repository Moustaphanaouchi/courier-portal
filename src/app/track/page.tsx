"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ArrowLeft, Package, ShieldCheck, MapPin } from "lucide-react";

export default function TrackSearchPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim()) {
      router.push("/track/" + encodeURIComponent(code.trim().toUpperCase()));
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition">
          <ArrowLeft className="w-4 h-4 mr-1" /> Home Portal
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Track Your Shipment</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Enter the tracking number printed on your waybill or received via WhatsApp.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. LB-2026-XXXXXX"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Track Order
            </button>
          </form>

          <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-slate-100 text-left text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Real-time COD & status verification</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>Direct destination routing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}