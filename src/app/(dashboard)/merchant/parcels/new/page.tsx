"use client";

import { WhatsAppReceiptButton } from "@/components/WhatsAppReceiptButton";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus, CheckCircle2, ArrowLeft, Loader2, DollarSign, MapPin, Phone, User } from "lucide-react";
import Link from "next/link";

const LEBANON_REGIONS: Record<string, string[]> = {
  "Beirut": ["Achrafieh", "Hamra", "Mar Mikhael", "Verdun", "Ras Beirut", "Badaro"],
  "Mount Lebanon": ["Jounieh", "Jbeil (Byblos)", "Baabda", "Metn / Antelias", "Aley", "Chouf"],
  "North": ["Tripoli", "El Mina", "Koura", "Zgharta", "Batroun", "Bsharri"],
  "South": ["Saida (Sidon)", "Sour (Tyre)", "Jezzine"],
  "Bekaa": ["Zahle", "Chtaura", "Baalbek", "West Bekaa"],
  "Nabatieh": ["Nabatieh El Tahta", "Marjayoun", "Bint Jbeil", "Hasbaya"]
};

export default function NewParcelPage() {
  const router = useRouter();
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
  const [deliveryFee, setDeliveryFee] = useState<number>(3.5);
  const [notes, setNotes] = useState("");

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

  // Adjust city options when governorate changes
  const handleGovernorateChange = (gov: string) => {
    setGovernorate(gov);
    setCity(LEBANON_REGIONS[gov]?.[0] || "");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!merchantId) return;

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/parcels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          recipientName,
          recipientPhone,
          recipientAltPhone: recipientAltPhone || undefined,
          governorate,
          city,
          detailedAddress,
          landmark: landmark || undefined,
          codAmount: Number(codAmount),
          codCurrency,
          deliveryFee: Number(deliveryFee),
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Failed to create parcel");
      }

      setSuccessCode(data.parcel.trackingNumber);
    } catch (err: any) {
      setError(err.message);
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
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900">Parcel Registered!</h2>
          <p className="text-sm text-slate-500 mt-1">Ready for pickup at your registered store address.</p>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-lg font-bold text-blue-600">
            {successCode}
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
              
              {/* Direct Printable Waybill Link */}
              <a
                href={`/parcels/${successCode}/label`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>🖨️ Print Waybill / Thermal Label</span>
              </a>

{/* WhatsApp Verification Actions */}
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
                    notes: (typeof notes !== "undefined" ? notes : "") || undefined,
                  }}
                  label="Send Receipt to Customer via WhatsApp"
                />
              </div>
            <button
              onClick={() => {
                setSuccessCode(null);
                setRecipientName("");
                setRecipientPhone("");
                setDetailedAddress("");
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition"
            >
              Add Another Parcel
            </button>
            <Link
              href="/"
              className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-sm transition text-center"
            >
              Back to Operations Hub
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
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-200">
            Merchant Parcel Entry
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Create New Delivery Order</h1>
              <p className="text-xs text-slate-500">Generate waybill with Lebanese regional routing & COD</p>
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
                <User className="w-3.5 h-3.5" /> Recipient Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya El Hajj"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+961 70 123 456"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Secondary / WhatsApp Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+961 03 987 654"
                    value={recipientAltPhone}
                    onChange={(e) => setRecipientAltPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Destination Address */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Destination Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Governorate *</label>
                  <select
                    value={governorate}
                    onChange={(e) => handleGovernorateChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(LEBANON_REGIONS).map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / District *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LEBANON_REGIONS[governorate]?.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Street, Building, Floor *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bliss Street, Al Noor Bldg, 3rd Floor"
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prominent Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Next to AUB Main Gate, facing pharmacy"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Cash on Delivery (COD) & Rates */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Cash On Delivery (COD) & Fees
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">COD Amount *</label>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Currency *</label>
                  <select
                    value={codCurrency}
                    onChange={(e) => setCodCurrency(e.target.value as "USD" | "LBP")}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="LBP">LBP (Lebanese Pound)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Fee (USD) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Notes / Package Contents</label>
              <textarea
                rows={2}
                placeholder="e.g. Fragile glass bottles. Call before arriving."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <PackagePlus className="w-5 h-5" />
                  <span>Register Parcel & Generate Tracking Code</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
