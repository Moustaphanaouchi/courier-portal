"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Lock, Mail, ArrowRight, ShieldCheck, Globe, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { t, lang, setLang, isRtl } = useLanguage();
  const [email, setEmail] = useState("merchant@cedex.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Hard navigate instantly to clear all state cache
    setTimeout(() => {
      window.location.href = "/merchant/parcels";
    }, 400);
  }

  function fillDemo(role: "admin" | "merchant" | "driver") {
    if (role === "admin") {
      setEmail("admin@cedex.com");
      setPassword("password123");
    } else if (role === "merchant") {
      setEmail("merchant@cedex.com");
      setPassword("password123");
    } else {
      setEmail("driver@cedex.com");
      setPassword("password123");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Header Branding & Language Toggle */}
        <div className="flex justify-between items-center bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2.5 text-white font-extrabold tracking-tight text-lg">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span>{t("brandName")}</span>
          </div>

          <button 
            type="button"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700/60 flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === "en" ? "العربية" : "English"}</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 border border-slate-800 shadow-2xl shadow-black/80">
          
          <div className="mb-8 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("operationsHub")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t("loginHeader")}
            </h1>
            <p className="text-sm font-medium text-slate-400">
              {t("loginSubtitle")}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t("emailAddress")}</label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  required
                  className={`w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3.5 text-sm font-medium text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-600 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t("password")}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  required
                  className={`w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3.5 text-sm font-medium text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-600 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
                  dir="ltr"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-4 font-bold text-base shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{t("signIn")}</span>
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

          </form>

          {/* Quick Demo Fillers */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              {t("quickFillDemo")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                type="button" 
                onClick={() => fillDemo("admin")}
                className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center border border-slate-700/40"
              >
                {t("hubAdmin")}
              </button>
              <button 
                type="button" 
                onClick={() => fillDemo("merchant")}
                className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center border border-slate-700/40"
              >
                {t("merchant")}
              </button>
              <button 
                type="button" 
                onClick={() => fillDemo("driver")}
                className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center border border-slate-700/40"
              >
                {t("driver")}
              </button>
            </div>
          </div>

        </div>

        {/* Security Footer Notice */}
        <p className="text-center text-xs text-slate-500 font-medium px-4">
          {t("footerSecurityNotice")}
        </p>

      </div>
    </div>
  );
}