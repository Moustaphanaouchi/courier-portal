"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  Package,
  Layers,
  Search,
  Receipt,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  DollarSign,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const router = useRouter();
  const { t, isRtl } = useLanguage();
  const [trackingCode, setTrackingCode] = useState("");

  function handleTrackSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = trackingCode.trim().toUpperCase();
    if (!cleaned) return;
    router.push(`/track/${cleaned}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      
      {/* --- HERO SECTION --- */}
      {/* Stunning subtle mesh/radial gradient background */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/80 via-white to-white pointer-events-none"></div>
        
        {/* Decorative background grid (subtle) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          
          {/* Glowing Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide bg-white text-slate-700 border border-slate-200 shadow-sm mb-8 hover:shadow-md transition-shadow cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            {t("homeBadge")}
          </div>

          {/* Premium Gradient Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] pb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
              {t("homeHeroTitle")}
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            {t("homeHeroSubtitle")}
          </p>

          {/* Spotlight Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto relative group z-10">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2rem] blur-md opacity-25 group-hover:opacity-40 transition duration-500"></div>
            
            <form onSubmit={handleTrackSubmit} className="relative flex items-center bg-white/90 backdrop-blur-xl rounded-[1.75rem] border border-white/40 shadow-xl shadow-slate-200/50 p-1.5 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all">
              <Search className={`w-6 h-6 absolute text-slate-400 pointer-events-none ${isRtl ? "right-5" : "left-5"}`} />
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder={t("trackInputPlaceholder") || "Enter tracking code (e.g. CDX-882194)..."}
                className={`w-full py-4 text-base bg-transparent focus:outline-none placeholder:text-slate-400 text-slate-900 font-medium ${
                  isRtl ? "pr-14 pl-32 text-right" : "pl-14 pr-32 text-left"
                }`}
                dir="ltr"
              />
              <button
                type="submit"
                className={`absolute top-1.5 bottom-1.5 px-6 sm:px-8 bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm rounded-2xl transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                  isRtl ? "left-1.5" : "right-1.5"
                }`}
              >
                <span>{t("trackBtn")}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
              </button>
            </form>
          </div>

          {/* Sign In & Admin Link */}
          <div className="mt-8 flex items-center justify-center">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>{t("signIn")}</span>
              <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
            </Link>
          </div>
        </div>
      </div>

      {/* --- OPERATIONS GRID --- */}
      <div className="flex-1 w-full py-16 bg-slate-50/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Hub Dispatch Board */}
            <Link href="/admin/dispatch" className="group relative bg-white p-7 rounded-[2rem] border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
                <Truck className="w-32 h-32" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                {t("cardDispatchTitle")}
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed font-medium">
                {t("cardDispatchDesc")}
              </p>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-blue-600">
                <span>{t("cardDispatchBtn")}</span>
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1.5 ${isRtl ? "rotate-180 group-hover:-translate-x-1.5" : ""}`} />
              </div>
            </Link>

            {/* Card 2: Cash Settlements */}
            <Link href="/admin/settlements" className="group relative bg-white p-7 rounded-[2rem] border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
                <Receipt className="w-32 h-32" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {t("cardSettlementsTitle")}
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed font-medium">
                {t("cardSettlementsDesc")}
              </p>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-emerald-600">
                <span>{t("cardSettlementsBtn")}</span>
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1.5 ${isRtl ? "rotate-180 group-hover:-translate-x-1.5" : ""}`} />
              </div>
            </Link>

            {/* Card 3: Batch Waybill Printing */}
            <Link href="/admin/parcels/print-batch" className="group relative bg-white p-7 rounded-[2rem] border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
                <Printer className="w-32 h-32" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {t("cardBatchPrintTitle")}
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed font-medium">
                {t("cardBatchPrintDesc")}
              </p>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-indigo-600">
                <span>{t("cardBatchPrintBtn")}</span>
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1.5 ${isRtl ? "rotate-180 group-hover:-translate-x-1.5" : ""}`} />
              </div>
            </Link>

            {/* Card 4: Driver Mobile Run Sheet */}
            <Link href="/driver/run" className="group relative bg-white p-7 rounded-[2rem] border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-purple-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
                <Layers className="w-32 h-32" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
                {t("cardDriverRunTitle")}
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed font-medium">
                {t("cardDriverRunDesc")}
              </p>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-purple-600">
                <span>{t("cardDriverRunBtn")}</span>
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1.5 ${isRtl ? "rotate-180 group-hover:-translate-x-1.5" : ""}`} />
              </div>
            </Link>

            {/* Card 5: Book Single Parcel */}
            <Link href="/merchant/parcels/new" className="group relative bg-white p-7 rounded-[2rem] border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-amber-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
                <Package className="w-32 h-32" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                {t("cardBookParcelTitle")}
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed font-medium">
                {t("cardBookParcelDesc")}
              </p>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-amber-600">
                <span>{t("cardBookParcelBtn")}</span>
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1.5 ${isRtl ? "rotate-180 group-hover:-translate-x-1.5" : ""}`} />
              </div>
            </Link>

            {/* Card 6: Bulk CSV Manifest Ingestion */}
            <Link href="/merchant/parcels/import" className="group relative bg-white p-7 rounded-[2rem] border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-cyan-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
                <FileSpreadsheet className="w-32 h-32" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-cyan-600 transition-colors">
                {t("cardBulkCsvTitle")}
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed font-medium">
                {t("cardBulkCsvDesc")}
              </p>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-cyan-600">
                <span>{t("cardBulkCsvBtn")}</span>
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1.5 ${isRtl ? "rotate-180 group-hover:-translate-x-1.5" : ""}`} />
              </div>
            </Link>

            {/* Card 7: Merchant Payout Statements (Spans full width on large screens) */}
            <Link href="/merchant/payouts" className="group relative bg-white p-7 rounded-[2rem] border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden lg:col-span-3">
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
                <DollarSign className="w-64 h-64" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {t("cardMerchantPayoutTitle")}
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed font-medium lg:max-w-3xl">
                {t("cardMerchantPayoutDesc")}
              </p>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-emerald-600">
                <span>{t("cardMerchantPayoutBtn")}</span>
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1.5 ${isRtl ? "rotate-180 group-hover:-translate-x-1.5" : ""}`} />
              </div>
            </Link>
            
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-200/60 bg-white py-10 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="flex items-center justify-center gap-6 text-sm font-bold text-slate-500">
          <Link href="/about" className="hover:text-blue-600 transition-colors">{t("footerAbout")}</Link>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <Link href="/privacy" className="hover:text-blue-600 transition-colors">{t("footerPrivacy")}</Link>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <Link href="/terms" className="hover:text-blue-600 transition-colors">{t("footerTerms")}</Link>
        </div>
        <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          {t("footerSecurityNotice")}
        </p>
      </footer>
    </main>
  );
}