"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WhatsAppReceiptButton } from "@/components/WhatsAppReceiptButton";
import { useLanguage } from "@/context/LanguageContext";
import {
Package,
User,
MapPin,
Banknote,
ArrowRight,
ChevronDown,
Printer,
CheckCircle2,
DollarSign,
Building,
RefreshCw,
} from "lucide-react";

// Lebanese Governorates and Cities mapping
const LEBANESE_LOCATIONS: Record<string, string[]> = {
"Beirut": ["Achrafieh", "Hamra", "Verdun", "Mar Mikhael", "Badaro", "Ras Beirut", "Gemmayzeh"],
"Mount Lebanon": ["Jounieh", "Jbeil (Byblos)", "Baabda", "Metn", "Aley", "Chouf", "Sin El Fil", "Antelias", "Mansourieh", "Hazmieh"],
"North Lebanon": ["Tripoli", "Mina", "Koura", "Batroun", "Zgharta", "Bcharre"],
"Akkar": ["Halba", "Qoubaiyat", "Bebnine"],
"South Lebanon": ["Sidon (Saida)", "Tyre (Sour)", "Jezzine"],
"Bekaa": ["Zahle", "Chtaura", "Baalbek", "West Bekaa"],
"Nabatieh": ["Nabatieh El Tahta", "Marjayoun", "Bint Jbeil", "Hasbaya"],
};

// Lebanese Regional Tariff Matrix (USD)
const REGIONAL_TARIFFS: Record<string, number> = {
"Beirut": 3.00,
"Mount Lebanon": 3.50,
"North Lebanon": 4.00,
"South Lebanon": 4.00,
"Bekaa": 4.50,
"Akkar": 5.00,
"Nabatieh": 5.00,
};

const LBP_RATE = 89500;

export default function NewParcelPage() {
const router = useRouter();
const { t, isRtl, lang } = useLanguage();
const [merchantId, setMerchantId] = useState<string | null>(null);
const [loadingUser, setLoadingUser] = useState(true);

// Form Fields
const [recipientName, setRecipientName] = useState("");
const [recipientPhone, setRecipientPhone] = useState("");
const [governorate, setGovernorate] = useState("Mount Lebanon");
const [city, setCity] = useState("Sin El Fil");
const [detailedAddress, setDetailedAddress] = useState("");
const [codAmount, setCodAmount] = useState<string>("35");
const [codCurrency, setCodCurrency] = useState<"USD" | "LBP">("USD");
const [deliveryFeeUsd, setDeliveryFeeUsd] = useState<number>(REGIONAL_TARIFFS["Mount Lebanon"]);
const [notes, setNotes] = useState("");

const [submitting, setSubmitting] = useState(false);
const [createdParcel, setCreatedParcel] = useState<any>(null);
const [errorMsg, setErrorMsg] = useState<string | null>(null);

// Fetch current merchant credentials
useEffect(() => {
async function loadUser() {
  try {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.user?.merchantId) {
      setMerchantId(data.user.merchantId);
    }
  } catch (err) {
    console.error("Failed to load user profile", err);
  } finally {
    setLoadingUser(false);
  }
}
loadUser();
}, []);

// Update delivery tariff whenever governorate changes
const handleGovernorateChange = (gov: string) => {
setGovernorate(gov);
const tariff = REGIONAL_TARIFFS[gov] || 4.00;
setDeliveryFeeUsd(tariff);
const cities = LEBANESE_LOCATIONS[gov] || [];
if (cities.length > 0) {
  setCity(cities[0]);
}
};

// Realtime Net COD calculations
const parsedCod = parseFloat(codAmount) || 0;
const netCodUsd = codCurrency === "USD" ? Math.max(0, parsedCod - deliveryFeeUsd) : 0;
const netCodLbp = codCurrency === "LBP" ? Math.max(0, parsedCod - (deliveryFeeUsd * LBP_RATE)) : 0;

