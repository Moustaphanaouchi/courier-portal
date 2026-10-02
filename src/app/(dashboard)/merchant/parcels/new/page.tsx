"use client";

import { WhatsAppReceiptButton } from "@/components/WhatsAppReceiptButton";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus, CheckCircle2, ArrowLeft, Loader2, DollarSign, MapPin, Phone, User, Lock, Printer } from "lucide-react";
import Link from "next/link";
import { useLanguage, TranslationKey } from "@/context/LanguageContext";

const LEBANON_REGIONS: Record<string, { labelKey: TranslationKey; cities: string[] }> = {
  "Beirut": {
    labelKey: "reg_beirut",
    cities: ["Achrafieh", "Hamra", "Mar Mikhael", "Verdun", "Ras Beirut", "Badaro"]
  },
  "Mount Lebanon": {
    labelKey: "reg_mount_lebanon",
    cities: ["Jounieh", "Jbeil (Byblos)", "Baabda", "Metn / Antelias", "Aley", "Chouf"]
  },
  "North": {
    labelKey: "reg_north",
    cities: ["Tripoli", "El Mina", "Koura", "Zgharta", "Batroun", "Bsharri", "Akkar"]
  },
  "South": {
    labelKey: "reg_south",
    cities: ["Saida (Sidon)", "Sour (Tyre)", "Jezzine"]
  },
  "Bekaa": {
    labelKey: "reg_bekaa",
    cities: ["Zahle", "Chtaura", "Baalbek", "West Bekaa"]
  },
  "Nabatieh": {
    labelKey: "reg_nabatieh",
    cities: ["Nabatieh El Tahta", "Marjayoun", "Bint Jbeil", "Hasbaya"]
  }
};

