"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const [lang, setLang] = useState<"en" | "ar">("en");

  useEffect(() => {
    const saved = (localStorage.getItem("cedex_lang") as "en" | "ar") || "en";
    setLang(saved);
    applyLanguage(saved);
  }, []);

  function applyLanguage(selected: "en" | "ar") {
    document.documentElement.lang = selected;
    document.documentElement.dir = selected === "ar" ? "rtl" : "ltr";
    localStorage.setItem("cedex_lang", selected);
  }

  function toggleLanguage() {
    const nextLang = lang === "en" ? "ar" : "en";
    setLang(nextLang);
    applyLanguage(nextLang);
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title={lang === "en" ? "تبديل إلى العربية (RTL)" : "Switch to English (LTR)"}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
    >
      <Languages className="w-3.5 h-3.5 text-blue-400" />
      <span>{lang === "en" ? "العربية" : "English"}</span>
    </button>
  );
}