"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ar";

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const translations: Translations = {
  brandName: { en: "Cedex Logistics", ar: "سيدكس للخدمات اللوجستية" },
  brandTagline: {
    en: "Fast, reliable parcel delivery & COD handling across Lebanon",
    ar: "توصيل سريع وموثوق للطرود وإدارة الدفع عند الاستلام في جميع أنحاء لبنان"
  },
  trackParcel: { en: "Track Parcel", ar: "تتبع شحنتك" },
  trackingPlaceholder: { en: "Enter tracking number (e.g. LB-2026-XXXXXX)", ar: "أدخل رقم التتبع (مثال: LB-2026-XXXXXX)" },
  trackBtn: { en: "Track", ar: "تتبع" },
  merchantLogin: { en: "Client Portal", ar: "بوابة العملاء" },
  driverPortal: { en: "Driver Access", ar: "بوابة السائقين" },
  adminPortal: { en: "Operations Hub", ar: "مركز العمليات" },
  servicesTitle: { en: "Why Businesses Choose Cedex", ar: "لماذا تختار الشركات سيدكس" },
  serviceSameDay: { en: "Same-Day Delivery", ar: "توصيل في نفس اليوم" },
  serviceSameDayDesc: { en: "Guaranteed rapid dispatch across Beirut & Mount Lebanon.", ar: "توصيل سريع ومضمون عبر بيروت وجبل لبنان." },
  serviceCod: { en: "COD Collection & Fast Remittance", ar: "تحصيل الدفع عند الاستلام وتحويل سريع" },
  serviceCodDesc: { en: "Instant accounting reconciliation with flexible dual-currency settlements (USD / LBP).", ar: "مطابقة محاسبية فورية مع تسويات مرنة بالعملتين (دولار / ليرة)." },
  serviceCoverage: { en: "All-Lebanon Reach", ar: "تغطية شاملة للبنان" },
  serviceCoverageDesc: { en: "From Tripoli to Tyre, our fleet ensures on-time doorstep delivery.", ar: "من طرابلس إلى صور، يضمن أسطولنا التسليم في الوقت المحدد حتى باب البيت." },
  statusNotFound: { en: "Tracking code not found. Please verify and try again.", ar: "رقم التتبع غير موجود. يرجى التحقق والمحاولة مرة أخرى." },
  statusDelivered: { en: "Delivered", ar: "تم التسليم" },
  statusInTransit: { en: "Out for Delivery", ar: "قيد التوصيل" },
  statusPending: { en: "Booking Received", ar: "تم استلام الطلب" },
  allRights: { en: "All rights reserved.", ar: "جميع الحقوق محفوظة." },
};

interface LanguageContextType {
  lang: Language;
  dir: "ltr" | "rtl";
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("cedex_lang") as Language | null;
    if (saved && (saved === "en" || saved === "ar")) {
      setLangState(saved);
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("cedex_lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const toggleLanguage = () => {
    setLanguage(lang === "en" ? "ar" : "en");
  };

  const t = (key: keyof typeof translations): string => {
    return translations[key]?.[lang] || (key as string);
  };

  return (
    <LanguageContext.Provider value={{ lang, dir: lang === "ar" ? "rtl" : "ltr", setLanguage, toggleLanguage, t }}>
      <div dir={lang === "ar" ? "rtl" : "ltr"} className={lang === "ar" ? "font-arabic" : "font-sans"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}