export default function NewParcelPage() {
  const router = useRouter();
  const { t, isRtl } = useLanguage();

  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientAltPhone, setRecipientAltPhone] = useState("");
  const [governorate, setGovernorate] = useState("Beirut");
  const [city, setCity] = useState("Hamra");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [codAmount, setCodAmount] = useState<number>(25);
  const [codCurrency, setCodCurrency] = useState<"USD" | "LBP">("USD");
  const [deliveryFee, setDeliveryFee] = useState<number>(3.0);
  const [weightKg, setWeightKg] = useState<number>(1);
  const [isSameDay, setIsSameDay] = useState<boolean>(false);
  const [isExchange, setIsExchange] = useState<boolean>(false);
  const [feeBreakdown, setFeeBreakdown] = useState<string>("");
  const [notes, setNotes] = useState("");

  function calcLebanonFee(gov: string, weight: number, sameDay: boolean, exchange: boolean) {
    let base = 3.5;
    const g = gov.toLowerCase();

    if (g.includes("akkar") || g.includes("hermel") || g.includes("baalbek")) {
      base = 5.0;
    } else if (g.includes("nabatieh")) {
      base = 4.5;
    } else if (g.includes("south")) {
      base = 4.0;
    } else if (g.includes("beirut")) {
      base = 3.0;
    } else if (g.includes("mount")) {
      base = 3.5;
    } else if (g.includes("north")) {
      base = 4.0;
    } else {
      base = 4.0;
    }

    let extraWeight = 0;
    if (weight > 3) {
      extraWeight = Math.ceil(weight - 3) * 0.5;
    }

    const rushExtra = sameDay ? 2.0 : 0;
    const exchangeExtra = exchange ? 1.5 : 0;
    const total = Number((base + extraWeight + rushExtra + exchangeExtra).toFixed(2));

    const parts = [
      `Base: $${base.toFixed(2)}`,
      extraWeight > 0 ? `+${weight - 3}kg ($${extraWeight.toFixed(2)})` : null,
      rushExtra > 0 ? "Same-Day (+$2.00)" : null,
      exchangeExtra > 0 ? "Exchange (+$1.50)" : null,
    ].filter(Boolean).join(" • ");

    setDeliveryFee(total);
    setFeeBreakdown(parts);
  }

  const handleGovernorateChange = (gov: string) => {
    setGovernorate(gov);
    setCity(LEBANON_REGIONS[gov]?.cities[0] || "");
    calcLebanonFee(gov, weightKg, isSameDay, isExchange);
  };

  useEffect(() => {
    calcLebanonFee(governorate, weightKg, isSameDay, isExchange);
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user.merchantId) {
          setMerchantId(data.user.merchantId);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoadingUser(false);
      }
    }
    fetchUser();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!merchantId) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/parcels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          recipientName,
          recipientPhone,
          recipientAltPhone: recipientAltPhone || null,
          city: `${governorate} - ${city}`,
          address: detailedAddress + (landmark ? ` (Landmark: ${landmark})` : ""),
          codAmount,
          codCurrency,
          deliveryFee,
          notes: [
            notes,
            weightKg > 3 ? `Weight: ${weightKg}kg` : null,
            isSameDay ? "Rush: Same-Day" : null,
            isExchange ? "Exchange Item (طلب بدل)" : null,
          ].filter(Boolean).join(" | "),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create parcel order.");
      }

      setSuccessCode(data.trackingNumber);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (successCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900">{t("parcelRegistered")}</h2>
          <p className="text-sm text-slate-500 mt-1">{t("pickupReady")}</p>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-lg font-bold text-blue-600 tracking-wider">
            {successCode}
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <a
              href={`/parcels/${successCode}/label`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>{t("printWaybill")}</span>
            </a>

            <div className="flex flex-col gap-2 mb-2">
              <WhatsAppReceiptButton
                phone={recipientPhone}
                parcel={{
                  trackingNumber: successCode,
                  recipientName,
                  recipientPhone,
                  city,
                  codAmount,
                  codCurrency,
                  notes: notes || undefined,
                }}
                label={t("sendWhatsAppReceipt")}
              />
            </div>

            <button
              onClick={() => {
                setSuccessCode(null);
                setRecipientName("");
                setRecipientPhone("");
                setDetailedAddress("");
                setLandmark("");
                setNotes("");
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition cursor-pointer"
            >
              {t("addAnotherParcel")}
            </button>

            <Link
              href="/"
              className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-sm transition text-center"
            >
              {t("backToOperationsHub")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition gap-1.5">
            <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
            <span>{t("backToDashboard")}</span>
          </Link>
          <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-200">
            {t("merchantParcelEntry")}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{t("createNewDeliveryOrder")}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{t("generateWaybillSubtitle")}</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Recipient Details */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>{t("recipientInfo")}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t("customerName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("customerNamePlaceholder")}
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t("phone")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className={`w-4 h-4 absolute top-2.5 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                    <input
                      type="tel"
                      required
                      placeholder={t("phonePlaceholder")}
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className={`w-full py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-start ${
                        isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
                      }`}
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t("altPhone")}
                  </label>
                  <input
                    type="tel"
                    placeholder={t("altPhonePlaceholder")}
                    value={recipientAltPhone}
                    onChange={(e) => setRecipientAltPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Destination Address */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{t("destinationDetails")}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t("governorate")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => handleGovernorateChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(LEBANON_REGIONS).map(([govKey, govData]) => (
                      <option key={govKey} value={govKey}>
                        {t(govData.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t("city")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LEBANON_REGIONS[governorate]?.cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t("address")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("addressPlaceholder")}
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t("landmark")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("landmarkPlaceholder")}
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
                  />
                </div>
              </div>
            </div>

            {/* Cash on Delivery (COD) & Rates */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{t("codTariff")}</span>
                </h3>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {t("courierMatrixBadge")}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t("codAmount")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={codAmount}
                    onChange={(e) => setCodAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t("currency")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={codCurrency}
                    onChange={(e) => setCodCurrency(e.target.value as "USD" | "LBP")}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="USD">{t("curr_usd")}</option>
                    <option value="LBP">{t("curr_lbp")}</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">{t("deliveryFee")}</label>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> {t("fixedTariff")}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      readOnly
                      disabled
                      value={deliveryFee}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-bold text-slate-700 bg-slate-100 cursor-not-allowed select-none"
                    />
                    <span className={`absolute top-2.5 text-xs text-slate-400 font-semibold pointer-events-none ${
                      isRtl ? "left-3" : "right-3"
                    }`}>
                      USD
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 truncate" title={feeBreakdown}>
                    {feeBreakdown}
                  </p>
                </div>
              </div>

              {/* Lebanese Courier Tariff Modifiers */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t("packageWeight")}</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 1;
                      setWeightKg(val);
                      calcLebanonFee(governorate, val, isSameDay, isExchange);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                    placeholder={t("standardWeightHint")}
                  />
                  <span className="text-[9px] text-slate-400">{t("overweightNotice")}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">{t("sameDayRush")}</span>
                    <span className="text-[10px] text-slate-400">{t("sameDayRushHint")}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSameDay}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setIsSameDay(val);
                      calcLebanonFee(governorate, weightKg, val, isExchange);
                    }}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">{t("exchangeOrder")}</span>
                    <span className="text-[10px] text-slate-400">{t("exchangeOrderHint")}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isExchange}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setIsExchange(val);
                      calcLebanonFee(governorate, weightKg, isSameDay, val);
                    }}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t("notes")}</label>
              <textarea
                rows={2}
                placeholder={t("notesPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <PackagePlus className="w-5 h-5" />
                  <span>{t("submitOrder")}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}