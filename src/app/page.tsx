"use client";

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
  ShieldCheck,
  Building2,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t, isRtl } = useLanguage();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            {t("homeBadge")}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            {t("homeHeroTitle")}
          </h1>

          <p className="mt-4 text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t("homeHeroSubtitle")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/track"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{t("trackBtn")}</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 font-semibold text-sm transition cursor-pointer"
            >
              <span>{t("signIn")}</span>
              <ChevronRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
          </div>
        </div>
      </div>

      {/* Operations Navigation Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Hub Dispatch Board */}
          <Link
            href="/admin/dispatch"
            className="group relative flex flex-col justify-between p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl transition duration-200"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                {t("cardDispatchTitle")}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t("cardDispatchDesc")}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-blue-400">
              <span>{t("cardDispatchBtn")}</span>
              <ArrowRight className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
            </div>
          </Link>

          {/* Card 2: Cash Settlements */}
          <Link
            href="/admin/settlements"
            className="group relative flex flex-col justify-between p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl transition duration-200"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                {t("cardSettlementsTitle")}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t("cardSettlementsDesc")}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span>{t("cardSettlementsBtn")}</span>
              <ArrowRight className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
            </div>
          </Link>

          {/* Card 3: Batch Waybill Printing */}
          <Link
            href="/admin/parcels/print-batch"
            className="group relative flex flex-col justify-between p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl transition duration-200"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Printer className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition">
                {t("cardBatchPrintTitle")}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t("cardBatchPrintDesc")}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
              <span>{t("cardBatchPrintBtn")}</span>
              <ArrowRight className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
            </div>
          </Link>

          {/* Card 4: Driver Mobile Run Sheet */}
          <Link
            href="/driver/run"
            className="group relative flex flex-col justify-between p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-2xl transition duration-200"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition">
                {t("cardDriverRunTitle")}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t("cardDriverRunDesc")}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-purple-400">
              <span>{t("cardDriverRunBtn")}</span>
              <ArrowRight className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
            </div>
          </Link>

          {/* Card 5: Book Single Parcel */}
          <Link
            href="/merchant/parcels/new"
            className="group relative flex flex-col justify-between p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition duration-200"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                {t("cardBookParcelTitle")}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t("cardBookParcelDesc")}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <span>{t("cardBookParcelBtn")}</span>
              <ArrowRight className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
            </div>
          </Link>

          {/* Card 6: Bulk CSV Manifest Ingestion */}
          <Link
            href="/merchant/parcels/import"
            className="group relative flex flex-col justify-between p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl transition duration-200"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">
                {t("cardBulkCsvTitle")}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t("cardBulkCsvDesc")}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
              <span>{t("cardBulkCsvBtn")}</span>
              <ArrowRight className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
            </div>
          </Link>

          {/* Card 7: Merchant Payout Statements */}
          <Link
            href="/merchant/payouts"
            className="group relative flex flex-col justify-between p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl transition duration-200 lg:col-span-3"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                {t("cardMerchantPayoutTitle")}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t("cardMerchantPayoutDesc")}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span>{t("cardMerchantPayoutBtn")}</span>
              <ArrowRight className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-3">
        <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-400">
          <Link href="/about" className="hover:text-slate-200 transition">
            {t("footerAbout")}
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-slate-200 transition">
            {t("footerPrivacy")}
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-slate-200 transition">
            {t("footerTerms")}
          </Link>
        </div>
        <p className="text-[11px] text-slate-600">
          {t("footerSecurityNotice")}
        </p>
      </footer>
    </main>
  );
}