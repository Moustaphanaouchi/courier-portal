"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Receipt,
  CheckCircle,
  UserCircle,
  Banknote,
  Package,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  Phone,
  FileCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
  History,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface ParcelItem {
  id: string;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  city: string;
  codAmount: number | string;
  codCurrency: "USD" | "LBP";
  deliveredAt?: string | null;
  settlementId?: string | null;
  merchant: {
    companyName: string;
  };
}

interface SettlementRecord {
  id: string;
  totalCollectedUsd: number | string;
  totalCollectedLbp: number | string;
  adminNote?: string | null;
  cashHandedOver: boolean;
  verifiedByAdmin: boolean;
  createdAt: string;
}

interface DriverItem {
  id: string;
  vehicleType?: string | null;
  plateNumber?: string | null;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  assignedParcels: ParcelItem[];
  dailySettlements: SettlementRecord[];
}

export default function AdminSettlementsPage() {
  const { isRtl, lang } = useLanguage();
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewFilter, setViewFilter] = useState<"ALL" | "PENDING" | "SETTLED">("ALL");
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);

  // Reconcile Modal State
  const [reconcilingDriver, setReconcilingDriver] = useState<DriverItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function loadSettlements() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settlements");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load settlement data");
      }
      setDrivers(data.drivers || []);
    } catch (err: any) {
      setError(err.message || "Failed to load settlements");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettlements();
  }, []);

  // Compute pending vs settled stats per driver
  function getDriverStats(driver: DriverItem) {
    const allParcels = driver.assignedParcels || [];
    const pendingParcels = allParcels.filter((p) => !p.settlementId);
    const settledParcels = allParcels.filter((p) => !!p.settlementId);

    const pendingUsd = pendingParcels
      .filter((p) => p.codCurrency === "USD")
      .reduce((sum, p) => sum + Number(p.codAmount), 0);
    const pendingLbp = pendingParcels
      .filter((p) => p.codCurrency === "LBP")
      .reduce((sum, p) => sum + Number(p.codAmount), 0);

    const lifetimeUsd = (driver.dailySettlements || []).reduce(
      (sum, s) => sum + Number(s.totalCollectedUsd),
      0
    );
    const lifetimeLbp = (driver.dailySettlements || []).reduce(
      (sum, s) => sum + Number(s.totalCollectedLbp),
      0
    );

    return {
      pendingParcels,
      settledParcels,
      pendingCount: pendingParcels.length,
      settledCount: settledParcels.length,
      pendingUsd,
      pendingLbp,
      lifetimeUsd,
      lifetimeLbp,
      hasPending: pendingParcels.length > 0 && (pendingUsd > 0 || pendingLbp > 0),
    };
  }

  // Filter drivers based on view mode and search query
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const stats = getDriverStats(d);
      const matchesFilter =
        viewFilter === "ALL" ||
        (viewFilter === "PENDING" && stats.hasPending) ||
        (viewFilter === "SETTLED" && stats.settledCount > 0);

      const q = search.toLowerCase();
      const name = d.user?.name?.toLowerCase() || "";
      const phone = d.user?.phone || "";
      const matchesSearch = !search || name.includes(q) || phone.includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [drivers, viewFilter, search]);

  // Overall Hub Totals
  const hubMetrics = useMemo(() => {
    let pendingUsd = 0;
    let pendingLbp = 0;
    let lifetimeUsd = 0;
    let lifetimeLbp = 0;
    let totalPendingParcels = 0;
    let totalSettledParcels = 0;

    drivers.forEach((d) => {
      const stats = getDriverStats(d);
      pendingUsd += stats.pendingUsd;
      pendingLbp += stats.pendingLbp;
      lifetimeUsd += stats.lifetimeUsd;
      lifetimeLbp += stats.lifetimeLbp;
      totalPendingParcels += stats.pendingCount;
      totalSettledParcels += stats.settledCount;
    });

    return {
      pendingUsd,
      pendingLbp,
      lifetimeUsd,
      lifetimeLbp,
      totalPendingParcels,
      totalSettledParcels,
    };
  }, [drivers]);

  // Submit Reconciliation Handover
  async function confirmReconciliation() {
    if (!reconcilingDriver) return;
    const stats = getDriverStats(reconcilingDriver);
    const parcelIds = stats.pendingParcels.map((p) => p.id);

    setSubmitting(true);
    try {
      const res = await fetch("/api/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: reconcilingDriver.id,
          totalUsd: stats.pendingUsd,
          totalLbp: stats.pendingLbp,
          adminNote: adminNote.trim() || undefined,
          parcelIds,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Reconciliation failed");
      }

      setFeedbackMsg({
        text:
          lang === "ar"
            ? `تم تسوية وتأكيد استلام النقد للسائق (${reconcilingDriver.user.name}) بنجاح!`
            : `Cash successfully settled and cleared for ${reconcilingDriver.user.name}!`,
        type: "success",
      });
      setTimeout(() => setFeedbackMsg(null), 5000);

      setReconcilingDriver(null);
      setAdminNote("");
      loadSettlements();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message, type: "error" });
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
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Receipt className="w-4 h-4" />
                <span>{lang === "ar" ? "إغلاق الصندوق وتحصيل النقد" : "Hub Cash Desk & Settlement"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {lang === "ar" ? "تسوية عهدة السائقين النقدية" : "Cash Settlements & Reconciliation"}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 max-w-xl">
                {lang === "ar"
                  ? "سجل إيداعات الكاش الفعلي، مطابقة الذمم المالية بالدولار والليرة، وأرشفة إيصالات القبض."
                  : "Audit physical cash collections, verify driver desk handovers, and track lifetime settled balances."}
              </p>
            </div>

            <button
              onClick={loadSettlements}
              disabled={loading}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition self-start md:self-auto"
              title="Refresh Settlements"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Hub Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                {lang === "ar" ? "دولار معلق (قيد الاستلام)" : "Pending Cash (USD)"}
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-amber-950 mt-1">
                ${hubMetrics.pendingUsd.toFixed(2)}
              </p>
              <span className="text-[10px] font-semibold text-amber-700">
                {hubMetrics.totalPendingParcels} {lang === "ar" ? "طرود غير مقبوضة" : "parcels pending"}
              </span>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/70 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                {lang === "ar" ? "ليرة معلقة (قيد الاستلام)" : "Pending Cash (LBP)"}
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-blue-950 mt-1">
                {hubMetrics.pendingLbp.toLocaleString()} LBP
              </p>
              <span className="text-[10px] font-semibold text-blue-700">
                @ 89,500 LBP/USD
              </span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                {lang === "ar" ? "إجمالي المقبوض في الصندوق (USD)" : "Total Deposited (USD)"}
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-emerald-950 mt-1">
                ${hubMetrics.lifetimeUsd.toFixed(2)}
              </p>
              <span className="text-[10px] font-semibold text-emerald-700">
                {lang === "ar" ? "نقد مسلّم ومؤكد ✓" : "Fully verified in desk"}
              </span>
            </div>

            <div className="bg-purple-50/70 border border-purple-200/70 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                {lang === "ar" ? "إجمالي المقبوض في الصندوق (LBP)" : "Total Deposited (LBP)"}
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-purple-950 mt-1">
                {hubMetrics.lifetimeLbp.toLocaleString()} LBP
              </p>
              <span className="text-[10px] font-semibold text-purple-700">
                {hubMetrics.totalSettledParcels} {lang === "ar" ? "طرود مؤرشفة" : "settled shipments"}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm ${
              feedbackMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setViewFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {lang === "ar" ? "جميع السائقين" : "All Drivers"}
            </button>
            <button
              onClick={() => setViewFilter("PENDING")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewFilter === "PENDING"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>{lang === "ar" ? "بانتظار التسوية" : "Pending Handover"}</span>
              {hubMetrics.totalPendingParcels > 0 && (
                <span className="bg-white text-amber-700 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {hubMetrics.totalPendingParcels}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewFilter("SETTLED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewFilter === "SETTLED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {lang === "ar" ? "سجل المقبوضات المؤكدة" : "Settled History"}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "ar" ? "ابحث باسم السائق أو الهاتف..." : "Search driver..."}
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-600 outline-none ${
                isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
              }`}
            />
          </div>
        </div>

        {/* Drivers Cards Grid */}
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-600">
              {lang === "ar" ? "جاري تحميل سجلات الصندوق..." : "Loading ledger & drivers..."}
            </p>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto opacity-70" />
            <h3 className="text-base font-bold text-slate-800">
              {lang === "ar" ? "لا توجد نتائج مطابقة للتصفية" : "No Matching Records Found"}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === "ar" ? "جرب تغيير خيار التصفية أو مسح البحث." : "Try clearing your search or switching filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDrivers.map((driver) => {
              const stats = getDriverStats(driver);
              const isExpanded = expandedDriverId === driver.id;

              return (
                <div
                  key={driver.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 shadow-sm overflow-hidden ${
                    stats.hasPending
                      ? "border-amber-300 ring-2 ring-amber-400/20"
                      : "border-slate-200"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      {/* Driver Info */}
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                          stats.hasPending
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-slate-100 border-slate-200 text-slate-600"
                        }`}>
                          <UserCircle className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">{driver.user.name}</h3>
                            {stats.hasPending ? (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                                {lang === "ar" ? "مستحق للتسوية" : "Pending Handover"}
                              </span>
                            ) : (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                {lang === "ar" ? "مسوى بالكامل" : "Settled"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-0.5" dir="ltr">
                            {driver.user.phone} • {driver.vehicleType || "Courier Van"}
                          </p>
                        </div>
                      </div>

                      {/* Amounts Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 min-w-[110px]">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {lang === "ar" ? "المعلق ($)" : "Pending ($)"}
                          </span>
                          <span className={`text-base font-black font-mono ${stats.pendingUsd > 0 ? "text-amber-600" : "text-slate-400"}`}>
                            ${stats.pendingUsd.toFixed(2)}
                          </span>
                        </div>

                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 min-w-[120px]">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {lang === "ar" ? "المعلق (ل.ل)" : "Pending (LBP)"}
                          </span>
                          <span className={`text-base font-black font-mono ${stats.pendingLbp > 0 ? "text-blue-600" : "text-slate-400"}`}>
                            {stats.pendingLbp > 0 ? stats.pendingLbp.toLocaleString() : "0"}
                          </span>
                        </div>

                        <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3 min-w-[110px]">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                            {lang === "ar" ? "المقبوض تاريخياً ($)" : "Total Paid ($)"}
                          </span>
                          <span className="text-base font-black font-mono text-emerald-700">
                            ${stats.lifetimeUsd.toFixed(2)}
                          </span>
                        </div>

                        <div className="bg-purple-50/50 border border-purple-200/60 rounded-xl p-3 min-w-[120px]">
                          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                            {lang === "ar" ? "المقبوض تاريخياً (ل.ل)" : "Total Paid (LBP)"}
                          </span>
                          <span className="text-base font-black font-mono text-purple-700">
                            {stats.lifetimeLbp.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Action & Toggle Details */}
                      <div className="flex items-center gap-2">
                        {stats.hasPending && (
                          <button
                            onClick={() => {
                              setReconcilingDriver(driver);
                              setAdminNote("");
                            }}
                            className="bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Banknote className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "استلام النقد" : "Reconcile Cash"}</span>
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedDriverId(isExpanded ? null : driver.id)}
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                          title="View Details"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable History Drawer */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-slate-200 p-5 space-y-4">
                      {/* Active Pending Parcels */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>
                            {lang === "ar" ? "الطرود المسلمة بانتظار توريد النقد:" : "Delivered Parcels Pending Cash Deposit:"}
                          </span>
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                            {stats.pendingCount}
                          </span>
                        </h4>

                        {stats.pendingCount === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            {lang === "ar" ? "لا توجد طرود معلقة حالياً." : "No pending parcels awaiting deposit."}
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {stats.pendingParcels.map((p) => (
                              <div
                                key={p.id}
                                className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-mono font-bold text-slate-900 block">{p.trackingNumber}</span>
                                  <span className="text-[11px] text-slate-500">{p.recipientName} • {p.city}</span>
                                </div>
                                <span className="font-mono font-black text-amber-700">
                                  {p.codCurrency === "USD" ? `$${p.codAmount}` : `${Number(p.codAmount).toLocaleString()} LBP`}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Verified Settlement Receipts History */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{lang === "ar" ? "إيصالات الاستلام المؤكدة في الصندوق:" : "Verified Settlement Batches & Receipts:"}</span>
                        </h4>

                        {(driver.dailySettlements || []).length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            {lang === "ar" ? "لا توجد إيصالات سابقة مسجلة." : "No prior settlements recorded for this driver."}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {driver.dailySettlements.map((s) => (
                              <div
                                key={s.id}
                                className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                      #{s.id.substring(0, 10)}
                                    </span>
                                    <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      {new Date(s.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 text-[11px]">
                                    {s.adminNote || "Counter Cash Deposit Verified"}
                                  </p>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <span className="font-mono font-black text-slate-900 block">
                                      ${Number(s.totalCollectedUsd).toFixed(2)} USD
                                    </span>
                                    <span className="font-mono font-bold text-purple-700 text-[11px] block">
                                      {Number(s.totalCollectedLbp).toLocaleString()} LBP
                                    </span>
                                  </div>
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-1 rounded-md">
                                    {lang === "ar" ? "مقبوض ✓" : "Deposited"}
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

      {/* Confirmation & Physical Cash Verification Modal */}
      {reconcilingDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {lang === "ar" ? "تأكيد استلام عهدة السائق" : "Verify Physical Cash Handover"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {reconcilingDriver.user.name} • {reconcilingDriver.user.phone}
                </p>
              </div>
              <button
                onClick={() => setReconcilingDriver(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Handover Balance Totals */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                {lang === "ar" ? "إجمالي المبلغ المسلم على شباك الصندوق:" : "Total Physical Cash Deposited at Counter:"}
              </span>
              <div className="flex items-center justify-center gap-4">
                <span className="text-2xl font-black font-mono text-emerald-950">
                  ${getDriverStats(reconcilingDriver).pendingUsd.toFixed(2)} USD
                </span>
                <span className="text-slate-300 font-light text-2xl">|</span>
                <span className="text-2xl font-black font-mono text-blue-950">
                  {getDriverStats(reconcilingDriver).pendingLbp.toLocaleString()} LBP
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {getDriverStats(reconcilingDriver).pendingCount}{" "}
                {lang === "ar" ? "طرود سيتم إغلاق عهدتها نهائياً" : "parcels will be stamped as settled"}
              </p>
            </div>

            {/* Hub Admin Note */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                {lang === "ar" ? "ملاحظة تدقيق الصندوق (اختياري)" : "Hub Verification Note (Optional)"}
              </label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "مثال: تم عد النقود ومطابقتها على كاونتر الاستلام..."
                    : "e.g. Cash verified and counted at Hamra central counter..."
                }
                className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReconcilingDriver(null)}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={confirmReconciliation}
                disabled={submitting}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FileCheck className="w-4 h-4" />
                )}
                <span>{lang === "ar" ? "تأكيد الاستلام والإغلاق" : "Confirm & Settle Cash"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}