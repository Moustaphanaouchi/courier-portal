"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  DollarSign,
  RefreshCw,
  ArrowLeft,
  MessageCircle,
  ScanLine,
  Navigation,
  X,
  AlertTriangle,
  Clock,
  Ban,
  Banknote,
  Repeat
} from "lucide-react";
import BarcodeScannerModal from "@/components/BarcodeScannerModal";

interface ParcelItem {
  id: string;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  city: string;
  governorate?: string;
  detailedAddress?: string;
  address?: string;
  codAmount: number | string;
  codCurrency: "USD" | "LBP";
  status: string;
  isCodCollected: boolean;
  notes?: string | null;
  merchant: { companyName: string };
}

const FAILURE_REASONS = [
  { id: "UNREACHABLE", label: "Customer Unreachable / Phone Off", icon: Phone },
  { id: "RESCHEDULED", label: "Customer Rescheduled (Call tomorrow)", icon: Clock },
  { id: "WRONG_ADDRESS", label: "Wrong / Incomplete Address", icon: MapPin },
  { id: "REFUSED", label: "Customer Refused / Canceled Order", icon: Ban },
  { id: "NO_CASH", label: "Cash Shortage (Customer has no money ready)", icon: DollarSign },
];

const DEFAULT_EXCHANGE_RATE = 89500; // Lebanese Market Rate LBP per USD

