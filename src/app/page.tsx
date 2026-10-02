"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Truck,
  Banknote,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Building2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function HomePage() {
  const [trackingInput, setTrackingInput] = useState("");
  const router = useRouter();
  const { t, lang } = useLanguage();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const code = trackingInput.trim().toUpperCase();
    if (code) {
      router.push(`/track/${code}`);
    }
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-center">
        {/* Ambient Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/60 text-blue-300 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>{lang === "ar" ? "شبكة التوصيل الوطنية اللبنانية" : "Lebanon Regional Delivery Network"}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          {lang === "ar" ? (
            <>
              توصيل سريع وموثوق للطرود مع إدارة <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">الدفع عند الاستلام</span>
            </>
          ) : (
            <>
              Fast, Regional Parcel Delivery & Automated <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">COD Handling</span>
            </>
          )}
        </h1>

        <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          {t("brandTagline")}
        </p>

        {/* Quick Track Input Bar */}
        <form onSubmit={handleTrack} className="mt-8 max-w-md mx-auto flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl shadow-blue-950/40">
          <div className="relative flex-1">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 ${lang === "ar" ? "right-3" : "left-3"}`} />
            <input
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder={t("trackingPlaceholder")}
              className={`w-full bg-transparent py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none uppercase ${
                lang === "ar" ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
              }`}
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs sm:text-sm text-white transition flex items-center gap-1.5 shrink-0"
          >
            <span>{t("trackBtn")}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${lang === "ar" ? "rotate-180" : ""}`} />
          </button>
        </form>

        {/* Role Shortcuts */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-2"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>{t("merchantLogin")}</span>
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-2"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t("driverPortal")}</span>
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-2"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>{t("adminPortal")}</span>
          </Link>
        </div>
      </section>

      {/* Value Props Grid */}
      <section className="border-t border-slate-900 bg-slate-900/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-8">
            {t("servicesTitle")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-blue-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-900/40 text-blue-400 flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">{t("serviceSameDay")}</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                {t("serviceSameDayDesc")}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/40 text-emerald-400 flex items-center justify-center mb-4">
                <Banknote className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">{t("serviceCod")}</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                {t("serviceCodDesc")}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-sky-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-sky-900/40 text-sky-400 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">{t("serviceCoverage")}</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                {t("serviceCoverageDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>&copy; 2026 Cedex Logistics. {t("allRights")}</p>
      </footer>
    </main>
  );
}