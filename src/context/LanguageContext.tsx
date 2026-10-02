"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "ar";

export const translations = {
  en: {
    // Brand & General
    brandName: "Cedex Logistics",
    operationsHub: "Operations Hub",
    dashboard: "Dashboard",
    logout: "Sign Out",
    hubAdmin: "Hub Admin",
    merchant: "Merchant",
    driver: "Driver",
    language: "Language",
    backToDashboard: "Back to Dashboard",
    merchantParcelEntry: "Merchant Parcel Entry",
    createNewDeliveryOrder: "Create New Delivery Order",
    generateWaybillSubtitle: "Generate waybill with Lebanese regional routing & COD",

    // Admin Nav
    allParcels: "Parcels Directory",
    dispatchRuns: "Dispatch & Runs",
    settlements: "COD Settlements",
    payoutBatches: "Merchant Payouts",
    liveTracker: "Live Tracking",

    // Merchant Nav
    myParcels: "My Parcels",
    newParcel: "New Parcel",
    bulkUpload: "CSV Bulk Upload",
    payoutHistory: "Payout History",

    // Driver Nav
    activeRunSheet: "Active Run-Sheet",
    tripHistory: "Trip History",

    // Bulk Upload
    bulkUploadTitle: "Bulk Parcel Import (CSV)",
    bulkUploadSubtitle: "Upload batches of delivery waybills with address & COD parsing",
    dragDropCsv: "Drag and drop your CSV file here, or click to browse",
    supportedFormats: "Supported formats: .csv with columns: Recipient, Phone, City, Address, COD, Currency",
    downloadTemplate: "Download Sample CSV Template",
    uploadButton: "Process & Import Parcels",
    importSuccess: "Parcels successfully imported!",

    // Merchant Payouts
    payoutHistoryTitle: "Merchant Settlements & Payouts",
    payoutHistorySubtitle: "Track COD collections, courier tariff deductions, and net disbursed balances",
    batchId: "Batch ID",
    disbursedAt: "Settled Date",
    collectedCod: "Total COD Collected",
    deliveryFeesDeducted: "Delivery Fees Deducted",
    netPayout: "Net Payout",
    payoutStatus: "Payout Status",
    viewStatement: "View Official Statement",
    noPayoutsYet: "No payout batches have been disbursed yet.",

    // Table & Parcel Directory
    trackingNumber: "Tracking Number",
    recipient: "Recipient",
    destination: "Destination",
    status: "Status",
    actions: "Actions",
    allStatuses: "All Statuses",
    searchPlaceholder: "Search by tracking number, recipient, or phone...",
    filterStatus: "Filter by Status",
    exportCsv: "Export CSV",
    noParcelsFound: "No parcels found matching your filter.",
    printLabel: "Print Label",
    viewDetails: "View Details",
    totalParcels: "Total Parcels",
    pendingPickup: "Pending Pickup",
    outForDelivery: "Out for Delivery",
    delivered: "Delivered",
    failedAttempt: "Failed Attempt",
    returned: "Returned",
    status_PENDING: "Pending Pickup",
    status_IN_TRANSIT: "Out for Delivery",
    status_DELIVERED: "Delivered",
    status_RETURNED: "Returned",
    status_CANCELLED: "Cancelled",

    // Recipient Section
    recipientInfo: "Recipient Information",
    customerName: "Customer Full Name",
    customerNamePlaceholder: "e.g. Recipient Full Name",
    phone: "Phone Number",
    phonePlaceholder: "+961 70 123 456",
    altPhone: "Secondary / WhatsApp Phone (Optional)",
    altPhonePlaceholder: "+961 03 987 654",

    // Destination Section
    destinationDetails: "Destination Details",
    governorate: "Governorate",
    city: "City / District",
    address: "Street, Building, Floor",
    addressPlaceholder: "e.g. Bliss Street, Al Noor Bldg, 3rd Floor",
    landmark: "Prominent Landmark (Optional)",
    landmarkPlaceholder: "e.g. Next to AUB Main Gate, facing pharmacy",

    // COD & Tariffs Section
    codTariff: "Cash On Delivery (COD) & Delivery Tariff",
    courierMatrixBadge: "Lebanese Courier Matrix",
    codAmount: "COD Amount",
    currency: "Currency",
    deliveryFee: "Delivery Fee (USD)",
    fixedTariff: "Fixed Tariff",
    packageWeight: "Package Weight (KG)",
    standardWeightHint: "1-3 kg standard",
    overweightNotice: "Over 3kg: +$0.50/kg",
    sameDayRush: "Same-Day Rush",
    sameDayRushHint: "Express delivery (+$2.00)",
    exchangeOrder: "Exchange Order (بدل)",
    exchangeOrderHint: "Pick up return item (+$1.50)",
    notes: "Delivery Notes / Package Contents",
    notesPlaceholder: "e.g. Fragile glass bottles. Call before arriving.",
    submitOrder: "Register Parcel & Generate Tracking Code",

    // Success Screen
    parcelRegistered: "Parcel Registered!",
    pickupReady: "Ready for pickup at your registered store address.",
    printWaybill: "Print Waybill / Thermal Label",
    sendWhatsAppReceipt: "Send Receipt to Customer via WhatsApp",
    addAnotherParcel: "Add Another Parcel",
    backToOperationsHub: "Back to Operations Hub",

    // Region Names (Lebanon)
    reg_beirut: "Beirut",
    reg_mount_lebanon: "Mount Lebanon",
    reg_north: "North Lebanon",
    reg_south: "South Lebanon",
    reg_bekaa: "Bekaa",
    reg_nabatieh: "Nabatieh",

    // Currencies
    curr_usd: "USD ($)",
    curr_lbp: "LBP (Lebanese Pound)",
  },
  ar: {
    // Brand & General
    brandName: "سيدكس للخدمات اللوجستية",
    operationsHub: "مركز العمليات",
    dashboard: "لوحة التحكم",
    logout: "تسجيل الخروج",
    hubAdmin: "مدير المركز",
    merchant: "تاجر",
    driver: "سائق توصيل",
    language: "اللغة",
    backToDashboard: "العودة للوحة التحكم",
    merchantParcelEntry: "بوابة شحن التاجر",
    createNewDeliveryOrder: "إنشاء طلب توصيل جديد",
    generateWaybillSubtitle: "إصدار بوليصة شحن وفق تعرفة المناطق اللبنانية مع الدفع عند الاستلام",

    // Admin Nav
    allParcels: "سجل الشحنات",
    dispatchRuns: "التوزيع والرحلات",
    settlements: "تسوية مبالغ التحصيل",
    payoutBatches: "مستحقات التجار",
    liveTracker: "التتبع المباشر",

    // Merchant Nav
    myParcels: "شحناتي",
    newParcel: "شحنة جديدة",
    bulkUpload: "رفع ملف شحنات (CSV)",
    payoutHistory: "سجل التحويلات",

    // Driver Nav
    activeRunSheet: "قائمة التوصيل الحالية",
    tripHistory: "سجل الرحلات المكتملة",

    // Bulk Upload
    bulkUploadTitle: "استيراد الشحنات بالجملة (ملف CSV)",
    bulkUploadSubtitle: "رفع جداول الشحنات دفعة واحدة مع قراءة تلقائية للعناوين ومبالغ التحصيل",
    dragDropCsv: "اسحب وأفلت ملف الـ CSV هنا، أو اضغط للاختيار من جهازك",
    supportedFormats: "الصيغة المدعومة: .csv بالأعمدة: المستلم، الهاتف، المدينة، العنوان، مبلغ التحصيل، العملة",
    downloadTemplate: "تحميل نموذج ملف CSV الجاهز",
    uploadButton: "معالجة واستيراد الشحنات",
    importSuccess: "تم استيراد الشحنات بنجاح!",

    // Merchant Payouts
    payoutHistoryTitle: "تسويات وتحويلات مستحقات التاجر",
    payoutHistorySubtitle: "متابعة مبالغ التحصيل المستلمة، أجور التوصيل المقتطعة، وصافي الأرصدة المحولة",
    batchId: "رقم الدفعة",
    disbursedAt: "تاريخ التحويل",
    collectedCod: "إجمالي التحصيل المستلم",
    deliveryFeesDeducted: "أجور التوصيل المقتطعة",
    netPayout: "صافي المبلغ المستلم",
    payoutStatus: "حالة الدفعة",
    viewStatement: "عرض كشف الحساب الرسمي",
    noPayoutsYet: "لا توجد دفعات محولة حتى الآن.",

    // Table & Parcel Directory
    trackingNumber: "رقم التتبع",
    recipient: "المستلم",
    destination: "الوجهة",
    status: "الحالة",
    actions: "الإجراءات",
    allStatuses: "جميع الحالات",
    searchPlaceholder: "البحث برقم التتبع، اسم المستلم، أو الهاتف...",
    filterStatus: "تصفية حسب الحالة",
    exportCsv: "تصدير ملف CSV",
    noParcelsFound: "لم يتم العثور على أي شحنات تطابق البحث.",
    printLabel: "طباعة البوليصة",
    viewDetails: "عرض التفاصيل",
    totalParcels: "إجمالي الشحنات",
    pendingPickup: "بانتظار الاستلام",
    outForDelivery: "قيد التوصيل",
    delivered: "تم التسليم",
    failedAttempt: "محاولة تسليم فاشلة",
    returned: "مرتجع",
    status_PENDING: "بانتظار الاستلام",
    status_IN_TRANSIT: "قيد التوصيل",
    status_DELIVERED: "تم التسليم",
    status_RETURNED: "مرتجع",
    status_CANCELLED: "ملغى",

    // Recipient Section
    recipientInfo: "بيانات العميل المستلم",
    customerName: "اسم المستلم الكامل",
    customerNamePlaceholder: "مثال: اسم المستلم الثلاثي",
    phone: "رقم الهاتف الأساسي",
    phonePlaceholder: "+961 70 123 456",
    altPhone: "رقم هاتف بديل / واتساب (اختياري)",
    altPhonePlaceholder: "+961 03 987 654",

    // Destination Section
    destinationDetails: "تفاصيل عنوان التسليم",
    governorate: "المحافظة",
    city: "المدينة / القضاء",
    address: "الشارع، المبنى، الطابق والشقة",
    addressPlaceholder: "مثال: شارع بلس، بناية النور، الطابق الثالث",
    landmark: "علامة مميزة قريبة (اختياري)",
    landmarkPlaceholder: "مثال: بجانب بوابة الجامعة، مقابل الصيدلية",

    // COD & Tariffs Section
    codTariff: "مبلغ التحصيل (COD) وأجور التوصيل",
    courierMatrixBadge: "جدول تعرفة التوصيل الموحدة",
    codAmount: "المبلغ المطلوب تحصيله",
    currency: "العملة",
    deliveryFee: "أجور التوصيل ($)",
    fixedTariff: "تعرفة ثابتة",
    packageWeight: "وزن الطرد (كغ)",
    standardWeightHint: "1 - 3 كغ قياسي",
    overweightNotice: "أكثر من 3 كغ: +0.50$ لكل كغ إضافي",
    sameDayRush: "توصيل سريع بنفس اليوم",
    sameDayRushHint: "تسليم فوري مستعجل (+2.00$)",
    exchangeOrder: "طلب تبديل (بدل)",
    exchangeOrderHint: "استلام بضاعة راجعة من الزبون (+1.50$)",
    notes: "ملاحظات السائق ومحتويات الطرد",
    notesPlaceholder: "مثال: قابل للكسر، يرجى الاتصال قبل الوصول بـ 15 دقيقة",
    submitOrder: "تسجيل الطرد وإصدار كود التتبع",

    // Success Screen
    parcelRegistered: "تم تسجيل الطرد بنجاح!",
    pickupReady: "الشحنة جاهزة لاستلام السائق من عنوان متجرك المسجل.",
    printWaybill: "طباعة البوليصة / ملصق الشحن الحراري",
    sendWhatsAppReceipt: "إرسال إيصال الاستلام للزبون عبر واتساب",
    addAnotherParcel: "إضافة طرد جديد",
    backToOperationsHub: "العودة لمركز العمليات",

    // Region Names (Lebanon)
    reg_beirut: "بيروت",
    reg_mount_lebanon: "جبل لبنان",
    reg_north: "لبنان الشمالي وعكار",
    reg_south: "لبنان الجنوبي",
    reg_bekaa: "البقاع وبعلبك",
    reg_nabatieh: "النبطية",

    // Currencies
    curr_usd: "دولار أمريكي ($)",
    curr_lbp: "ليرة لبنانية (LBP)",
  },
};

export type TranslationKey = keyof typeof translations["en"];

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = (localStorage.getItem("cedex_lang") as Language) || "en";
    setLangState(saved);
    applyDir(saved);
  }, []);

  function applyDir(selected: Language) {
    document.documentElement.lang = selected;
    document.documentElement.dir = selected === "ar" ? "rtl" : "ltr";
    localStorage.setItem("cedex_lang", selected);
  }

  function setLang(selected: Language) {
    setLangState(selected);
    applyDir(selected);
  }

  function toggleLang() {
    const next = lang === "en" ? "ar" : "en";
    setLang(next);
  }

  function t(key: TranslationKey): string {
    return translations[lang]?.[key] || translations["en"][key] || (key as string);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, isRtl: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: "en" as Language,
      setLang: () => {},
      toggleLang: () => {},
      t: (key: TranslationKey) => translations.en[key] || (key as string),
      isRtl: false,
    };
  }
  return context;
}