export default function DriverRunPage() {
  const [parcels, setParcels] = useState<ParcelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverName, setDriverName] = useState("Ahmad Kassir");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Status Filter Tabs
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "DELIVERED" | "FAILED">("ALL");

  // Delivery COD Collection Confirmation Modal State
  const [deliveringParcel, setDeliveringParcel] = useState<ParcelItem | null>(null);
  const [paymentCurrency, setPaymentCurrency] = useState<"USD" | "LBP">("USD");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EXCHANGE_RATE);

  // Failure Reason Modal State
  const [failingParcel, setFailingParcel] = useState<ParcelItem | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customFailNote, setCustomFailNote] = useState<string>("");

  // Barcode Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanNotification, setScanNotification] = useState<string | null>(null);

  async function loadRunSheet() {
    setLoading(true);
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      
      const driverId = meData.user?.driverId;
      if (meData.user?.name) setDriverName(meData.user.name);

      const res = await fetch(`/api/driver?driverId=${driverId || ""}`);
      const data = await res.json();
      if (data.success) {
        setParcels(data.parcels);
      }
    } catch (e) {
      console.error("Failed to load run sheet", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRunSheet();
  }, []);

  // Open delivery settlement modal
  function initiateDelivery(parcel: ParcelItem) {
    setDeliveringParcel(parcel);
    setPaymentCurrency(parcel.codCurrency);
    if (parcel.codCurrency === "USD") {
      setCustomAmount(Number(parcel.codAmount).toFixed(2));
    } else {
      setCustomAmount(Number(parcel.codAmount).toString());
    }
  }

  // Handle switching currency inside modal
  function switchCurrency(targetCurr: "USD" | "LBP") {
    if (!deliveringParcel) return;
    setPaymentCurrency(targetCurr);

    const origAmount = Number(deliveringParcel.codAmount);
    if (deliveringParcel.codCurrency === "USD" && targetCurr === "LBP") {
      // Convert USD -> LBP
      const converted = Math.round(origAmount * exchangeRate);
      setCustomAmount(converted.toString());
    } else if (deliveringParcel.codCurrency === "LBP" && targetCurr === "USD") {
      // Convert LBP -> USD
      const converted = (origAmount / exchangeRate).toFixed(2);
      setCustomAmount(converted);
    } else {
      setCustomAmount(origAmount.toString());
    }
  }

  // Finalize delivery with selected currency & cash collection
  async function confirmCollectedDelivery() {
    if (!deliveringParcel) return;
    const finalAmount = parseFloat(customAmount) || 0;
    
    setUpdatingId(deliveringParcel.id);
    const parcelId = deliveringParcel.id;
    setDeliveringParcel(null);

    try {
      const res = await fetch("/api/driver", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          parcelId, 
          status: "DELIVERED",
          collectedCurrency: paymentCurrency,
          collectedAmount: finalAmount,
          notes: paymentCurrency !== deliveringParcel.codCurrency 
            ? `Paid in ${paymentCurrency} (${finalAmount.toLocaleString()}) converted at rate ${exchangeRate.toLocaleString()} LBP/$`
            : undefined
        }),
      });
      const data = await res.json();
      if (data.success) {
        setParcels((prev) =>
          prev.map((p) =>
            p.id === parcelId
              ? { 
                  ...p, 
                  status: "DELIVERED", 
                  isCodCollected: true,
                  codCurrency: paymentCurrency,
                  codAmount: finalAmount
                }
              : p
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  }

  async function updateStatus(parcelId: string, status: "DELIVERED" | "FAILED_ATTEMPT", reasonNote?: string) {
    setUpdatingId(parcelId);
    try {
      const res = await fetch("/api/driver", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          parcelId, 
          status,
          notes: reasonNote || undefined 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setParcels((prev) =>
          prev.map((p) =>
            p.id === parcelId
              ? { 
                  ...p, 
                  status, 
                  isCodCollected: status === "DELIVERED",
                  notes: reasonNote ? reasonNote : p.notes
                }
              : p
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  }

  function handleConfirmFailure() {
    if (!failingParcel || !selectedReason) return;
    const finalReason = customFailNote.trim() 
      ? `${selectedReason}: ${customFailNote.trim()}` 
      : selectedReason;

    updateStatus(failingParcel.id, "FAILED_ATTEMPT", finalReason);
    setFailingParcel(null);
    setSelectedReason("");
    setCustomFailNote("");
  }

  // Handle scanned barcode from camera
  async function handleBarcodeScanned(trackingNumber: string) {
    setIsScannerOpen(false);
    const cleanedCode = trackingNumber.trim().toUpperCase();

    const targetParcel = parcels.find(
      (p) => p.trackingNumber.toUpperCase() === cleanedCode
    );

    if (targetParcel) {
      initiateDelivery(targetParcel);
    } else {
      setScanNotification(`⚠️ ${cleanedCode} is not in your active run sheet!`);
      setTimeout(() => setScanNotification(null), 4000);
    }
  }

  // Aggregate cash collected totals
  const totalUsdCollected = parcels
    .filter((p) => p.status === "DELIVERED" && p.codCurrency === "USD")
    .reduce((sum, p) => sum + Number(p.codAmount), 0);

  const totalLbpCollected = parcels
    .filter((p) => p.status === "DELIVERED" && p.codCurrency === "LBP")
    .reduce((sum, p) => sum + Number(p.codAmount), 0);

  const pendingCount = parcels.filter((p) => ["OUT_FOR_DELIVERY", "PENDING_PICKUP", "PICKED_UP"].includes(p.status)).length;
  const deliveredCount = parcels.filter((p) => p.status === "DELIVERED").length;
  const failedCount = parcels.filter((p) => p.status === "FAILED_ATTEMPT").length;

  const filteredParcels = useMemo(() => {
    if (activeTab === "PENDING") {
      return parcels.filter((p) => ["OUT_FOR_DELIVERY", "PENDING_PICKUP", "PICKED_UP"].includes(p.status));
    }
    if (activeTab === "DELIVERED") {
      return parcels.filter((p) => p.status === "DELIVERED");
    }
    if (activeTab === "FAILED") {
      return parcels.filter((p) => p.status === "FAILED_ATTEMPT");
    }
    return parcels;
  }, [parcels, activeTab]);

  return (
    <div className="min-h-screen bg-slate-100 pb-28">
      {/* Header bar */}
      <header className="bg-slate-900 text-white px-4 py-3 sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5" /> Driver Run
              </div>
              <h1 className="text-base font-bold leading-tight truncate max-w-[170px]">{driverName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <ScanLine className="w-4 h-4" />
              <span>Scan</span>
            </button>
            <button
              onClick={loadRunSheet}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Realtime Notification Banner */}
      {scanNotification && (
        <div className="max-w-md mx-auto px-4 mt-3">
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm ${
            scanNotification.startsWith("✓")
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}>
            <span>{scanNotification}</span>
            <button onClick={() => setScanNotification(null)} className="text-slate-400 hover:text-slate-600 text-xs">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Functional Lebanese & USD Cash Remittance Tally */}
      <div className="max-w-md mx-auto px-4 mt-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Banknote className="w-4 h-4 text-emerald-600" /> Driver Cash Remittance
            </span>
            <span className="text-blue-600 font-bold">{deliveredCount} / {parcels.length} Done</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* USD Cash Card */}
            <div className="bg-emerald-50 border border-emerald-200/70 p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">USD Cash ($)</span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.5 rounded">USD</span>
              </div>
              <p className="text-xl font-black text-emerald-950 mt-1 font-mono">
                ${totalUsdCollected.toFixed(2)}
              </p>
            </div>

            {/* Lebanese LBP Cash Card */}
            <div className="bg-blue-50 border border-blue-200/70 p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">Lebanese LBP (ل.ل)</span>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded">LBP</span>
              </div>
              <p className="text-xl font-black text-blue-950 mt-1 font-mono">
                {totalLbpCollected.toLocaleString()}
              </p>
              <span className="text-[10px] font-medium text-blue-600 block mt-0.5">
                {totalLbpCollected > 0 ? `≈ $${(totalLbpCollected / exchangeRate).toFixed(1)} USD equiv` : "0 L.L. collected"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-md mx-auto px-4 mt-3">
        <div className="grid grid-cols-4 gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`py-1.5 rounded-lg transition ${activeTab === "ALL" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"}`}
          >
            All ({parcels.length})
          </button>
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`py-1.5 rounded-lg transition ${activeTab === "PENDING" ? "bg-white text-blue-700 shadow-sm" : "hover:text-slate-900"}`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("DELIVERED")}
            className={`py-1.5 rounded-lg transition ${activeTab === "DELIVERED" ? "bg-white text-emerald-700 shadow-sm" : "hover:text-slate-900"}`}
          >
            Done ({deliveredCount})
          </button>
          <button
            onClick={() => setActiveTab("FAILED")}
            className={`py-1.5 rounded-lg transition ${activeTab === "FAILED" ? "bg-white text-rose-700 shadow-sm" : "hover:text-slate-900"}`}
          >
            Failed ({failedCount})
          </button>
        </div>
      </div>

      {/* Parcel Stops List */}
      <main className="max-w-md mx-auto px-4 mt-3 space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading assigned stops...</div>
        ) : filteredParcels.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No Parcels in this view</p>
            <p className="text-xs text-slate-400 mt-1">
              Select another tab or refresh to retrieve new assignments.
            </p>
          </div>
        ) : (
          filteredParcels.map((parcel, index) => {
            const isDelivered = parcel.status === "DELIVERED";
            const isFailed = parcel.status === "FAILED_ATTEMPT";
            const isUpdating = updatingId === parcel.id;
            const fullAddress = parcel.detailedAddress || parcel.address || "";
            const mapsQuery = encodeURIComponent(`${parcel.city} ${fullAddress}, Lebanon`);

            return (
              <div
                key={parcel.id}
                className={`bg-white rounded-2xl border p-4 shadow-sm transition ${
                  isDelivered
                    ? "border-emerald-200 bg-emerald-50/20"
                    : isFailed
                    ? "border-red-200 bg-red-50/20"
                    : "border-slate-200"
                }`}
              >
                {/* Top Row: Stop Number, Tracking, COD */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center font-mono">
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-600 block">
                        {parcel.trackingNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {parcel.merchant.companyName}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-slate-900 block">
                      {parcel.codCurrency === "USD"
                        ? `$${Number(parcel.codAmount).toFixed(2)}`
                        : `${Number(parcel.codAmount).toLocaleString()} LBP`}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      {isDelivered ? "Collected" : "COD Due"}
                    </span>
                  </div>
                </div>

                {/* Middle: Recipient & Address */}
                <div className="py-3">
                  <h3 className="font-bold text-slate-900 text-sm">{parcel.recipientName}</h3>
                  <div className="flex items-start gap-1.5 text-xs text-slate-600 mt-1">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">{parcel.city}</span>
                      <p className="text-slate-500 text-[11px] leading-tight mt-0.5">
                        {fullAddress}
                      </p>
                    </div>
                  </div>
                  {parcel.notes && (
                    <div className="mt-2 text-[11px] bg-slate-50 text-slate-600 p-2 rounded-lg border border-slate-100 italic">
                      Note: {parcel.notes}
                    </div>
                  )}
                </div>

                {/* Action Buttons: Call, WhatsApp, Navigation */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <a
                    href={`tel:${parcel.recipientPhone}`}
                    className="flex items-center justify-center gap-1 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${parcel.recipientPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Hello ${parcel.recipientName}, this is your courier driver delivering your order (${parcel.trackingNumber}). Are you available to receive it?`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1 py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl border border-emerald-200 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1 py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-xs rounded-xl border border-blue-200 transition"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>Maps</span>
                  </a>
                </div>

                {/* Status Toggle Row */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  {isDelivered ? (
                    <div className="flex items-center justify-between py-1.5 px-3 bg-emerald-100/70 text-emerald-800 rounded-xl text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>
                          Delivered ({parcel.codCurrency === "USD" ? `$${Number(parcel.codAmount).toFixed(2)}` : `${Number(parcel.codAmount).toLocaleString()} LBP`})
                        </span>
                      </div>
                      <button
                        onClick={() => initiateDelivery(parcel)}
                        disabled={isUpdating}
                        className="text-[10px] text-slate-600 hover:text-slate-900 underline font-semibold"
                      >
                        Adjust COD
                      </button>
                    </div>
                  ) : isFailed ? (
                    <div className="flex items-center justify-between py-1.5 px-3 bg-rose-50 border border-rose-200 rounded-xl">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Delivery Failed</span>
                      </div>
                      <button
                        onClick={() => initiateDelivery(parcel)}
                        disabled={isUpdating}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                      >
                        Mark Delivered
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setFailingParcel(parcel);
                          setSelectedReason(FAILURE_REASONS[0].label);
                        }}
                        disabled={isUpdating}
                        className="py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Couldn't Deliver</span>
                      </button>
                      <button
                        onClick={() => initiateDelivery(parcel)}
                        disabled={isUpdating}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Delivery</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Floating Bottom Quick-Scan Button */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-md border-t border-slate-200 z-10 flex justify-center">
        <button
          onClick={() => setIsScannerOpen(true)}
          className="max-w-md w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
        >
          <ScanLine className="w-5 h-5" />
          <span>Scan Parcel Barcode</span>
        </button>
      </div>

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScan={handleBarcodeScanned}
            onScanSuccess={handleBarcodeScanned}
        />
      )}

      {/* Lebanese Cash & Settlement Modal */}
      {deliveringParcel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Cash Collection</h3>
                <p className="text-xs text-slate-500">{deliveringParcel.recipientName} • <span className="font-mono">{deliveringParcel.trackingNumber}</span></p>
              </div>
              <button
                onClick={() => setDeliveringParcel(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Currency Switcher */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Which currency did customer pay?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => switchCurrency("USD")}
                  className={`p-3 rounded-xl border text-center font-bold text-sm flex flex-col items-center gap-1 transition ${
                    paymentCurrency === "USD"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-base">💵 USD ($)</span>
                  <span className="text-[11px] font-normal text-slate-500">US Dollars Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchCurrency("LBP")}
                  className={`p-3 rounded-xl border text-center font-bold text-sm flex flex-col items-center gap-1 transition ${
                    paymentCurrency === "LBP"
                      ? "border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/20"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-base">🇱🇧 LBP (ل.ل)</span>
                  <span className="text-[11px] font-normal text-slate-500">Lebanese Pounds</span>
                </button>
              </div>
            </div>

            {/* Collected Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-600">
                  Actual Amount Collected in {paymentCurrency}:
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Original: {deliveringParcel.codCurrency === "USD" ? `$${Number(deliveringParcel.codAmount).toFixed(2)}` : `${Number(deliveringParcel.codAmount).toLocaleString()} LBP`}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full text-lg font-black font-mono border-2 border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600"
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-slate-400 uppercase">
                  {paymentCurrency}
                </span>
              </div>
            </div>

            {/* Conversion Helper (if paying in LBP when booked in USD) */}
            {paymentCurrency === "LBP" && deliveringParcel.codCurrency === "USD" && (
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between text-blue-900 font-medium">
                  <span>Market Rate applied:</span>
                  <span className="font-mono font-bold">{exchangeRate.toLocaleString()} LBP / $</span>
                </div>
                <p className="text-[11px] text-blue-700">
                  ${Number(deliveringParcel.codAmount).toFixed(2)} × {exchangeRate.toLocaleString()} = <span className="font-bold font-mono">{Math.round(Number(deliveringParcel.codAmount) * exchangeRate).toLocaleString()} LBP</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeliveringParcel(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmCollectedDelivery}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Confirm Cash & Deliver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failure Reason Modal */}
      {failingParcel && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Select Failure Reason</h3>
                <p className="text-xs font-mono text-slate-500">{failingParcel.trackingNumber}</p>
              </div>
              <button
                onClick={() => setFailingParcel(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {FAILURE_REASONS.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedReason === r.label;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReason(r.label)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 transition ${
                      isSelected
                        ? "border-rose-500 bg-rose-50/70 text-rose-950 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-rose-600" : "text-slate-400"}`} />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Additional Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Building concierge was not present..."
                value={customFailNote}
                onChange={(e) => setCustomFailNote(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setFailingParcel(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFailure}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Save Failure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}