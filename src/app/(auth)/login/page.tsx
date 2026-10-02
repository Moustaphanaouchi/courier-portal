"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Lock, Mail, ArrowRight, ShieldCheck, Globe, AlertCircle, Store } from "lucide-react";

function LoginForm() {
  const { t, lang, setLang, isRtl } = useLanguage();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("merchant@demo.com");
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      if (callbackUrl && !callbackUrl.startsWith("/login")) {
        window.location.href = callbackUrl;
        return;
      }

      if (data.user?.role === "COURIER_ADMIN") {
        window.location.href = "/admin/dispatch";
      } else if (data.user?.role === "DRIVER") {
        window.location.href = "/driver/run";
      } else {
        window.location.href = "/merchant/parcels";
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
      setLoading(false);
    }
  }

  function fillDemo(role: "admin" | "merchant" | "driver") {
    setError(null);
    if (role === "admin") {
      setEmail("admin@demo.com");
      setPassword("Password123!");
    } else if (role === "merchant") {
      setEmail("merchant@demo.com");
      setPassword("Password123!");
    } else {
      setEmail("driver@demo.com");
      setPassword("Password123!");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-600 selection:text-white" dir={isRtl ? "rtl" : "ltr"}>
      {/* Top Navbar / Language Switcher */}
      <div className="absolute top-6 inset-x-0 px-6 max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 font-black text-sm">
            CX
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight">{t("brandName")}</span>
        </Link>

        <button
          type="button"
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Globe className="w-4 h-4 text-blue-600" />
          <span>{lang === "en" ? "العربية" : "English"}</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-10">
        <div className="bg-white py-10 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-200/80">
          <div className="mb-8 text-center sm:text-start">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t("loginHeader")}
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-2">
              {t("loginSubtitle")}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {t("emailAddress")}
              </label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  required
                  className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-400 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {t("password")}
              </label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  required
                  className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-400 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white rounded-2xl py-4 font-bold text-base shadow-xl shadow-slate-900/10 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{t("signIn")}</span>
                  <ArrowRight className={`w-4 h-4 opacity-80 ${isRtl ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
          </form>

          {/* Register Prompt for Merchants */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-3">
              {lang === "ar" ? "هل تملك متجراً وتريد الشحن معنا؟" : "Own an e-commerce store or retail brand?"}
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl border-2 border-blue-600/30 hover:border-blue-600 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-bold transition shadow-xs"
            >
              <Store className="w-4 h-4" />
              <span>{lang === "ar" ? "إنشاء حساب متجر جديد مجاناً" : "Create Merchant Account"}</span>
            </Link>
          </div>

          {/* Quick Demo Fillers */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              {t("quickFillDemo")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("admin")}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
              >
                {t("hubAdmin")}
              </button>
              <button
                type="button"
                onClick={() => fillDemo("merchant")}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
              >
                {t("merchant")}
              </button>
              <button
                type="button"
                onClick={() => fillDemo("driver")}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
              >
                {t("driver")}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 font-medium mt-6">
          {t("footerSecurityNotice")}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center" />}>
      <LoginForm />
    </Suspense>
  );
}
