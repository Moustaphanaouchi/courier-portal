"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Search, 
  ArrowLeft, 
  Store,
  DollarSign,
  AlertCircle
} from "lucide-react";

interface ParcelData {
  trackingNumber: string;
  status: "DRAFT" | "READY_FOR_PICKUP" | "PICKED_UP" | "AT_HUB" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED_ATTEMPT" | "RETURNED" | "CANCELED";
  recipientName: string;
  city: string;
  governorate: string;
  codAmount: number | string;
  codCurrency: "USD" | "LBP";
  createdAt: string;
  updatedAt: string;
  deliveredAt: string | null;
  merchant: {
    companyName: string;
  };
}

const STAGES = [
  { key: "READY_FOR_PICKUP", label: "Order Placed", desc: "Shipment registered with courier" },
  { key: "PICKED_UP", label: "Picked Up", desc: "Collected from merchant & in transit to hub" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "Assigned to driver on delivery route" },
  { key: "DELIVERED", label: "Delivered", desc: "Package handed over & COD collected" },
];

function getStageIndex(status: string): number {
  switch (status) {
    case "DRAFT":
    case "READY_FOR_PICKUP":
      return 0;
    case "PICKED_UP":
    case "AT_HUB":
      return 1;
    case "OUT_FOR_DELIVERY":
    case "FAILED_ATTEMPT":
      return 2;
    case "DELIVERED":
      return 3;
    default:
      return 0;
  }
}

export default function TrackShipmentPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(resolvedParams.code || "");
  const [parcel, setParcel] = useState<ParcelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTracking() {
      if (!resolvedParams.code) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/track/" + encodeURIComponent(resolvedParams.code));
        const data = await res.json();

        if (res.ok && data.success) {
          setParcel(data.parcel);
        } else {
          setError(data.error || "Tracking number not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to query tracking service");
      } finally {
        setLoading(false);
      }
    }

    fetchTracking();
  }, [resolvedParams.code]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push("/track/" + encodeURIComponent(searchInput.trim().toUpperCase()));
    }
  }

  const currentStage = parcel ? getStageIndex(parcel.status) : -1;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
            <ArrowLeft className="w-4 h-4 mr-1" /> Operations Hub
          </Link>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Live Parcel Tracker
          </span>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative flex items-center shadow-sm">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter tracking number (e.g. LB-2026-XXXXXX)"
              className="w-full pl-11 pr-24 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <Search className="w-5 h-5 absolute left-3.5 text-slate-400" />
            <button
              type="submit"
              className="absolute right-2 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
            >
              Track
            </button>
          </div>
        </form>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            Retrieving tracking history...
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h2 className="text-base font-bold text-slate-900">Shipment Not Found</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No parcel matched <span className="font-mono font-bold text-slate-800">{resolvedParams.code}</span>. Please verify the tracking number and try again.
            </p>
          </div>
        ) : parcel ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Waybill Tracking No.
                  </span>
                  <h1 className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                    {parcel.trackingNumber}
                  </h1>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Store className="w-3.5 h-3.5 text-slate-400" />
                    <span>Shipped by <strong className="text-slate-700">{parcel.merchant.companyName}</strong></span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {parcel.status.replace(/_/g, " ")}
                  </span>
                  <div className="text-xs text-slate-400 mt-1">
                    Updated {new Date(parcel.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-4 relative">
                  {STAGES.map((stage, idx) => {
                    const isDone = currentStage >= idx;
                    const isCurrent = currentStage === idx;

                    return (
                      <div key={stage.key} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center relative">
                        <div
                          className={"w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 transition " +
                            (isDone
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-400 border border-slate-200")
                          }
                        >
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>

                        <div className="ml-4 sm:ml-0 sm:mt-3">
                          <p className={"text-xs font-bold " + (isCurrent ? "text-slate-900" : isDone ? "text-slate-700" : "text-slate-400")}>
                            {stage.label}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 max-w-[130px] sm:mx-auto">
                            {stage.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  <MapPin className="w-4 h-4 text-blue-600" /> Destination
                </div>
                <div className="font-bold text-slate-900 text-sm">{parcel.recipientName}</div>
                <div className="text-xs text-slate-600 mt-1 font-medium">
                  {parcel.city}, {parcel.governorate}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Cash on Delivery Due
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {parcel.codCurrency === "USD"
                    ? "$" + parcel.codAmount
                    : Number(parcel.codAmount).toLocaleString() + " LBP"}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Amount payable in cash upon handover</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}