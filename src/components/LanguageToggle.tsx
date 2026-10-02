"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLang}
      title={lang === "en" ? "تبديل إلى العربية" : "Switch to English"}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
    >
      <Languages className="w-3.5 h-3.5 text-blue-400" />
      <span>{lang === "en" ? "العربية" : "English"}</span>
    </button>
  );
}