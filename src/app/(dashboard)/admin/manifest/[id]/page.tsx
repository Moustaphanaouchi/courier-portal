import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, Calendar, MapPin, Phone, ShieldCheck, Printer, Download } from "lucide-react";
import { PrintTrigger } from "@/app/parcels/[id]/label/PrintTrigger";
import { CsvExportButton } from "@/components/CsvExportButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DriverManifestPage({ params }: Props) {
  const { id: driverId } = await params;

  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: {
      user: { select: { name: true, phone: true } },
      assignedParcels: {
        orderBy: [{ city: "asc" }, { recipientName: "asc" }],
        include: {
          merchant: { select: { companyName: true, pickupCity: true } },
        },
      },
    },
  });

  if (!driver) notFound();

  const parcels = driver.assignedParcels;
  const totalUsd = parcels
    .filter((p) => p.codCurrency === "USD")
    .reduce((s, p) => s + Number(p.codAmount), 0);
  const totalLbp = parcels
    .filter((p) => p.codCurrency === "LBP")
    .reduce((s, p) => s + Number(p.codAmount), 0);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const manifestCode = `MNF-${driver.id.slice(-6).toUpperCase()}-${now.getFullYear()}`;

  const csvHeaders = [
    "Stop #",
    "Tracking Number",
    "Recipient Name",
    "Recipient Phone",
    "City",
    "Detailed Address",
    "Merchant",
    "COD Amount",
    "Currency",
    "Status",
    "Notes",
  ];

  const csvRows = parcels.map((p, idx) => [
    idx + 1,
    p.trackingNumber,
    p.recipientName,
    p.recipientPhone,
    p.city,
    p.detailedAddress || "",
    p.merchant?.companyName || "",
    Number(p.codAmount).toFixed(2),
    p.codCurrency,
    p.status,
    p.notes || "",
  ]);

  const driverNameClean = (driver.user?.name || "driver").replace(/\s+/g, "_");
  const manifestFilename = `Manifest_${driverNameClean}_${now.toISOString().split("T")[0]}.csv`;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-900 font-sans">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page-break-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Screen-Only Action Header */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/admin/dispatch"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dispatch Board</span>
        </Link>
        <div className="flex items-center gap-2">
          <CsvExportButton
            filename={manifestFilename}
            headers={csvHeaders}
            rows={csvRows}
            buttonLabel="Export to Excel (CSV)"
            variant="outline"
          />
          <PrintTrigger />
        </div>
      </div>

      {/* A4 Printable Sheet Container */}
      <div className="max-w-5xl mx-auto bg-white border border-slate-300 p-8 sm:p-10 rounded-3xl shadow-sm print:shadow-none print:border-none print:p-0 print:rounded-none">
        {/* Top Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl print:border print:border-black">
              CX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                  DRIVER RUN-SHEET MANIFEST
                </h1>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">
                  / بيان تسليم الشحنات
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                Cedex Express Logistics SAL • Beirut Central Hub Operations
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-3 py-1 rounded-md print:border print:border-black">
              {manifestCode}
            </span>
            <p className="text-[11px] font-semibold text-slate-600 mt-1">
              {dateStr} • {timeStr}
            </p>
          </div>
        </div>

        {/* Driver Details & Load Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 p-4 bg-slate-50 border border-slate-200 print:bg-slate-50/60 print:border-slate-300 rounded-2xl text-xs page-break-avoid">
          <div>
            <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">
              Assigned Driver / السائق
            </span>
            <span className="text-slate-900 font-black text-sm block mt-0.5">{driver.user?.name}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">
              Contact Phone / الهاتف
            </span>
            <span className="font-mono text-slate-900 font-bold text-xs block mt-0.5" dir="ltr">
              {driver.user?.phone}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">
              Vehicle & Plate / الآلية
            </span>
            <span className="font-bold text-slate-900 text-xs block mt-0.5">
              {driver.vehicleType || "Van"} • <span className="font-mono">{driver.plateNumber || "N/A"}</span>
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">
              Total Stops / الطرود
            </span>
            <span className="font-black text-blue-700 print:text-black text-sm block mt-0.5">
              {parcels.length} Active Waybills
            </span>
          </div>
        </div>

        {/* Expected Cash Responsibility Banner */}
        <div className="grid grid-cols-2 gap-3 mb-5 page-break-avoid">
          <div className="border border-emerald-300 bg-emerald-50/40 p-3.5 rounded-2xl print:bg-transparent">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                Total USD Cash Expected / نقد دولار ($)
              </span>
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                USD
              </span>
            </div>
            <p className="text-xl font-black font-mono text-emerald-950 print:text-black mt-1">
              ${totalUsd.toFixed(2)}
            </p>
          </div>

          <div className="border border-blue-300 bg-blue-50/40 p-3.5 rounded-2xl print:bg-transparent">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                Total LBP Cash Expected / ليرة لبنانية (ل.ل)
              </span>
              <span className="text-[10px] font-black text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded">
                LBP
              </span>
            </div>
            <p className="text-xl font-black font-mono text-blue-950 print:text-black mt-1">
              {totalLbp.toLocaleString()} LBP
            </p>
          </div>
        </div>

        {/* Parcels Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-100 print:bg-slate-100 font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                <th className="py-2 px-2 text-center w-7">#</th>
                <th className="py-2 px-2">Tracking / البوليصة</th>
                <th className="py-2 px-2">Recipient & Address / المستلم والعنوان</th>
                <th className="py-2 px-2">Merchant / المتجر</th>
                <th className="py-2 px-2 text-right">COD / المبلغ</th>
                <th className="py-2 px-3 text-center w-28">Customer Sign / التوقيع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {parcels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No parcels assigned to this driver. Assign parcels on the Dispatch Board first.
                  </td>
                </tr>
              ) : (
                parcels.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 print:hover:bg-transparent page-break-avoid">
                    <td className="py-2.5 px-2 text-center font-bold text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-2 font-mono font-bold text-blue-700 print:text-black text-[11px]">
                      {p.trackingNumber}
                      {p.notes && (
                        <span className="block text-[9px] font-sans font-normal text-amber-700 italic">
                          Note: {p.notes}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-2 text-slate-800">
                      <span className="font-bold block text-[11px]">{p.recipientName}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        {p.city} • {p.detailedAddress || "Standard Delivery"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5" dir="ltr">
                        {p.recipientPhone}
                      </span>
                    </td>

                    <td className="py-2.5 px-2 text-slate-600 font-medium text-[11px]">
                      {p.merchant?.companyName || "Direct Hub"}
                    </td>

                    <td className="py-2.5 px-2 text-right font-mono font-black text-slate-900 text-[11px]">
                      {p.codCurrency === "USD"
                        ? `$${Number(p.codAmount).toFixed(2)}`
                        : `${Number(p.codAmount).toLocaleString()} LBP`}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="h-6 border-b border-dashed border-slate-300"></div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dual Handover Legal Signatures */}
        <div className="mt-8 pt-5 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs text-slate-700 page-break-avoid">
          <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50/50 print:bg-transparent">
            <p className="font-black text-slate-900 uppercase text-[11px]">
              1. Hub Dispatcher Handover / تسليم مركز التوزيع
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              I verify that the above parcels and waybills were physically inspected and handed over to the courier.
            </p>
            <div className="h-12 border-b border-dashed border-slate-400 mt-4"></div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
              <span>Dispatcher Name & Sign</span>
              <span>Time: ______</span>
            </div>
          </div>

          <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50/50 print:bg-transparent">
            <p className="font-black text-slate-900 uppercase text-[11px]">
              2. Courier Custody & Cash Acceptance / استلام المندوب
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              I acknowledge physical receipt of all listed shipments and accept full financial custody of all COD amounts.
            </p>
            <div className="h-12 border-b border-dashed border-slate-400 mt-4"></div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
              <span>Driver Signature: {driver.user?.name}</span>
              <span>Date: {dateStr}</span>
            </div>
          </div>
        </div>

        {/* Footer Audit Notice */}
        <div className="mt-4 text-center text-[9px] text-slate-400 uppercase tracking-widest font-mono print:text-slate-500 page-break-avoid">
          Cedex Express Portal • Official Internal Operational Document • Retain Signed Sheet for Counter Audit
        </div>
      </div>
    </div>
  );
}
