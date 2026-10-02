"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Lock, Mail, ArrowRight, ShieldCheck, Globe } from "lucide-react";

export default function LoginPage() {
  const { t, lang, setLang, isRtl } = useLanguage();
  const [email, setEmail] = useState("merchant@cedex.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-600 selection:text-white" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Top Navbar / Language Switcher */}
      <div className="absolute top-6 inset-x-0 px-6 max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight">{t("brandName")}</span>
        </div>

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
              className="w-full bg-slate-900 hover:bg-blue-600 text-white rounded-2xl py-4 font-bold text-base shadow-xl shadow-slate-900/10 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
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

          {/* Quick Demo Fillers */}
          <div className="mt-8 pt-6 border-t border-slate-100">
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