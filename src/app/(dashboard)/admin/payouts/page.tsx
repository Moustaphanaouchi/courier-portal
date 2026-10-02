"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Banknote,
  Building2,
  CheckCircle,
  FileCheck,
  Package,
  RefreshCw,
  Search,
  AlertCircle,
  X,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Receipt,
  ArrowRight,
} from "lucide-react";

interface ParcelItem {
  id: string;
  trackingNumber: string;
  recipientName: string;
  city: string;
  codAmount: number | string;
  codCurrency: "USD" | "LBP";
  deliveryFee: number | string;
  deliveredAt?: string | null;
}

interface HistoricalPayout {
  id: string;
  grossCodUsd: number | string;
  totalFeesUsd: number | string;
  netPayoutUsd: number | string;
  paymentMethod: string;
  referenceNumber: string;
  createdAt: string;
  parcels: { id: string; trackingNumber: string; codAmount: number | string }[];
}

interface MerchantCalculation {
  id: string;
  companyName: string;
  pickupCity: string;
  contactName: string;
  contactPhone: string;
  pendingCount: number;
  settledCount: number;
  grossUsd: number;
  grossLbp: number;
  feesUsd: number;
  netPayableUsd: number;
  pendingParcels: ParcelItem[];
  historicalPayouts: HistoricalPayout[];
}

