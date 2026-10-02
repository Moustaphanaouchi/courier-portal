"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      aria-label="Toggle language"
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors duration-150 backdrop-blur"
    >
      <Globe className="w-3.5 h-3.5 text-sky-400" />
      <span>{lang === "en" ? "العربية" : "English"}</span>
    </button>
  );
}