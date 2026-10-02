"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  Printer,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Calendar,
  CreditCard,
  Package,
  ShieldCheck,
  Download,
} from "lucide-react";

interface PayoutDetail {
  id: string;
  referenceNumber: string;
  grossCodUsd: number | string;
  totalFeesUsd: number | string;
  netPayoutUsd: number | string;
  paymentMethod: string;
  createdAt: string;
  merchant: {
    companyName: string;
    pickupAddress: string;
    pickupCity: string;
    user: {
      name: string;
      phone: string;
      email: string;
    };
  };
  parcels: {
    id: string;
    trackingNumber: string;
    recipientName: string;
    city: string;
    codAmount: number | string;
    codCurrency: string;
    deliveryFee: number | string;
    deliveredAt: string | null;
  }[];
}

export default function PayoutInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { lang, isRtl } = useLanguage();
  const [payout, setPayout] = useState<PayoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/payouts/${id}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load settlement invoice");
        }
        setPayout(data.payout);
      } catch (err: any) {
        setError(err.message || "Failed to load voucher invoice");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">Generating Settlement Invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !payout) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-sm space-y-3">
          <p className="text-sm font-bold text-rose-600">{error || "Invoice not found"}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const issueDate = new Date(payout.createdAt).toLocaleDateString(lang === "ar" ? "ar-LB" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-600 selection:text-white" dir={isRtl ? "rtl" : "ltr"}>
      {/* Top Action Bar (Hidden during Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold shadow-xs transition"
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
          <span>{lang === "ar" ? "العودة لسجل السندات" : "Back to Vouchers"}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === "ar" ? "طباعة / حفظ كـ PDF" : "Print / Save PDF"}</span>
          </button>
        </div>
      </div>

      {/* Official Invoice Sheet */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-12 print:p-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b-2 border-slate-900 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-black shadow-md shadow-blue-600/20">
                CX
              </span>
              <span className="text-2xl font-black tracking-tight text-slate-900">Cedex Logistics</span>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Lebanon Express Network & Financial COD Settlement Center
            </p>
            <p className="text-[11px] text-slate-400">
              Hamra Central Hub, Beirut, Lebanon • MOF # 3948102-601
            </p>
          </div>

          <div className="text-start sm:text-end space-y-1">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-black uppercase tracking-wider">
              {lang === "ar" ? "سند تحويل رسمي - مسدد" : "Official Remittance Voucher"}
            </span>
            <h2 className="text-xl font-black font-mono text-slate-900 tracking-tight">
              {payout.referenceNumber}
            </h2>
            <div className="flex items-center sm:justify-end gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{issueDate}</span>
            </div>
          </div>
        </div>

        {/* Merchant & Transfer Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              {lang === "ar" ? "المستفيد (المتجر):" : "Remitted To (Merchant):"}
            </span>
            <h3 className="text-lg font-black text-slate-900">{payout.merchant.companyName}</h3>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              {payout.merchant.user.name} • {payout.merchant.user.phone}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {payout.merchant.pickupAddress}, {payout.merchant.pickupCity}
            </p>
          </div>

          <div className="sm:text-end space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              {lang === "ar" ? "بيانات الدفع والتحويل:" : "Payment Rail & Clearance:"}
            </span>
            <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">
                {payout.paymentMethod.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Status: <span className="font-bold text-emerald-600">Disbursed & Closed ✓</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Batch Clearance: {payout.parcels.length} Delivered Shipments
            </p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-8">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            {lang === "ar" ? "تفاصيل الطرود المسددة في هذا الإشعار:" : "Included Shipments & Fee Ledger:"}
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 text-start">{lang === "ar" ? "رقم الشحنة" : "Tracking #"}</th>
                  <th className="pb-3 text-start">{lang === "ar" ? "الزبين والوجهة" : "Recipient & City"}</th>
                  <th className="pb-3 text-end">{lang === "ar" ? "الكاش المحصل (COD)" : "Gross COD"}</th>
                  <th className="pb-3 text-end">{lang === "ar" ? "أجور الشحن" : "Delivery Fee"}</th>
                  <th className="pb-3 text-end">{lang === "ar" ? "الصافي للمتجر" : "Net Remitted"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payout.parcels.map((p) => {
                  const gross = Number(p.codAmount);
                  const fee = Number(p.deliveryFee || 0);
                  const net = gross - fee;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono font-bold text-slate-900">{p.trackingNumber}</td>
                      <td className="py-3 text-slate-600">
                        {p.recipientName} <span className="text-slate-400">• {p.city}</span>
                      </td>
                      <td className="py-3 text-end font-mono font-bold text-slate-900">
                        {p.codCurrency === "USD" ? `$${gross.toFixed(2)}` : `${gross.toLocaleString()} LBP`}
                      </td>
                      <td className="py-3 text-end font-mono text-rose-600 font-semibold">
                        -${fee.toFixed(2)}
                      </td>
                      <td className="py-3 text-end font-mono font-black text-emerald-700">
                        ${net.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary Ledger */}
        <div className="border-t-2 border-slate-900 pt-6">
          <div className="w-full sm:w-72 ms-auto space-y-2.5">
            <div className="flex justify-between text-xs text-slate-600">
              <span className="font-medium">{lang === "ar" ? "إجمالي الكاش المقبوض:" : "Total Gross COD:"}</span>
              <span className="font-mono font-bold text-slate-900">${Number(payout.grossCodUsd).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-rose-600">
              <span className="font-medium">{lang === "ar" ? "حسم عمولة التوصيل:" : "Less Delivery Fees:"}</span>
              <span className="font-mono font-bold">-${Number(payout.totalFeesUsd).toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-black text-slate-900">
              <span>{lang === "ar" ? "صافي الدفعة المحولة:" : "Net Remittance Total:"}</span>
              <span className="font-mono text-emerald-600 text-xl">
                ${Number(payout.netPayoutUsd).toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>

        {/* Footer & Stamps */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Electronically verified & signed by Cedex Courier Financial Clearing</span>
          </div>

          <div className="text-center sm:text-end">
            <p className="font-semibold text-slate-600">Cedex Operations Center • Beirut</p>
            <p>Direct Inquiries: settlements@cedex.express</p>
          </div>
        </div>

      </div>
    </div>
  );
}