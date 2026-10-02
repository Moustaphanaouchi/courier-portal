"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Lock, Mail, ArrowRight, ShieldCheck, Globe } from "lucide-react";

export default function LoginPage() {
  const { t, lang, setLang, isRtl } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate hard navigation login redirect
    setTimeout(() => {
      window.location.href = "/merchant/parcels";
    }, 600);
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
      
      {/* Background Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Top Bar: Language Switcher */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-black tracking-tight text-xl">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span>{t("brandName")}</span>
          </div>

          <button 
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "en" ? "العربية" : "English"}
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 border border-white/20 shadow-2xl shadow-blue-950/50">
          
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t("loginHeader") || "Sign in to your account"}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-2">
              {t("loginSubtitle")}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("emailAddress")}</label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  required
                  className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-400 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("password")}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  required
                  className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-400 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
                  dir="ltr"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white rounded-2xl py-4 font-bold text-base shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
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

          {/* Quick Fill Demo Accounts */}
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

        {/* Footer Notice */}
        <p className="text-center text-xs text-slate-500 font-medium">
          {t("footerSecurityNotice")}
        </p>

      </div>
    </div>
  );
}