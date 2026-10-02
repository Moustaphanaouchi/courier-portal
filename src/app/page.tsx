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
    <main className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Hero Section with Clean White Background & Subtle Border */}
      <div className="relative border-b border-slate-100 bg-linear-to-b from-slate-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            {t("homeBadge")}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 max-w-4xl mx-auto leading-tight">
            {t("homeHeroTitle")}
          </h1>

          <p className="mt-4 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t("homeHeroSubtitle")}
          </p>

          {/* Prominent Interactive Live Tracking Search Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <form onSubmit={handleTrackSubmit} className="relative flex items-center">
              <div className="relative w-full">
                <Search className={`w-5 h-5 absolute top-3.5 text-slate-400 pointer-events-none ${
                  isRtl ? "right-4" : "left-4"
                }`} />
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder={t("trackInputPlaceholder") || "Enter tracking code (e.g. CDX-882194)..."}
                  className={`w-full py-3.5 text-sm sm:text-base bg-white border border-slate-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition placeholder:text-slate-400 text-slate-900 ${
                    isRtl ? "pr-12 pl-28 text-right" : "pl-12 pr-28 text-left"
                  }`}
                  dir="ltr"
                />
                <button
                  type="submit"
                  className={`absolute top-2 bottom-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 ${
                    isRtl ? "left-2" : "right-2"
                  }`}
                >
                  <span>{t("trackBtn")}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Sign In Link */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
            >
              <span>{t("signIn")}</span>
              <ChevronRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
          </div>
        </div>
      </div>

      {/* Operations Navigation Cards (Crisp White Cards on Soft Slate Surface) */}
      <div className="bg-slate-50/70 border-b border-slate-100 flex-1 w-full py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Hub Dispatch Board */}
            <Link
              href="/admin/dispatch"
              className="group relative flex flex-col justify-between p-6 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-blue-300 rounded-2xl transition duration-200 shadow-2xs hover:shadow-sm"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                  {t("cardDispatchTitle")}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {t("cardDispatchDesc")}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                <span>{t("cardDispatchBtn")}</span>
                <ArrowRight className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
              </div>
            </Link>

            {/* Card 2: Cash Settlements */}
            <Link
              href="/admin/settlements"
              className="group relative flex flex-col justify-between p-6 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-emerald-300 rounded-2xl transition duration-200 shadow-2xs hover:shadow-sm"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition">
                  {t("cardSettlementsTitle")}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {t("cardSettlementsDesc")}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span>{t("cardSettlementsBtn")}</span>
                <ArrowRight className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
              </div>
            </Link>

            {/* Card 3: Batch Waybill Printing */}
            <Link
              href="/admin/parcels/print-batch"
              className="group relative flex flex-col justify-between p-6 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-indigo-300 rounded-2xl transition duration-200 shadow-2xs hover:shadow-sm"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <Printer className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {t("cardBatchPrintTitle")}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {t("cardBatchPrintDesc")}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                <span>{t("cardBatchPrintBtn")}</span>
                <ArrowRight className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
              </div>
            </Link>

            {/* Card 4: Driver Mobile Run Sheet */}
            <Link
              href="/driver/run"
              className="group relative flex flex-col justify-between p-6 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-purple-300 rounded-2xl transition duration-200 shadow-2xs hover:shadow-sm"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition">
                  {t("cardDriverRunTitle")}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {t("cardDriverRunDesc")}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-purple-600">
                <span>{t("cardDriverRunBtn")}</span>
                <ArrowRight className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
              </div>
            </Link>

            {/* Card 5: Book Single Parcel */}
            <Link
              href="/merchant/parcels/new"
              className="group relative flex flex-col justify-between p-6 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-amber-300 rounded-2xl transition duration-200 shadow-2xs hover:shadow-sm"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition">
                  {t("cardBookParcelTitle")}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {t("cardBookParcelDesc")}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                <span>{t("cardBookParcelBtn")}</span>
                <ArrowRight className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
              </div>
            </Link>

            {/* Card 6: Bulk CSV Manifest Ingestion */}
            <Link
              href="/merchant/parcels/import"
              className="group relative flex flex-col justify-between p-6 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-cyan-300 rounded-2xl transition duration-200 shadow-2xs hover:shadow-sm"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-600 transition">
                  {t("cardBulkCsvTitle")}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {t("cardBulkCsvDesc")}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-cyan-600">
                <span>{t("cardBulkCsvBtn")}</span>
                <ArrowRight className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
              </div>
            </Link>

            {/* Card 7: Merchant Payout Statements */}
            <Link
              href="/merchant/payouts"
              className="group relative flex flex-col justify-between p-6 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-emerald-300 rounded-2xl transition duration-200 shadow-2xs hover:shadow-sm lg:col-span-3"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition">
                  {t("cardMerchantPayoutTitle")}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {t("cardMerchantPayoutDesc")}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span>{t("cardMerchantPayoutBtn")}</span>
                <ArrowRight className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer (Light Theme) */}
      <footer className="border-t border-slate-100 bg-white py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-3">
        <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-600">
          <Link href="/about" className="hover:text-slate-900 transition">
            {t("footerAbout")}
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-slate-900 transition">
            {t("footerPrivacy")}
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-slate-900 transition">
            {t("footerTerms")}
          </Link>
        </div>
        <p className="text-[11px] text-slate-400">
          {t("footerSecurityNotice")}
        </p>
      </footer>
    </main>
  );
}