export default function AdminMerchantPayoutsPage() {
  const { lang, isRtl } = useLanguage();
  const [merchants, setMerchants] = useState<MerchantCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedMerchantId, setExpandedMerchantId] = useState<string | null>(null);

  // Modal State
  const [disbursingMerchant, setDisbursingMerchant] = useState<MerchantCalculation | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH_COUNTER");
  const [customReference, setCustomReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payouts");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load payouts data");
      setMerchants(data.merchants || []);
    } catch (err: any) {
      setFeedback({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      const q = search.toLowerCase();
      return (
        !search ||
        m.companyName.toLowerCase().includes(q) ||
        m.contactName.toLowerCase().includes(q) ||
        m.contactPhone.includes(q)
      );
    });
  }, [merchants, search]);

  async function handleDisburse() {
    if (!disbursingMerchant) return;
    setSubmitting(true);
    try {
      const parcelIds = disbursingMerchant.pendingParcels.map((p) => p.id);
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: disbursingMerchant.id,
          paymentMethod,
          referenceNumber: customReference || undefined,
          parcelIds,
          grossCodUsd: disbursingMerchant.grossUsd,
          totalFeesUsd: disbursingMerchant.feesUsd,
          netPayoutUsd: disbursingMerchant.netPayableUsd,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Disbursement failed");

      setFeedback({
        text:
          lang === "ar"
            ? `تم إصدار سند تحويل المستحقات وإغلاق ذمة متجر (${disbursingMerchant.companyName}) بنجاح!`
            : `Remittance voucher issued successfully for ${disbursingMerchant.companyName}!`,
        type: "success",
      });
      setTimeout(() => setFeedback(null), 5000);
      setDisbursingMerchant(null);
      setCustomReference("");
      loadData();
    } catch (err: any) {
      setFeedback({ text: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 font-sans ${isRtl ? "font-cairo" : ""}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Receipt className="w-4 h-4" />
                <span>{lang === "ar" ? "إدارة تحويلات المتاجر" : "Merchant Remittance Desk"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {lang === "ar" ? "تصفية وسداد مستحقات التجار" : "Merchant Payouts & Settlement Vouchers"}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 max-w-xl">
                {lang === "ar"
                  ? "احتساب صافي الكاش المقبوض من الزبائن بعد خصم رسوم التوصيل، وإصدار إيصالات الصرف للمتاجر."
                  : "Calculate collected COD minus courier delivery fees and generate official remittance vouchers."}
              </p>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
        )}

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? "right-3.5" : "left-3.5"}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "ar" ? "ابحث باسم المتجر أو الهاتف..." : "Search merchant name or phone..."}
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none ${
                isRtl ? "pr-10 pl-4" : "pl-10 pr-4"
              }`}
            />
          </div>
          <span className="text-xs font-bold text-slate-400">
            {filteredMerchants.length} {lang === "ar" ? "متاجر مسجلة" : "merchants registered"}
          </span>
        </div>

        {/* Merchants List */}
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-600">
              {lang === "ar" ? "جاري احتساب مستحقات المتاجر..." : "Calculating merchant balances..."}
            </p>
          </div>
        ) : filteredMerchants.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto opacity-70" />
            <h3 className="text-base font-bold text-slate-800">
              {lang === "ar" ? "لا توجد متاجر مطابقة" : "No Merchants Found"}
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMerchants.map((merchant) => {
              const hasPayable = merchant.pendingCount > 0 && merchant.netPayableUsd > 0;
              const isExpanded = expandedMerchantId === merchant.id;

              return (
                <div
                  key={merchant.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 shadow-sm overflow-hidden ${
                    hasPayable ? "border-blue-300 ring-2 ring-blue-500/10" : "border-slate-200"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      {/* Merchant Identity */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">{merchant.companyName}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {merchant.pickupCity || "Beirut"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-0.5" dir="ltr">
                            {merchant.contactName} • {merchant.contactPhone}
                          </p>
                        </div>
                      </div>

                      {/* Financials Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 min-w-[100px]">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {lang === "ar" ? "إجمالي الكاش" : "Gross COD"}
                          </span>
                          <span className="text-sm font-black font-mono text-slate-900">
                            ${merchant.grossUsd.toFixed(2)}
                          </span>
                          {merchant.grossLbp > 0 && (
                            <span className="text-[10px] font-bold text-slate-500 block">
                              +{merchant.grossLbp.toLocaleString()} LBP
                            </span>
                          )}
                        </div>

                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 min-w-[100px]">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {lang === "ar" ? "رسوم التوصيل" : "Fees Retained"}
                          </span>
                          <span className="text-sm font-black font-mono text-rose-600">
                            -${merchant.feesUsd.toFixed(2)}
                          </span>
                        </div>

                        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 min-w-[110px]">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                            {lang === "ar" ? "الصافي المستحق" : "Net Payable"}
                          </span>
                          <span className="text-base font-black font-mono text-emerald-800">
                            ${merchant.netPayableUsd.toFixed(2)}
                          </span>
                        </div>

                        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 min-w-[100px]">
                          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                            {lang === "ar" ? "سندات سابقة" : "Vouchers"}
                          </span>
                          <span className="text-sm font-black font-mono text-blue-800">
                            {merchant.historicalPayouts.length} {lang === "ar" ? "مصروفة" : "issued"}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {hasPayable && (
                          <button
                            onClick={() => {
                              setDisbursingMerchant(merchant);
                              setPaymentMethod("CASH_COUNTER");
                              setCustomReference("");
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Banknote className="w-4 h-4" />
                            <span>{lang === "ar" ? "صرف المستحقات" : "Issue Voucher"}</span>
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedMerchantId(isExpanded ? null : merchant.id)}
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                          title="View Parcels & Vouchers"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-slate-200 p-5 space-y-4">
                      {/* Pending Parcels */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            {lang === "ar" ? "الطرود المستحقة للصرف:" : "Delivered Parcels Awaiting Payout:"}
                          </span>
                          <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                            {merchant.pendingCount}
                          </span>
                        </h4>

                        {merchant.pendingCount === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            {lang === "ar" ? "لا توجد طرود غير مدفوعة." : "All delivered parcels have been remitted."}
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {merchant.pendingParcels.map((p) => (
                              <div
                                key={p.id}
                                className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-mono font-bold text-slate-900 block">{p.trackingNumber}</span>
                                  <span className="text-[11px] text-slate-500">{p.recipientName} • {p.city}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono font-black text-slate-900 block">
                                    {p.codCurrency === "USD" ? `$${p.codAmount}` : `${Number(p.codAmount).toLocaleString()} LBP`}
                                  </span>
                                  <span className="text-[10px] text-rose-500 font-semibold block">
                                    Fee: -${p.deliveryFee}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Historical Remittance Vouchers */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{lang === "ar" ? "سجل السندات المصروفة مسبقاً:" : "Historical Remittance Vouchers:"}</span>
                        </h4>

                        {merchant.historicalPayouts.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            {lang === "ar" ? "لم يتم صرف أي سندات سابقة لهذا المتجر." : "No prior remittance vouchers issued."}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {merchant.historicalPayouts.map((voucher) => (
                              <div
                                key={voucher.id}
                                className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                      {voucher.referenceNumber}
                                    </span>
                                    <span className="text-slate-400 text-[11px]">
                                      {new Date(voucher.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-500 mt-1 block">
                                    Method: {voucher.paymentMethod} • {voucher.parcels?.length || 0} shipments settled
                                  </span>
                                </div>

                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Net Paid</span>
                                  <span className="text-sm font-black font-mono text-emerald-700">
                                    ${Number(voucher.netPayoutUsd).toFixed(2)} USD
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Disbursement Modal */}
      {disbursingMerchant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {lang === "ar" ? "إصدار سند صرف مستحقات المتجر" : "Issue Merchant Remittance Voucher"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {disbursingMerchant.companyName} ({disbursingMerchant.contactName})
                </p>
              </div>
              <button onClick={() => setDisbursingMerchant(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>{lang === "ar" ? "إجمالي الكاش المحصل من الزبائن:" : "Gross Collected COD:"}</span>
                <span className="font-mono font-bold text-slate-900">${disbursingMerchant.grossUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-rose-600">
                <span>{lang === "ar" ? "عمولة ورسوم التوصيل المستقطعة:" : "Courier Fees Deducted:"}</span>
                <span className="font-mono font-bold">-${disbursingMerchant.feesUsd.toFixed(2)}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between text-sm font-black text-blue-950">
                <span>{lang === "ar" ? "صافي المبلغ المصروف للمتجر:" : "Net Remittance to Store:"}</span>
                <span className="font-mono text-emerald-700 text-lg">${disbursingMerchant.netPayableUsd.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {lang === "ar" ? "طريقة الدفع / الصرف" : "Disbursement Method"}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="CASH_COUNTER">Cash at Hub Counter (نقداً من شباك الصندوق)</option>
                <option value="WHISH_MONEY">Whish Money Transfer</option>
                <option value="OMT">OMT Intra-Transfer (تحويل OMT)</option>
                <option value="BOB_FINANCE">BOB Finance</option>
                <option value="BANK_TRANSFER">Bank Wire / Fresh USD Deposit</option>
              </select>
            </div>

            {/* Custom Reference */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {lang === "ar" ? "رقم مرجع الإيصال / الحوالة (اختياري)" : "Reference / Transfer MTCN (Optional)"}
              </label>
              <input
                type="text"
                value={customReference}
                onChange={(e) => setCustomReference(e.target.value)}
                placeholder="e.g. WHISH-994012 or OMT-77182"
                className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDisbursingMerchant(null)}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDisburse}
                disabled={submitting}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                <span>{lang === "ar" ? "تأكيد الصرف وإصدار السند" : "Disburse & Issue Voucher"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}