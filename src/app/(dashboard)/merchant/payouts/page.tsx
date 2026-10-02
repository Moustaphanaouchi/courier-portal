"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  Banknote,
  Clock,
  CheckCircle2,
  FileText,
  DollarSign,
  TrendingUp,
  CreditCard,
  ArrowRight,
  ExternalLink,
  Printer,
} from "lucide-react";

interface Parcel {
  id: string;
  trackingNumber: string;
  recipientName: string;
  city: string;
  codAmount: number | string;
  codCurrency: string;
  deliveryFee: number | string;
  isMerchantPaid: boolean;
  deliveredAt: string | null;
  payoutId: string | null;
}

interface HistoricalPayout {
  id: string;
  referenceNumber: string;
  grossCodUsd: number | string;
  totalFeesUsd: number | string;
  netPayoutUsd: number | string;
  paymentMethod: string;
  createdAt: string;
  parcels: { id: string; trackingNumber: string; codAmount: number | string }[];
}

export default function MerchantPayoutsPage() {
  const { lang, isRtl } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    summary: {
      pendingGrossUsd: number;
      pendingGrossLbp: number;
      pendingFeesUsd: number;
      netPayableUsd: number;
      pendingCount: number;
    };
    deliveredParcels: Parcel[];
    historicalPayouts: HistoricalPayout[];
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/merchant/payouts");
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load payouts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const summary = data?.summary || {
    pendingGrossUsd: 0,
    pendingGrossLbp: 0,
    pendingFeesUsd: 0,
    netPayableUsd: 0,
    pendingCount: 0,
  };

  const pendingParcels = data?.deliveredParcels.filter((p) => !p.isMerchantPaid) || [];
  const historicalPayouts = data?.historicalPayouts || [];

  return (
    <div className={`min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans ${isRtl ? "font-cairo" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Banknote className="w-4 h-4" />
                <span>{lang === "ar" ? "الذمم المالية والتحويلات" : "Financial Remittance"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {lang === "ar" ? "أرصدة المبيعات وسندات الصرف" : "COD Payouts & Settlement Invoices"}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                {lang === "ar"
                  ? "متابعة الكاش المحصل من الزبائن، تفقيط رسوم الشحن، واستعراض فواتير التحويل الرسمية."
                  : "Track gross COD collections, courier delivery fees, and view official tax remittance invoices."}
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {lang === "ar" ? "الكاش المعلق بالدولار" : "Gross Pending (USD)"}
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1">
                ${summary.pendingGrossUsd.toFixed(2)}
              </p>
              <span className="text-[10px] text-slate-500 font-medium">
                {summary.pendingCount} {lang === "ar" ? "طرد بانتظار الصرف" : "orders waiting remittance"}
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {lang === "ar" ? "الكاش المعلق بالليرة" : "Gross Pending (LBP)"}
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1">
                {summary.pendingGrossLbp.toLocaleString()} LBP
              </p>
              <span className="text-[10px] text-blue-600 font-medium">@ 89,500 LBP/USD</span>
            </div>

            <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-100">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                {lang === "ar" ? "رسوم الشحن المستقطعة" : "Courier Fees Deducted"}
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-rose-700 mt-1">
                -${summary.pendingFeesUsd.toFixed(2)}
              </p>
              <span className="text-[10px] text-rose-600 font-medium">Auto-deducted from payout</span>
            </div>

            <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                {lang === "ar" ? "الصافي المستحق لك الآن" : "Net Remittance Balance"}
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-emerald-700 mt-1">
                ${summary.netPayableUsd.toFixed(2)}
              </p>
              <span className="text-[10px] font-bold text-emerald-800">Ready for disbursement</span>
            </div>
          </div>
        </div>

        {/* Remittance Settlement Vouchers */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {lang === "ar" ? "فواتير وسندات التحويل المصروفة" : "Settlement Vouchers & Official Invoices"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {lang === "ar"
                  ? "اضغط على أي رقم مرجع لعرض وطباعة الفاتورة التفصيلية مع ختم المركز."
                  : "Click any voucher reference number to inspect and print the full tax remittance invoice."}
              </p>
            </div>
          </div>

          {historicalPayouts.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                {lang === "ar" ? "لم تصدر أي سندات صرف حتى الآن" : "No historical remittance vouchers issued yet."}
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                {lang === "ar"
                  ? "يتم إصدار الفواتير فور قيام إدارة المركز بتحويل مبالغ الـ COD المسلمة إلى حسابكم."
                  : "Invoices are generated when courier admins disburse batch settlements to your store."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {historicalPayouts.map((voucher) => (
                <div key={voucher.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/merchant/payouts/${voucher.id}`}
                        className="font-mono font-black text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition underline-offset-4 hover:underline"
                      >
                        <span>{voucher.referenceNumber}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </Link>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {lang === "ar" ? "مسدد ✓" : "Paid"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium">
                      {new Date(voucher.createdAt).toLocaleDateString()} • Method:{" "}
                      <span className="font-semibold text-slate-700">{voucher.paymentMethod.replace("_", " ")}</span> •{" "}
                      {voucher.parcels?.length || 0} shipments remitted
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-start sm:text-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === "ar" ? "صافي الدفعة المحولة" : "Net Remitted"}
                      </span>
                      <span className="text-base font-black font-mono text-emerald-600">
                        ${Number(voucher.netPayoutUsd).toFixed(2)} USD
                      </span>
                    </div>

                    <Link
                      href={`/merchant/payouts/${voucher.id}`}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{lang === "ar" ? "عرض الفاتورة" : "View Invoice"}</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Shipments Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900">
            {lang === "ar" ? "الطرود المسلمة بانتظار الإشعار القادم" : "Delivered Shipments Pending Remittance"}
          </h2>

          {pendingParcels.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              {lang === "ar" ? "لا توجد طرود معلقة. جميع الطلبات المسلمة تم تسديدها بالكامل!" : "No pending delivered orders. Everything has been settled!"}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-3 text-start">{lang === "ar" ? "رقم الشحنة" : "Tracking #"}</th>
                    <th className="pb-3 text-start">{lang === "ar" ? "المستلم والمدينة" : "Recipient"}</th>
                    <th className="pb-3 text-end">{lang === "ar" ? "الكاش المحصل" : "Gross COD"}</th>
                    <th className="pb-3 text-end">{lang === "ar" ? "أجور التوصيل" : "Fee"}</th>
                    <th className="pb-3 text-end">{lang === "ar" ? "صافي المتجر" : "Net"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingParcels.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 font-mono font-bold text-slate-900">{p.trackingNumber}</td>
                      <td className="py-3 text-slate-600">{p.recipientName} ({p.city})</td>
                      <td className="py-3 text-end font-mono font-bold text-slate-900">
                        {p.codCurrency === "USD" ? `$${p.codAmount}` : `${Number(p.codAmount).toLocaleString()} LBP`}
                      </td>
                      <td className="py-3 text-end font-mono text-rose-500">-${p.deliveryFee}</td>
                      <td className="py-3 text-end font-mono font-black text-emerald-600">
                        ${(Number(p.codAmount) - Number(p.deliveryFee)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}