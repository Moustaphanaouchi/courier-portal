"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  ArrowLeft,
  ArrowRight,
  Phone,
  MessageCircle,
  AlertTriangle,
  Building2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface ParcelData {
  trackingNumber: string;
  status: string;
  recipientName: string;
  city: string;
  governorate: string;
  detailedAddress: string;
  codAmount: number | string;
  codCurrency: "USD" | "LBP";
  driverNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string | null;
  merchant: {
    companyName: string;
    pickupCity?: string | null;
  };
  driver?: {
    vehicleType?: string | null;
    user: {
      name: string;
      phone: string;
    };
  } | null;
}

export default function TrackingResultPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const code = resolvedParams.code?.toUpperCase();
  const router = useRouter();
  const { lang, isRtl } = useLanguage();

  const [parcel, setParcel] = useState<ParcelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCode, setNewCode] = useState("");

  async function fetchTracking(trackCode: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(trackCode)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Shipment not found");
      }
      setParcel(data.parcel);
    } catch (err: any) {
      setError(err.message || "Unable to locate shipment");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (code) {
      fetchTracking(code);
    }
  }, [code]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (newCode.trim()) {
      router.push(`/track/${newCode.trim().toUpperCase()}`);
    }
  }

  // Derive status step progression
  function getMilestoneIndex(status: string) {
    switch (status) {
      case "DRAFT":
      case "READY_FOR_PICKUP":
        return 1;
      case "PICKED_UP":
      case "AT_HUB":
        return 2;
      case "OUT_FOR_DELIVERY":
        return 3;
      case "DELIVERED":
        return 4;
      case "FAILED_ATTEMPT":
      case "RETURNED":
      case "CANCELED":
        return -1;
      default:
        return 1;
    }
  }

  const milestone = parcel ? getMilestoneIndex(parcel.status) : 0;
  const isFailed = milestone === -1;

  function formatStatusLabel(st: string) {
    switch (st) {
      case "READY_FOR_PICKUP":
      case "DRAFT":
        return lang === "ar" ? "تم تسجيل الشحنة" : "Order Placed & Registered";
      case "PICKED_UP":
        return lang === "ar" ? "تم الاستلام من المتجر" : "Picked Up from Sender";
      case "AT_HUB":
        return lang === "ar" ? "في المستودع المركزي" : "Sorted at Central Hub";
      case "OUT_FOR_DELIVERY":
        return lang === "ar" ? "خرجت للتوصيل مع السائق" : "Out for Delivery";
      case "DELIVERED":
        return lang === "ar" ? "تم التسليم بنجاح" : "Successfully Delivered";
      case "FAILED_ATTEMPT":
        return lang === "ar" ? "محاولة تسليم غير مكتملة" : "Delivery Attempt Failed";
      case "RETURNED":
        return lang === "ar" ? "راجعة للمصدر" : "Returned to Merchant";
      case "CANCELED":
        return lang === "ar" ? "ملغاة" : "Canceled";
      default:
        return st;
    }
  }

  return (
    <div
      className={`min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white ${
        isRtl ? "font-cairo" : ""
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-slate-900 hover:text-blue-600 transition"
          >
            <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-sm shadow-blue-600/20">
              CX
            </span>
            <span className="font-black text-base tracking-tight">Cedex Express</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              {lang === "ar" ? "تتبع مباشر" : "Live Milestone Tracking"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        {/* Tracking Search Input */}
        <form onSubmit={handleSearch} className="relative group">
          <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search
              className={`w-5 h-5 absolute text-slate-400 pointer-events-none ${
                isRtl ? "right-4" : "left-4"
              }`}
            />
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder={lang === "ar" ? "ابحث برقم بوليصة آخر..." : "Search another tracking code (e.g. LB-2026-XXXXXX)..."}
              className={`w-full py-3 text-sm bg-transparent outline-none text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400 uppercase ${
                isRtl ? "pr-11 pl-28 text-right" : "pl-11 pr-28 text-left"
              }`}
            />
            <button
              type="submit"
              className={`absolute top-1.5 bottom-1.5 px-5 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition duration-200 shadow-sm ${
                isRtl ? "left-1.5" : "right-1.5"
              }`}
            >
              {lang === "ar" ? "تتبع" : "Track"}
            </button>
          </div>
        </form>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              {lang === "ar" ? "جاري جلب تفاصيل الشحنة من النظام..." : "Fetching live parcel status..."}
            </p>
          </div>
        ) : error || !parcel ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {lang === "ar" ? "لم يتم العثور على الشحنة" : "Shipment Not Found"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {error || "Please verify the tracking code on your waybill or order confirmation."}
              </p>
            </div>
            <Link
              href="/track"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              <span>{lang === "ar" ? "العودة لصفحة البحث" : "Back to Tracking Portal"}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Hero Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/50 overflow-hidden">
              <div
                className={`h-2 w-full ${
                  parcel.status === "DELIVERED"
                    ? "bg-emerald-500"
                    : isFailed
                    ? "bg-rose-500"
                    : "bg-blue-600 animate-pulse"
                }`}
              ></div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      {lang === "ar" ? "رقم التتبع الرسمي" : "Official Tracking Number"}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
                      {parcel.trackingNumber}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {lang === "ar" ? "المرسل:" : "Shipped via"}{" "}
                      <span className="font-bold text-slate-700">{parcel.merchant.companyName}</span>
                    </p>
                  </div>

                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs shadow-xs ${
                      parcel.status === "DELIVERED"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : parcel.status === "OUT_FOR_DELIVERY"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : isFailed
                        ? "bg-rose-50 text-rose-800 border border-rose-200"
                        : "bg-blue-50 text-blue-800 border border-blue-200"
                    }`}
                  >
                    {parcel.status === "DELIVERED" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : parcel.status === "OUT_FOR_DELIVERY" ? (
                      <Truck className="w-4 h-4 text-amber-600" />
                    ) : isFailed ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <Package className="w-4 h-4 text-blue-600" />
                    )}
                    <span>{formatStatusLabel(parcel.status)}</span>
                  </div>
                </div>

                {/* COD Cash Notice Banner */}
                <div className="my-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {lang === "ar" ? "المبلغ المطلوب تحضيره نقداً (COD):" : "Cash Due on Handover (COD):"}
                    </span>
                    <p className="text-xl sm:text-2xl font-black font-mono text-emerald-700 mt-0.5">
                      {parcel.codCurrency === "USD"
                        ? `$${Number(parcel.codAmount).toFixed(2)} USD`
                        : `${Number(parcel.codAmount).toLocaleString()} LBP`}
                    </p>
                  </div>

                  <div className="text-xs text-slate-500 font-medium sm:text-end">
                    <span>
                      {parcel.status === "DELIVERED"
                        ? lang === "ar"
                          ? "تم استلام المبلغ نقداً ✓"
                          : "Cash Collected & Cleared ✓"
                        : lang === "ar"
                        ? "يرجى تجهيز المبلغ المحدد لتسهيل استلام الطرد."
                        : "Please have exact change ready for driver handover."}
                    </span>
                  </div>
                </div>

                {/* Active Driver Contact Card (When Out for Delivery) */}
                {parcel.driver && parcel.status === "OUT_FOR_DELIVERY" && (
                  <div className="mb-8 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-black">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                          {lang === "ar" ? "السائق المكلف بالتوصيل:" : "Assigned Courier Driver:"}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{parcel.driver.user.name}</h4>
                        <p className="text-xs text-slate-500 font-mono" dir="ltr">
                          {parcel.driver.user.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${parcel.driver.user.phone}`}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>{lang === "ar" ? "اتصال" : "Call Driver"}</span>
                      </a>
                      <a
                        href={`https://wa.me/${parcel.driver.user.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Milestone Stepper */}
                <div className="space-y-6 pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {lang === "ar" ? "مراحل الشحنة:" : "Delivery Milestones:"}
                  </h3>

                  <div className="relative border-s-2 border-slate-200 ms-3 space-y-8 pb-2">
                    {/* Step 1: Registered */}
                    <div className="relative ps-6">
                      <div
                        className={`absolute -start-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ring-2 ${
                          milestone >= 1
                            ? "bg-blue-600 ring-blue-500"
                            : "bg-slate-300 ring-slate-200"
                        }`}
                      ></div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {lang === "ar" ? "تسجيل الطلب لدى المركز" : "Shipment Registered"}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {parcel.merchant.companyName} • {parcel.merchant.pickupCity || "Beirut"}
                        </p>
                        <span className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(parcel.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Step 2: Sorting at Hub */}
                    <div className="relative ps-6">
                      <div
                        className={`absolute -start-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ring-2 ${
                          milestone >= 2
                            ? "bg-blue-600 ring-blue-500"
                            : "bg-slate-300 ring-slate-200"
                        }`}
                      ></div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {lang === "ar" ? "المعالجة والفرز في المستودع" : "Hub Processing & Sorting"}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Cedex Central Logistics Hub • Beirut
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Out for Delivery */}
                    <div className="relative ps-6">
                      <div
                        className={`absolute -start-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ring-2 ${
                          milestone >= 3
                            ? "bg-amber-500 ring-amber-400"
                            : "bg-slate-300 ring-slate-200"
                        }`}
                      ></div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {lang === "ar" ? "مع السائق على خط التوصيل" : "Out for Final Delivery"}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {parcel.driver
                            ? `${parcel.driver.user.name} (${parcel.governorate})`
                            : "En route to delivery address"}
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="relative ps-6">
                      <div
                        className={`absolute -start-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ring-2 ${
                          milestone >= 4
                            ? "bg-emerald-600 ring-emerald-500"
                            : isFailed
                            ? "bg-rose-600 ring-rose-500"
                            : "bg-slate-200 ring-slate-100"
                        }`}
                      ></div>
                      <div>
                        <h4
                          className={`text-sm font-bold ${
                            milestone >= 4
                              ? "text-emerald-700"
                              : isFailed
                              ? "text-rose-700"
                              : "text-slate-400"
                          }`}
                        >
                          {isFailed
                            ? formatStatusLabel(parcel.status)
                            : lang === "ar"
                            ? "تم التسليم بنجاح"
                            : "Delivered to Destination"}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {parcel.city}, {parcel.governorate} • {parcel.detailedAddress}
                          </span>
                        </p>
                        {parcel.deliveredAt && (
                          <span className="text-[11px] font-mono text-emerald-700 font-bold mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(parcel.deliveredAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Destination Footnote */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cedex Real-Time Courier Tracking Protection</span>
                  </div>
                  <p>Support: support@cedex.express</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}