async function handleSubmit(e: React.FormEvent) {
e.preventDefault();
if (!merchantId) {
  setErrorMsg("Merchant session is missing or unauthorized. Please re-login.");
  return;
}
if (!recipientName || !recipientPhone || !city) {
  setErrorMsg("Please fill in recipient name, phone, and destination.");
  return;
}

setSubmitting(true);
setErrorMsg(null);

try {
  const res = await fetch("/api/parcels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchantId,
      recipientName,
      recipientPhone,
      city,
      governorate,
      detailedAddress,
      codAmount: parsedCod,
      codCurrency,
      deliveryFee: deliveryFeeUsd,
      notes: notes || undefined,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to create parcel");
  }

  setCreatedParcel(data.parcel);
} catch (err: any) {
  setErrorMsg(err.message || "An unexpected error occurred.");
} finally {
  setSubmitting(false);
}
}

return (
<div className={`min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 ${isRtl ? "font-cairo" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
  <div className="max-w-3xl mx-auto">
    {/* Header */}
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {lang === "ar" ? "إنشاء بوليصة شحن جديدة" : "Create Delivery Order"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {lang === "ar"
            ? "احتساب تلقائي لتعرفة المحافظات وصافي التحصيل (Net COD)"
            : "Automated Lebanese regional tariffs & net COD reconciliation"}
        </p>
      </div>
      <span className="self-start sm:self-auto text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full border border-blue-200">
        {lang === "ar" ? "بوابة التاجر" : "Merchant Entry"}
      </span>
    </div>

    {/* Success Modal / Card */}
    {createdParcel ? (
      <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {lang === "ar" ? "تم تسجيل الطرد بنجاح!" : "Parcel Successfully Registered!"}
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              {createdParcel.trackingNumber}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl text-xs">
          <div>
            <span className="text-slate-400 block">{lang === "ar" ? "المستلم" : "Recipient"}</span>
            <p className="font-bold text-slate-800 mt-0.5">{createdParcel.recipientName}</p>
          </div>
          <div>
            <span className="text-slate-400 block">{lang === "ar" ? "الوجهة" : "Destination"}</span>
            <p className="font-bold text-slate-800 mt-0.5">{createdParcel.city}</p>
          </div>
          <div>
            <span className="text-slate-400 block">{lang === "ar" ? "المبلغ المطلوب" : "COD Due"}</span>
            <p className="font-bold text-emerald-600 font-mono mt-0.5">
              {createdParcel.codCurrency === "USD"
                ? `$${Number(createdParcel.codAmount).toFixed(2)}`
                : `${Number(createdParcel.codAmount).toLocaleString()} LBP`}
            </p>
          </div>
          <div>
            <span className="text-slate-400 block">{lang === "ar" ? "رسوم التوصيل" : "Delivery Tariff"}</span>
            <p className="font-bold text-blue-600 font-mono mt-0.5">
              ${Number(createdParcel.deliveryFee || deliveryFeeUsd).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => window.open(`/track/${createdParcel.trackingNumber}/waybill`, "_blank")}
            className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === "ar" ? "طباعة البوليصة الحرارية" : "Print 4x6 Waybill"}</span>
          </button>

          <WhatsAppReceiptButton phone={createdParcel.recipientPhone} parcel={createdParcel} />

          <button
            onClick={() => {
              setCreatedParcel(null);
              setRecipientName("");
              setRecipientPhone("");
              setDetailedAddress("");
              setNotes("");
            }}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            {lang === "ar" ? "إضافة طرد آخر" : "Create Another"}
          </button>
        </div>
      </div>
    ) : (
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Recipient Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-bold text-sm">
            <User className="w-4 h-4 text-blue-600" />
            <span>{t("recipientInfo")}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === "ar" ? "اسم الزبون / المستلم" : "Customer / Recipient Name"} *
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Karim El Hage"
                className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === "ar" ? "رقم الهاتف (لبنان)" : "Phone Number (Lebanon)"} *
              </label>
              <input
                type="text"
                required
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="e.g. 70 123 456 or 03 123 456"
                className="w-full text-xs font-mono font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Destination & Regional Tariff Routing */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-800 font-bold text-sm">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{lang === "ar" ? "الوجهة وتحديد التعرفة" : "Destination & Tariff Routing"}</span>
            </span>
            <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
              {lang === "ar" ? "تعرفة المنطقة:" : "Zone Tariff:"} ${deliveryFeeUsd.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === "ar" ? "المحافظة" : "Governorate"}
              </label>
              <div className="relative">
                <select
                  value={governorate}
                  onChange={(e) => handleGovernorateChange(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 appearance-none bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {Object.keys(LEBANESE_LOCATIONS).map((gov) => (
                    <option key={gov} value={gov}>
                      {gov} (${REGIONAL_TARIFFS[gov]?.toFixed(2)})
                    </option>
                  ))}
                </select>
                <ChevronDown className={`w-4 h-4 text-slate-400 absolute ${isRtl ? "left-3" : "right-3"} top-3 pointer-events-none`} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === "ar" ? "المدينة / المنطقة" : "City / District"} *
              </label>
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 appearance-none bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {(LEBANESE_LOCATIONS[governorate] || []).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className={`w-4 h-4 text-slate-400 absolute ${isRtl ? "left-3" : "right-3"} top-3 pointer-events-none`} />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {lang === "ar" ? "تفاصيل العنوان (شارع، مبنى، طابق)" : "Detailed Address (Street, Building, Floor)"}
            </label>
            <input
              type="text"
              value={detailedAddress}
              onChange={(e) => setDetailedAddress(e.target.value)}
              placeholder="e.g. Mar Elias St., Al-Nour Bldg, 3rd Floor"
              className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
            />
          </div>
        </div>

        {/* COD & Financials */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-bold text-sm">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>{lang === "ar" ? "مبلغ التحصيل وصافي العائد" : "Cash on Delivery & Remittance"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === "ar" ? "عملة التحصيل" : "Collection Currency"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCodCurrency("USD")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    codCurrency === "USD"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCodCurrency("LBP")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    codCurrency === "LBP"
                      ? "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  LBP (ل.ل)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === "ar" ? "المبلغ المطلوب تحصيله" : "COD Amount from Recipient"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step={codCurrency === "USD" ? "0.5" : "50000"}
                  value={codAmount}
                  onChange={(e) => setCodAmount(e.target.value)}
                  className="w-full text-sm font-black font-mono border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                />
                <span className={`absolute ${isRtl ? "left-3" : "right-3"} top-2.5 text-xs font-bold text-slate-400 uppercase`}>
                  {codCurrency}
                </span>
              </div>
            </div>
          </div>

          {/* Live Net COD Remittance Estimation Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200/80 rounded-2xl p-4 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-700">{lang === "ar" ? "صافي مستحقات التاجر (Net COD):" : "Estimated Merchant Payout (Net COD):"}</span>
              <span className="text-base font-black font-mono text-emerald-800">
                {codCurrency === "USD"
                  ? `$${netCodUsd.toFixed(2)} USD`
                  : `${netCodLbp.toLocaleString()} LBP`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {lang === "ar"
                ? `المبلغ المطلوب (${codCurrency === "USD" ? `$${parsedCod}` : `${parsedCod.toLocaleString()} LBP`}) - رسوم التوصيل ($${deliveryFeeUsd}) = صافي التحصيل`
                : `Gross COD (${codCurrency === "USD" ? `$${parsedCod}` : `${parsedCod.toLocaleString()} LBP`}) minus delivery tariff ($${deliveryFeeUsd}) = Net Remittance`}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {lang === "ar" ? "تعليمات خاصة للتسليم (اختياري)" : "Delivery Instructions (Optional)"}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Call before arrival, leave with concierge"
              className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || loadingUser}
            className="w-full bg-slate-900 hover:bg-blue-600 text-white rounded-2xl py-4 font-bold text-sm shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{lang === "ar" ? "جاري تسجيل الطلب..." : "Creating Parcel..."}</span>
              </>
            ) : (
              <>
                <Package className="w-4 h-4" />
                <span>{lang === "ar" ? "تسجيل الطلب واستخراج البوليصة" : "Register Parcel & Generate Waybill"}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
              </>
            )}
          </button>
        </div>
      </form>
    )}
  </div>
</div>
);
}
