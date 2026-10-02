"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TrackSearchPage() {
  const [code, setCode] = useState("");
  const router = useRouter();
  const { t, lang } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) {
      router.push(`/track/${trimmed}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
          <Package className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold text-center text-white">
          {t("trackParcel")}
        </h1>
        <p className="text-center text-slate-400 text-xs mt-1">
          {lang === "ar"
            ? "أدخل رقم البوليصة لمتابعة حالة الشحنة في الوقت الفعلي"
            : "Enter your waybill code for live delivery milestones"}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              {lang === "ar" ? "رقم البوليصة" : "Tracking Number"}
            </label>
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 ${lang === "ar" ? "right-3" : "left-3"}`} />
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="LB-2026-XXXXXX"
                className={`w-full py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 uppercase ${
                  lang === "ar" ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm text-white transition flex items-center justify-center gap-2"
          >
            <span>{t("trackBtn")}</span>
            <ArrowRight className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
          </button>
        </form>
      </div>
    </div>
  );
}