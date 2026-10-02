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

    // Auth & Login
    loginSubtitle: "Dispatch, Parcels, and Multi-Currency COD Engine",
    emailAddress: "Email Address",
    emailPlaceholder: "name@company.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    signingIn: "Signing in...",
    quickFillDemo: "Quick Fill Demo Accounts",
    registerMerchantPrompt: "Running an e-commerce business?",
    registerAsMerchant: "Register as Merchant",
    loginErrorDefault: "Invalid credentials or login failed",
    loginHeader: "Sign in to your account",
    demoAccountsTitle: "Quick Fill Demo Accounts",
    adminDemo: "Hub Admin",
    merchantDemo: "Merchant",
    driverDemo: "Driver",

    // Homepage Landing & Portals
    homeBadge: "PUBLIC LOGISTICS PLATFORM",
    homeHeroTitle: "Lebanese Regional Courier Engine",
    homeHeroSubtitle: "Multi-currency USD & LBP cash-on-delivery tracking, hub dispatching, and automated settlements.",
    trackBtn: "Track",
    trackInputPlaceholder: "Enter 10-digit tracking code (e.g. CDX-882194)...",
    signIn: "Sign In",

    // Homepage Cards
    cardDispatchTitle: "Hub Dispatch Board",
    cardDispatchDesc: "Assign incoming parcels to drivers by Lebanese governorate and trigger WhatsApp tracking webhooks.",
    cardDispatchBtn: "Open Dispatch",
    cardSettlementsTitle: "Cash Settlements",
    cardSettlementsDesc: "Reconcile physical USD and LBP cash handed over by drivers at the hub counter.",
    cardSettlementsBtn: "Reconcile Cash",
    cardBatchPrintTitle: "Batch Waybill Printing",
    cardBatchPrintDesc: "Continuous 4×6 inch thermal roll printing with scannable barcodes.",
    cardBatchPrintBtn: "Print Labels",
    cardDriverRunTitle: "Driver Mobile Run Sheet",
    cardDriverRunDesc: "Mobile view with customer calling, WhatsApp routing, camera barcode scanner, and live cash tallies.",
    cardDriverRunBtn: "Start Run",
    cardBookParcelTitle: "Book Single Parcel",
    cardBookParcelDesc: "Register delivery orders with Lebanese regional governorates and dual USD/LBP COD.",
    cardBookParcelBtn: "Create Order",
    cardBulkCsvTitle: "Bulk CSV Manifest Ingestion",
    cardBulkCsvDesc: "Upload Shopify/WooCommerce CSV exports to generate dozens of waybills in seconds.",
    cardBulkCsvBtn: "Upload Manifest",
    cardMerchantPayoutTitle: "Merchant Payout Statements",
    cardMerchantPayoutDesc: "Track gross COD collected, deducted delivery fees, and net payable balances.",
    cardMerchantPayoutBtn: "View Statement",

    // Footer Links
    footerAbout: "About",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
    footerSecurityNotice: "Courier & Logistics Management System • Multi-Tenant RBAC Isolation Enforced",

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

    // Region Names
    reg_beirut: "Beirut",
    reg_mount_lebanon: "Mount Lebanon",
    reg_north: "North Lebanon",
    reg_south: "South Lebanon",
    reg_bekaa: "Bekaa",
    reg_nabatieh: "Nabatieh",

    // Currencies
    curr_usd: "USD ($)",
    curr_lbp: "LBP (Lebanese Pound)",

    // Driver App
    scanBarcode: "Scan Barcode",
    markDelivered: "Mark Delivered",
    markFailed: "Report Issue",
    callCustomer: "Call",
    whatsappCustomer: "WhatsApp",
    collectCash: "Collect Cash",
    pendingDeliveries: "Pending Deliveries",

    // Admin Dispatch
    hubDispatchBoard: "Hub Dispatch & Assignment",
    hubDispatchSubtitle: "Route parcels to drivers based on Lebanese governorates.",
    unassignedParcels: "Unassigned Parcels",
    assignToDriver: "Assign to Driver",
    selectDriver: "Select Driver...",
    filterByRegion: "Filter by Region",
    dispatchSuccess: "Successfully dispatched!",
    noUnassigned: "No parcels pending dispatch.",
    assignBtn: "Assign",

    // Admin Settlements
    settlementsTitle: "Cash Settlements & Reconciliation",
    settlementsSubtitle: "Verify physical USD and LBP cash collected by drivers at the end of their shift.",
    driverName: "Driver Name",
    expectedUSD: "Expected USD",
    expectedLBP: "Expected LBP",
    collectedParcels: "Collected Parcels",
    actionReconcile: "Reconcile Cash",
    noPendingSettlements: "No pending settlements at the moment."
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

    // Auth & Login
    loginSubtitle: "محرك إدارة الطرود، التوزيع، والتحصيل متعدد العملات (COD)",
    emailAddress: "البريد الإلكتروني",
    emailPlaceholder: "name@company.com",
    password: "كلمة المرور",
    passwordPlaceholder: "••••••••",
    signingIn: "جارٍ تسجيل الدخول...",
    quickFillDemo: "تعبئة سريعة لحسابات تجريبية",
    registerMerchantPrompt: "تدير متجراً إلكترونياً وترغب بالشحن معنا؟",
    registerAsMerchant: "سجّل كتاجر جديد",
    loginErrorDefault: "بيانات الدخول غير صحيحة أو فشل الاتصال",
    loginHeader: "تسجيل الدخول إلى حسابك",
    demoAccountsTitle: "حسابات تجريبية سريعة",
    adminDemo: "مدير المركز",
    merchantDemo: "تاجر",
    driverDemo: "سائق",

    // Homepage Landing & Portals
    homeBadge: "منصة الخدمات اللوجستية العامة",
    homeHeroTitle: "محرك التوصيل للمحافظات اللبنانية",
    homeHeroSubtitle: "تتبع مبالغ الدفع عند الاستلام بالدولار والليرة اللبنانية، إدارة توزيع الشحنات، والتسويات المالية الفورية.",
    trackBtn: "تتبع شحنتك",
    trackInputPlaceholder: "أدخل كود التتبع المؤلف من 10 خانات (مثال: CDX-882194)...",
    signIn: "تسجيل الدخول",

    // Homepage Cards
    cardDispatchTitle: "لوحة توزيع الشحنات والرحلات",
    cardDispatchDesc: "توزيع الطرود الواردة على السائقين حسب المحافظات اللبنانية وإرسال روابط التتبع عبر واتساب.",
    cardDispatchBtn: "فتح التوزيع",
    cardSettlementsTitle: "تسوية التحصيل النقدي (COD)",
    cardSettlementsDesc: "مطابقة وتسليم الأموال النقدية بالدولار والليرة اللبنانية المستلمة من السائقين في المركز.",
    cardSettlementsBtn: "تسوية المبالغ",
    cardBatchPrintTitle: "طباعة البوالص دفعة واحدة",
    cardBatchPrintDesc: "طباعة متواصلة على ورق الملصقات الحراري مقاس 4×6 إنش مع باركود قابل للمسح السريع.",
    cardBatchPrintBtn: "طباعة الملصقات",
    cardDriverRunTitle: "جدول توصيل السائق عبر الهاتف",
    cardDriverRunDesc: "واجهة مخصصة للهاتف تتيح الاتصال المباشر بالزبون، فتح واتساب، مسح الباركود بالكاميرا، وحساب المبالغ المستلمة.",
    cardDriverRunBtn: "بدء التوصيل",
    cardBookParcelTitle: "تسجيل طرد مفرد",
    cardBookParcelDesc: "إنشاء طلب توصيل جديد لجميع المحافظات مع مبالغ الدفع عند الاستلام بالدولار والليرة.",
    cardBookParcelBtn: "إنشاء الطلب",
    cardBulkCsvTitle: "استيراد الشحنات بالجملة (CSV)",
    cardBulkCsvDesc: "رفع ملفات إكسل وCSV المصدرة من شوبيفاي أو ووكومرس لإنشاء عشرات البوالص بثوانٍ.",
    cardBulkCsvBtn: "رفع الملف",
    cardMerchantPayoutTitle: "كشوفات مستحقات التجار",
    cardMerchantPayoutDesc: "متابعة إجمالي مبالغ التحصيل المستلمة، أجور التوصيل المقتطعة، وصافي الأرصدة المستحقة للدفع.",
    cardMerchantPayoutBtn: "عرض الكشف",

    // Footer Links
    footerAbout: "عن المنصة",
    footerPrivacy: "سياسة الخصوصية",
    footerTerms: "شروط الخدمة",
    footerSecurityNotice: "نظام إدارة الشحن والخدمات اللوجستية • حماية عزل البيانات وتعدد الصلاحيات مفعلة",

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

    // Region Names
    reg_beirut: "بيروت",
    reg_mount_lebanon: "جبل لبنان",
    reg_north: "لبنان الشمالي وعكار",
    reg_south: "لبنان الجنوبي",
    reg_bekaa: "البقاع وبعلبك",
    reg_nabatieh: "النبطية",

    // Currencies
    curr_usd: "دولار أمريكي ($)",
    curr_lbp: "ليرة لبنانية (LBP)",

    // Driver App
    scanBarcode: "مسح الباركود",
    markDelivered: "تم التسليم",
    markFailed: "تحديث الحالة",
    callCustomer: "اتصال",
    whatsappCustomer: "واتساب",
    collectCash: "تحصيل نقدي",
    pendingDeliveries: "الشحنات المتبقية",

    // Admin Dispatch
    hubDispatchBoard: "لوحة توزيع المركز",
    hubDispatchSubtitle: "توجيه الشحنات للسائقين حسب المحافظات اللبنانية.",
    unassignedParcels: "الشحنات غير الموزعة",
    assignToDriver: "تعيين لسائق",
    selectDriver: "اختر السائق...",
    filterByRegion: "تصفية حسب المنطقة",
    dispatchSuccess: "تم تعيين الشحنات بنجاح!",
    noUnassigned: "لا توجد شحنات بانتظار التوزيع.",
    assignBtn: "تعيين",

    // Admin Settlements
    settlementsTitle: "تسويات التحصيل النقدي (COD)",
    settlementsSubtitle: "مطابقة الأموال النقدية بالدولار والليرة المستلمة من السائقين في نهاية الوردية.",
    driverName: "اسم السائق",
    expectedUSD: "المتوقع (دولار)",
    expectedLBP: "المتوقع (ليرة)",
    collectedParcels: "الطرود المحصلة",
    actionReconcile: "تسوية الصندوق",
    noPendingSettlements: "لا توجد تسويات معلقة في الوقت الحالي."
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