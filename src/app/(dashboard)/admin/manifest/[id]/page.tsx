import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, Calendar, MapPin, Phone } from "lucide-react";
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
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const csvHeaders = [
    "Stop #",
    "Tracking Number",
    "Recipient Name",
    "Recipient Phone",
    "City",
    "Address",
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
  const manifestFilename = `Manifest_${driverNameClean}_${new Date().toISOString().split("T")[0]}.csv`;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/admin/dispatch"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dispatch Board
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

      <div className="max-w-5xl mx-auto bg-white border border-slate-300 p-8 rounded-2xl shadow-xs print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-7 h-7 text-blue-600 print:text-black" />
              <h1 className="text-2xl font-black uppercase tracking-tight">DRIVER RUN-SHEET MANIFEST</h1>
            </div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
              Daily Route Stops & Cash on Delivery Collection Sheet
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-3 py-1 rounded">
              MANIFEST #{driver.id.slice(-6).toUpperCase()}
            </span>
            <p className="text-xs font-medium text-slate-500 mt-1 flex items-center justify-end gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date: {dateStr}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 print:bg-transparent print:border print:border-slate-300 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block font-semibold uppercase text-[10px]">Driver Name</span>
            <span className="text-slate-900 font-bold text-sm">{driver.user?.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold uppercase text-[10px]">Driver Phone</span>
            <span className="font-mono text-slate-800 font-medium">{driver.user?.phone}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold uppercase text-[10px]">Vehicle / Plate</span>
            <span className="font-bold text-slate-800">{driver.vehicleType || "Van"} ({driver.plateNumber || "N/A"})</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold uppercase text-[10px]">Total Stops</span>
            <span className="font-bold text-blue-600 print:text-black text-sm">{parcels.length} Deliveries</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border border-emerald-200 bg-emerald-50/50 print:bg-transparent p-4 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Total USD Cash Expected
            </span>
            <p className="text-xl font-black font-mono text-emerald-950 print:text-black mt-1">
              ${totalUsd.toFixed(2)} USD
            </p>
          </div>
          <div className="border border-blue-200 bg-blue-50/50 print:bg-transparent p-4 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
              Total LBP Cash Expected
            </span>
            <p className="text-xl font-black font-mono text-blue-950 print:text-black mt-1">
              {totalLbp.toLocaleString()} LBP
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-100 print:bg-transparent font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-2.5 px-2 text-center w-8">#</th>
                <th className="py-2.5 px-2">Tracking</th>
                <th className="py-2.5 px-2">Recipient / Destination</th>
                <th className="py-2.5 px-2">Merchant</th>
                <th className="py-2.5 px-2 text-right">COD Amount</th>
                <th className="py-2.5 px-3 text-center w-28">Driver Sign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {parcels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No parcels currently assigned to this driver. Assign parcels on the Dispatch Board first.
                  </td>
                </tr>
              ) : (
                parcels.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                    <td className="py-2.5 px-2 text-center font-bold text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-2 font-mono font-bold text-blue-600 print:text-black">
                      {p.trackingNumber}
                    </td>
                    <td className="py-2.5 px-2 text-slate-800">
                      <span className="font-bold block">{p.recipientName}</span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {p.city} - {p.detailedAddress || "Standard Area"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 shrink-0" />
                        {p.recipientPhone}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-slate-600 font-medium">
                      {p.merchant?.companyName || "Hub Direct"}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
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

        <div className="mt-12 pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs text-slate-600">
          <div>
            <p className="font-bold text-slate-900">Dispatcher Handover Signature:</p>
            <div className="h-10 border-b border-slate-300 mt-2"></div>
            <p className="text-[10px] text-slate-400 mt-1">Confirmed Parcels & Manifest Generated</p>
          </div>
          <div>
            <p className="font-bold text-slate-900">Courier Acceptance Signature:</p>
            <div className="h-10 border-b border-slate-300 mt-2"></div>
            <p className="text-[10px] text-slate-400 mt-1">Physical Cash & Custody Responsibility Accepted</p>
          </div>
        </div>
      </div>
    </div>
  );
}
