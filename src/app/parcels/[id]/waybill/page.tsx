"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, AlertCircle, Loader2 } from "lucide-react";

interface WaybillData {
  id: string;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  recipientAltPhone?: string | null;
  governorate: string;
  city: string;
  detailedAddress: string;
  landmark?: string | null;
  codAmount: number | string;
  codCurrency: "USD" | "LBP";
  notes?: string | null;
  createdAt: string;
  merchant: {
    companyName: string;
    contactPhone: string;
    pickupAddress: string;
    pickupCity: string;
  };
}

export default function WaybillLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [parcel, setParcel] = useState<WaybillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWaybill() {
      try {
        const res = await fetch(`/api/parcels/${resolvedParams.id}/waybill`);
        const data = await res.json();
        if (data.success) {
          setParcel(data.parcel);
        } else {
          setError(data.error || "Failed to load parcel label");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadWaybill();
  }, [resolvedParams.id]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-6 rounded-2xl border border-red-200 text-center max-w-sm">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-800">Label Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Visual pseudo Code-128 barcode bars
  const barcodePattern = [
    3, 1, 2, 4, 1, 3, 2, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4,
    2, 3, 1, 2, 4, 1, 3, 2, 2, 1, 4, 3, 1, 2, 3, 1, 4, 2, 1, 3
  ];

  return (
    <div className="min-h-screen bg-slate-200 py-8 px-4 flex flex-col items-center">
      {/* Non-printed Controls Bar */}
      <div className="w-full max-w-[420px] mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Operations Hub
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print Waybill</span>
        </button>
      </div>

      {/* 4x6 Thermal Label Container */}
      <div className="w-full max-w-[420px] bg-white border-2 border-slate-900 p-5 rounded-sm shadow-xl font-sans text-slate-900 print:shadow-none print:border-2 print:border-black print:p-4 print:m-0 print:max-w-none print:w-[4in]">
        
        {/* Top Header: Courier Branding + Routing Hub */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none uppercase">
              COURIER LOGISTICS
            </h1>
            <span className="text-[10px] font-semibold text-slate-600 tracking-wider">
              DOMESTIC EXPRESS DELIVERY
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-black font-mono tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
              {parcel.governorate.slice(0, 3).toUpperCase()}-{parcel.city.slice(0, 3).toUpperCase()}
            </span>
            <span className="block text-[9px] uppercase font-bold text-slate-500 mt-0.5">
              ROUTING HUB
            </span>
          </div>
        </div>

        {/* Sender (Merchant) Section */}
        <div className="py-2 border-b border-slate-300 text-xs">
          <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">
            FROM (SHIPPER)
          </span>
          <p className="font-bold text-slate-900 leading-tight mt-0.5">
            {parcel.merchant.companyName}
          </p>
          <p className="text-[11px] text-slate-600">
            {parcel.merchant.pickupAddress}, {parcel.merchant.pickupCity}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
            Tel: {parcel.merchant.contactPhone}
          </p>
        </div>

        {/* Recipient Delivery Address */}
        <div className="py-3 border-b-2 border-slate-900">
          <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">
            DELIVER TO (CONSIGNEE)
          </span>
          <h2 className="text-base font-black text-slate-900 leading-tight mt-0.5">
            {parcel.recipientName}
          </h2>
          <p className="text-xs font-bold text-slate-800 mt-0.5">
            {parcel.city}, {parcel.governorate}
          </p>
          <p className="text-xs text-slate-700 leading-snug mt-1">
            {parcel.detailedAddress}
          </p>
          {parcel.landmark && (
            <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
              Landmark: {parcel.landmark}
            </p>
          )}
          <div className="mt-2 text-xs font-mono font-bold text-slate-900">
            Tel: {parcel.recipientPhone} {parcel.recipientAltPhone ? `/ ${parcel.recipientAltPhone}` : ""}
          </div>
        </div>

        {/* High-Visibility COD Box */}
        <div className="my-3 p-3 bg-slate-100 border-2 border-slate-900 rounded text-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">
            CASH ON DELIVERY (COD) DUE AT HANDOVER
          </span>
          <div className="text-3xl font-black font-mono tracking-tight mt-0.5">
            {parcel.codCurrency === "USD"
              ? `$${parcel.codAmount}`
              : `${Number(parcel.codAmount).toLocaleString()} LBP`}
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5 block">
            EXACT CASH REQUIRED UPON RECEIPT
          </span>
        </div>

        {/* Delivery Special Instructions */}
        {parcel.notes && (
          <div className="py-2 border-b border-slate-300 text-[10px]">
            <span className="font-bold uppercase text-slate-500">Handling Notes:</span>
            <p className="font-medium text-slate-800">{parcel.notes}</p>
          </div>
        )}

        {/* Barcode & Tracking Number */}
        <div className="pt-3 text-center">
          <div className="flex justify-center items-center h-14 overflow-hidden mb-1 px-2">
            {barcodePattern.map((width, i) => (
              <div
                key={i}
                className="bg-black h-full"
                style={{
                  width: `${width * 2}px`,
                  marginRight: `${(i % 3) + 1}px`,
                }}
              />
            ))}
          </div>
          <p className="font-mono text-base font-black tracking-widest text-slate-900">
            {parcel.trackingNumber}
          </p>
          <div className="flex justify-between items-center text-[9px] text-slate-400 mt-2 font-mono border-t border-slate-200 pt-1">
            <span>Date: {new Date(parcel.createdAt).toLocaleDateString()}</span>
            <span>STANDARD GROUND EXPRESS</span>
          </div>
        </div>
      </div>
    </div>
  );
}