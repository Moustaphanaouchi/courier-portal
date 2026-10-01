"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Loader2, AlertCircle, RefreshCw, CheckSquare, Square } from "lucide-react";
import { Barcode } from "@/components/Barcode";

interface WaybillParcel {
  id: string;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  recipientAltPhone?: string | null;
  governorate: string;
  city: string;
  detailedAddress: string;
  codAmount: number | string;
  codCurrency: "USD" | "LBP";
  notes?: string | null;
  status: string;
  createdAt: string;
  merchant: {
    companyName: string;
    pickupAddress: string;
    pickupCity: string;
    user?: {
      phone: string;
    };
  };
}

export default function AdminBatchPrintPage() {
  const [parcels, setParcels] = useState<WaybillParcel[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchParcels() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parcels/batch-labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.parcels)) {
        setParcels(data.parcels);
        // Default: select all initially
        setSelectedIds(new Set(data.parcels.map((p: WaybillParcel) => p.id)));
      } else {
        setError(data.error || "Failed to load parcel waybills.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to batch API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchParcels();
  }, []);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === parcels.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(parcels.map((p) => p.id)));
    }
  }

  function printSelected() {
    window.print();
  }

  function printSingle(id: string) {
    setSelectedIds(new Set([id]));
    setTimeout(() => {
      window.print();
    }, 50);
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:bg-white print:p-0">
      {/* Top Controls Toolbar (Hidden during print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dispatch"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dispatch
          </Link>
          <span className="text-slate-300">|</span>
          <button
            onClick={toggleSelectAll}
            disabled={loading || parcels.length === 0}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition"
          >
            {selectedIds.size === parcels.length && parcels.length > 0 ? (
              <>
                <CheckSquare className="w-4 h-4 text-blue-600" /> Deselect All
              </>
            ) : (
              <>
                <Square className="w-4 h-4 text-slate-400" /> Select All ({parcels.length})
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchParcels}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>

          <button
            onClick={printSelected}
            disabled={loading || selectedIds.size === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Print Selected ({selectedIds.size})
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-xl border border-slate-200 print:hidden">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-medium text-sm">Loading waybills...</p>
        </div>
      )}

      {error && !loading && (
        <div className="max-w-4xl mx-auto p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-3 print:hidden">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && parcels.length === 0 && (
        <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-xl border border-slate-200 print:hidden">
          <p className="text-slate-600 font-semibold">No active parcels found for batch printing.</p>
          <p className="text-xs text-slate-400 mt-1">Parcels must be in active dispatch or pickup statuses.</p>
        </div>
      )}

      {/* Printable Waybills Stream */}
      <div className="max-w-4xl mx-auto space-y-8 print:space-y-0 print:m-0 print:max-w-none">
        {parcels.map((parcel, idx) => {
          const isSelected = selectedIds.has(parcel.id);
          const codFormatted =
            parcel.codCurrency === "USD"
              ? `$${Number(parcel.codAmount).toFixed(2)} USD`
              : `${Number(parcel.codAmount).toLocaleString()} LBP`;

          return (
            <div
              key={parcel.id || idx}
              className={`bg-white border-2 rounded-xl p-6 shadow-sm transition ${
                isSelected
                  ? "border-slate-800 print:block"
                  : "border-slate-200 opacity-60 print:hidden"
              } print:shadow-none print:border-2 print:border-black print:rounded-none print:p-6 print:m-0 print:break-after-page`}
            >
              {/* Card Selection Header (Hidden on print) */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 print:hidden">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(parcel.id)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Include in Print Run</span>
                </label>

                <button
                  type="button"
                  onClick={() => printSingle(parcel.id)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3 h-3" /> Print This Label Only
                </button>
              </div>

              {/* Waybill Official Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                    CEDEX LOGISTICS
                  </h1>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">
                    Express Dispatch & COD Services | Express Network Support: support@cedex.express
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 bg-slate-900 text-white font-mono text-[11px] font-bold rounded">
                    WAYBILL
                  </span>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">
                    {new Date(parcel.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Barcode Strip */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4 print:bg-transparent print:border-slate-300">
                <Barcode value={parcel.trackingNumber} />
                <p className="font-mono text-base font-bold tracking-widest text-slate-900 mt-1">
                  {parcel.trackingNumber}
                </p>
              </div>

              {/* Sender & Destination Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="border border-slate-200 p-3 rounded-lg print:border-slate-400 overflow-hidden min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    SENDER / MERCHANT
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate">{parcel.merchant.companyName}</p>
                  <p className="text-xs font-medium text-slate-700 mt-0.5 truncate">
                    📍 {parcel.merchant.pickupCity || "Lebanon Hub"}
                  </p>
                  {parcel.merchant.pickupAddress && (
                    <p className="text-[11px] text-slate-500 break-words leading-tight mt-1 line-clamp-2">
                      {parcel.merchant.pickupAddress}
                    </p>
                  )}
                  <p className="text-xs font-mono text-slate-600 mt-1 font-semibold">
                    📞 {parcel.merchant.user?.phone || "N/A"}
                  </p>
                </div>

                <div className="border-2 border-slate-900 p-3 rounded-lg bg-slate-50/50 print:bg-transparent print:border-black overflow-hidden min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        RECIPIENT / DESTINATION
                      </p>
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-slate-200 print:bg-slate-100 rounded text-slate-900 uppercase">
                        {parcel.city}
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-900 leading-snug break-words">
                      {parcel.recipientName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs font-bold font-mono text-slate-900">
                        📞 {parcel.recipientPhone}
                      </span>
                      {parcel.recipientAltPhone && (
                        <span className="text-[11px] font-mono text-slate-600">
                          / {parcel.recipientAltPhone}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-slate-200 print:border-slate-300">
                    <p className="text-[11px] text-slate-800 font-medium leading-snug break-words">
                      {parcel.detailedAddress || "Standard Delivery"}
                    </p>
                    <p className="text-[10px] font-extrabold text-slate-900 uppercase mt-1 tracking-wide">
                      {parcel.city} • {parcel.governorate}
                    </p>
                  </div>
                </div>
              </div>

              {/* COD Strip */}
              <div className="border-2 border-slate-900 rounded-xl p-3.5 bg-amber-50/50 flex items-center justify-between mb-3 print:bg-transparent print:border-black">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                    CASH ON DELIVERY (COD)
                  </p>
                  <p className="text-xs text-slate-600 font-medium">Collect cash upon handover</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">{codFormatted}</p>
                </div>
              </div>

              {parcel.notes && (
                <div className="border border-amber-200 bg-amber-50 p-2.5 rounded-lg mb-3 print:border-slate-300 print:bg-transparent">
                  <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                    Driver Notes
                  </p>
                  <p className="text-xs text-amber-950 font-medium mt-0.5">{parcel.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                <span>Cedex Logistics Express Network</span>
                <span>Track: cedex.express/track/{parcel.trackingNumber}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

