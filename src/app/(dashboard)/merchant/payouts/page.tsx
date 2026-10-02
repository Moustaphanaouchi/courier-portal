"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  DollarSign, 
  Receipt, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Building2, 
  Wallet, 
  FileText 
} from "lucide-react";

interface ParcelItem {
  id: string;
  trackingNumber: string;
  recipientName: string;
  city: string;
  codAmount: number | string;
  codCurrency: "USD" | "LBP";
  deliveryFee: number | string;
  isMerchantPaid: boolean;
  deliveredAt: string | null;
}

interface PayoutRecord {
  id: string;
  grossCodUsd: number | string;
  totalFeesUsd: number | string;
  netPayoutUsd: number | string;
  paymentMethod: string;
  referenceNumber: string | null;
  isSettled: boolean;
  createdAt: string;
  parcels: { id: string; trackingNumber: string; codAmount: number | string; codCurrency: string }[];
}

interface PayoutSummary {
  pendingGrossUsd: number;
  pendingGrossLbp: number;
  pendingFeesUsd: number;
  netPayableUsd: number;
  pendingCount: number;
}

export default function MerchantPayoutsPage() {
  const { t, isRtl } = useLanguage();
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [parcels, setParcels] = useState<ParcelItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [companyName, setCompanyName] = useState<string>("Cedar Commerce SAL");
  const [loading, setLoading] = useState(true);

  async function loadPayoutData() {
    setLoading(true);
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      const merchantId = meData.user?.merchantId;

      const res = await fetch(`/api/merchant/payouts?merchantId=${merchantId || ""}`);
      const data = await res.json();

      if (data.success) {
        setSummary(data.summary);
        setParcels(data.deliveredParcels);
        setPayouts(data.historicalPayouts);
        if (data.merchant?.companyName) {
          setCompanyName(data.merchant.companyName);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayoutData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200">
          <div>
            <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Operations Hub
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">COD Payout Statements</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Statement for <strong className="text-slate-700">{companyName}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/merchant/parcels/new"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <span>New Order</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={loadPayoutData}
              disabled={loading}
              className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Ledger Balance Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {/* Card 1: Net Remittance Payable */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Net Payable Balance (USD)
                </span>
                <p className="text-3xl font-black text-emerald-600 mt-2 font-mono">
                  ${summary.netPayableUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                Gross USD minus courier handling fees
              </p>
            </div>

            {/* Card 2: Pending LBP Balance */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" /> Gross Cash Collected (LBP)
                </span>
                <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                  {summary.pendingGrossLbp.toLocaleString()} <span className="text-xs font-normal text-slate-500">LBP</span>
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                Collected from {summary.pendingCount} delivered stops
              </p>
            </div>

            {/* Card 3: Courier Delivery Fees */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-purple-600" /> Courier Fees Retained
                </span>
                <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                  ${summary.pendingFeesUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                Deducted automatically per standard tariff
              </p>
            </div>
          </div>
        )}

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Delivered Parcels Audit */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Delivered Shipments Audit</h2>
                <p className="text-xs text-slate-400 mt-0.5">Parcels completed with cash collected</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {parcels.length} Total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Waybill No.</th>
                    <th className="p-3">Recipient / City</th>
                    <th className="p-3">Gross COD</th>
                    <th className="p-3">Courier Fee</th>
                    <th className="p-3 text-right">Payout {t("payoutStatus")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">Loading ledger data...</td>
                    </tr>
                  ) : parcels.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No delivered parcels recorded yet.
                      </td>
                    </tr>
                  ) : (
                    parcels.map((parcel) => (
                      <tr key={parcel.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {parcel.trackingNumber}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{parcel.recipientName}</div>
                          <div className="text-[11px] text-slate-400">{parcel.city}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {parcel.codCurrency === "USD"
                            ? `$${parcel.codAmount}`
                            : `${Number(parcel.codAmount).toLocaleString()} LBP`}
                        </td>
                        <td className="p-3 font-mono text-slate-500">
                          -${parcel.deliveryFee}
                        </td>
                        <td className="p-3 text-right">
                          {parcel.isMerchantPaid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Remitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Clock className="w-3 h-3" /> Ready for Payout
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Remittance Statements */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Receipt className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Settlement Vouchers</h3>
            </div>

            {payouts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>No historical remittance vouchers issued yet.</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Vouchers are generated when courier admins disburse batch settlements.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {payouts.map((payout) => (
                  <div key={payout.id} className="py-3 text-xs">
                    <div className="flex items-center justify-between font-mono font-bold text-slate-900">
                      <span>${Number(payout.netPayoutUsd).toLocaleString()}</span>
                      <span className="text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {payout.paymentMethod}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Ref: {payout.referenceNumber || "Cash Transfer"}</span>
                      <span>{new Date(payout.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}