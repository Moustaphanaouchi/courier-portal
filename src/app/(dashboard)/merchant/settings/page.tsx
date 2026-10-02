"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  Store,
  MapPin,
  CreditCard,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Wallet,
  ShieldCheck,
} from "lucide-react";

const LEBANESE_CITIES = [
  "Beirut",
  "Tripoli",
  "Saida",
  "Nabatieh",
  "Zahle",
  "Jounieh",
  "Byblos (Jbeil)",
  "Batroun",
  "Aley",
  "Baabda",
  "Metn",
  "Chouf",
  "Akkar",
  "Koura",
  "Zgharta",
  "Tyre (Sour)",
  "Bcharre",
  "Bekaa Central",
];

export default function MerchantSettingsPage() {
  const { lang, isRtl } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    pickupCity: "Beirut",
    pickupAddress: "",
    payoutPreferences: {
      method: "CASH",
      accountHolder: "",
      accountNumberOrPhone: "",
      notes: "",
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/merchant/settings");
        const data = await res.json();
        if (data.success && data.merchant) {
          setFormData({
            companyName: data.merchant.companyName || "",
            contactName: data.merchant.contactName || "",
            contactEmail: data.merchant.contactEmail || "",
            contactPhone: data.merchant.contactPhone || "",
            pickupCity: data.merchant.pickupCity || "Beirut",
            pickupAddress: data.merchant.pickupAddress || "",
            payoutPreferences: data.merchant.payoutPreferences || {
              method: "CASH",
              accountHolder: "",
              accountNumberOrPhone: "",
              notes: "",
            },
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/merchant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update settings");
      }

      setSuccessMessage(
        lang === "ar"
          ? "تم حفظ التعديلات وإعدادات المتجر بنجاح!"
          : "Merchant profile and payout settings updated successfully!"
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans ${
        isRtl ? "font-cairo" : ""
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/merchant/parcels"
            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition gap-1.5"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
            <span>{lang === "ar" ? "العودة للطرود" : "Back to Parcels"}</span>
          </Link>
        </div>

        {/* Title Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {lang === "ar" ? "إعدادات المتجر ونقاط الاستلام" : "Store & Warehouse Settings"}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
              {lang === "ar"
                ? "إدارة معلومات المتجر، عنوان المستودع الافتراضي، وطريقة تحويل مستحقات الكاش COD."
                : "Manage company identity, default dispatch warehouse, and COD payout channels."}
            </p>
          </div>
        </div>

        {/* Feedback Banners */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Store & Contact Information */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                {lang === "ar" ? "بيانات المتجر والتواصل" : "Business & Contact Info"}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === "ar" ? "اسم المتجر أو العلامة التجارية *" : "Store / Brand Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === "ar" ? "اسم المسؤول *" : "Contact Person *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === "ar" ? "البريد الإلكتروني للفوترة" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-slate-400 absolute top-3 ${isRtl ? "right-3" : "left-3"}`} />
                  <input
                    type="email"
                    disabled
                    value={formData.contactEmail}
                    className={`w-full py-2.5 text-xs font-mono bg-slate-100/70 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed ${
                      isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === "ar" ? "رقم الهاتف (واتساب) *" : "Phone (WhatsApp) *"}
                </label>
                <div className="relative">
                  <Phone className={`w-4 h-4 text-slate-400 absolute top-3 ${isRtl ? "right-3" : "left-3"}`} />
                  <input
                    type="tel"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className={`w-full py-2.5 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 ${
                      isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Default Warehouse & Pickup Point */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                {lang === "ar" ? "مستودع الاستلام الافتراضي" : "Default Pickup Warehouse"}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === "ar" ? "مدينة المستودع *" : "Pickup City *"}
                </label>
                <select
                  value={formData.pickupCity}
                  onChange={(e) => setFormData({ ...formData, pickupCity: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white"
                >
                  {LEBANESE_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === "ar" ? "العنوان التفصيلي للمستودع" : "Detailed Street / Building"}
                </label>
                <input
                  type="text"
                  placeholder={lang === "ar" ? "مثال: شارع الحمرا، بناية النور، الطابق 2" : "e.g. Bliss St, Al Noor Bldg, 2nd Fl"}
                  value={formData.pickupAddress}
                  onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === "ar"
                ? "يتم اعتماد هذا العنوان تلقائياً كنقطة انطلاق السائق لاستلام شحناتك اليومية."
                : "This address is automatically pre-filled as the courier dispatch pickup origin."}
            </p>
          </div>

          {/* Section 3: COD Payout & Remittance Preferences */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                {lang === "ar" ? "طريقة استلام مستحقات الكاش (COD Remittance)" : "COD Payout & Payment Channel"}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: "CASH", label: "Cash at Hub", labelAr: "استلام كاش من الفرع", icon: "💵" },
                { id: "WHISH", label: "Whish Money", labelAr: "محفظة Whish", icon: "📱" },
                { id: "OMT", label: "OMT / BoB", labelAr: "تحويل OMT", icon: "🏦" },
                { id: "BANK", label: "Bank Transfer", labelAr: "تحويل مصرفي", icon: "🏛️" },
              ].map((m) => {
                const isSelected = formData.payoutPreferences.method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        payoutPreferences: { ...formData.payoutPreferences, method: m.id },
                      })
                    }
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-xs">{lang === "ar" ? m.labelAr : m.label}</span>
                  </button>
                );
              })}
            </div>

            {formData.payoutPreferences.method !== "CASH" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === "ar" ? "اسم صاحب الحساب أو المستلم" : "Account Holder Full Name"}
                  </label>
                  <input
                    type="text"
                    placeholder="Full name matching ID"
                    value={formData.payoutPreferences.accountHolder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payoutPreferences: {
                          ...formData.payoutPreferences,
                          accountHolder: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === "ar"
                      ? "رقم الهاتف للمحفظة / الحساب البنكي (IBAN)"
                      : "Wallet Mobile / Bank IBAN"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      formData.payoutPreferences.method === "WHISH"
                        ? "+961 70 123456"
                        : formData.payoutPreferences.method === "OMT"
                        ? "+961 03 123456"
                        : "LB00 0000 0000 0000 0000"
                    }
                    value={formData.payoutPreferences.accountNumberOrPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payoutPreferences: {
                          ...formData.payoutPreferences,
                          accountNumberOrPhone: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === "ar" ? "جاري الحفظ..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{lang === "ar" ? "حفظ التعديلات" : "Save Changes"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
