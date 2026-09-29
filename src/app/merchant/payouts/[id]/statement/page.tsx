import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Calendar } from "lucide-react";
import { PrintTrigger } from "@/app/parcels/[id]/label/PrintTrigger";
import { CsvExportButton } from "@/components/CsvExportButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MerchantPayoutStatementPage({ params }: Props) {
  const { id: payoutId } = await params;

  const payout = await prisma.merchantPayout.findUnique({
    where: { id: payoutId },
    include: {
      merchant: {
        include: {
          user: { select: { name: true, phone: true } },
        },
      },
      parcels: {
        orderBy: { deliveredAt: "asc" },
      },
    },
  });

  if (!payout) {
    notFound();
  }

  // Strict Tenant Isolation: Merchants can ONLY see their own statements
  const session = await getSession();
  if (!session) {
    notFound();
  }

  if (session.role === "MERCHANT" && payout.merchantId !== session.merchantId) {
    notFound();
  }

  const dateStr = new Date(payout.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Prepare CSV Data
  const csvHeaders = [
    "Item #",
    "Tracking Number",
    "Recipient Name",
    "City",
    "Delivery Date",
    "Gross COD (USD)",
    "Courier Fee (USD)",
    "Net Payable (USD)",
    "Statement ID",
    "Payment Method",
    "Reference / MTCN",
  ];

  const csvRows = payout.parcels.map((parcel, idx) => {
    const cod = Number(parcel.codAmount);
    const fee = Number(parcel.deliveryFee || 0);
    const net = cod - fee;
    const deliveredDate = parcel.deliveredAt
      ? new Date(parcel.deliveredAt).toLocaleDateString("en-GB")
      : "";

    return [
      idx + 1,
      parcel.trackingNumber,
      parcel.recipientName,
      parcel.city,
      deliveredDate,
      cod.toFixed(2),
      fee.toFixed(2),
      net.toFixed(2),
      payout.id,
      payout.paymentMethod,
      payout.referenceNumber || "Cash Handover",
    ];
  });

  const sanitizedCompany = payout.merchant.companyName.replace(/\s+/g, "_");
  const statementCsvFilename = `Statement_${sanitizedCompany}_${payout.id.slice(-6)}.csv`;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-900 font-sans">
      {/* Top action toolbar (Hidden in print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/merchant/payouts"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Payouts
        </Link>
        <div className="flex items-center gap-2">
          <CsvExportButton
            filename={statementCsvFilename}
            headers={csvHeaders}
            rows={csvRows}
            buttonLabel="Export to Excel (CSV)"
            variant="outline"
          />
          <PrintTrigger />
        </div>
      </div>

      {/* Official Statement Sheet */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-300 p-8 sm:p-12 rounded-2xl shadow-xs print:shadow-none print:border-none print:p-0">
        {/* Header Block */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-7 h-7 text-emerald-600 print:text-black" />
              <h1 className="text-2xl font-black uppercase tracking-tight">MERCHANT SETTLEMENT STATEMENT</h1>
            </div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
              Official COD Remittance & Fee Breakdown Voucher
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-3 py-1 rounded">
              STATEMENT #{payout.id.slice(-8).toUpperCase()}
            </span>
            <p className="text-xs font-medium text-slate-500 mt-1 flex items-center justify-end gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date: {dateStr}
            </p>
          </div>
        </div>

        {/* Merchant & Transfer Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 print:bg-transparent print:border print:border-slate-300 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block font-semibold uppercase text-[10px]">Merchant</span>
            <span className="text-slate-900 font-bold text-sm">{payout.merchant.companyName}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold uppercase text-[10px]">City / Origin</span>
            <span className="text-slate-800 font-medium">{payout.merchant.pickupCity}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold uppercase text-[10px]">Payment Method</span>
            <span className="font-bold text-emerald-800 print:text-black">{payout.paymentMethod}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold uppercase text-[10px]">Ref / MTCN</span>
            <span className="font-mono text-slate-900 font-bold">{payout.referenceNumber || "Cash Handover"}</span>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border border-slate-200 p-4 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gross COD Collected</span>
            <p className="text-xl font-black font-mono text-slate-900 mt-1">
              ${Number(payout.grossCodUsd).toFixed(2)} USD
            </p>
          </div>
          <div className="border border-rose-200 bg-rose-50/40 print:bg-transparent p-4 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Courier Fees Deducted</span>
            <p className="text-xl font-black font-mono text-rose-900 print:text-black mt-1">
              -${Number(payout.totalFeesUsd).toFixed(2)} USD
            </p>
          </div>
          <div className="border border-emerald-300 bg-emerald-50/50 print:bg-transparent p-4 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Net Amount Paid</span>
            <p className="text-2xl font-black font-mono text-emerald-950 print:text-black mt-1">
              ${Number(payout.netPayoutUsd).toFixed(2)} USD
            </p>
          </div>
        </div>

        {/* Parcels Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-100 print:bg-transparent font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-2.5 px-2 text-center w-10">#</th>
                <th className="py-2.5 px-3">Tracking Number</th>
                <th className="py-2.5 px-3">Recipient & City</th>
                <th className="py-2.5 px-3 text-right">Gross COD</th>
                <th className="py-2.5 px-3 text-right">Delivery Fee</th>
                <th className="py-2.5 px-3 text-right">Net Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payout.parcels.map((parcel, idx) => {
                const cod = Number(parcel.codAmount);
                const fee = Number(parcel.deliveryFee || 0);
                const net = cod - fee;

                return (
                  <tr key={parcel.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                    <td className="py-2.5 px-2 text-center font-bold text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600 print:text-black">
                      {parcel.trackingNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800">
                      <span className="font-semibold block">{parcel.recipientName}</span>
                      <span className="text-[11px] text-slate-500">{parcel.city}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ${cod.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-700 print:text-black">
                      -${fee.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700 print:text-black">
                      ${net.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Audit Signatures */}
        <div className="mt-12 pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs text-slate-600">
          <div>
            <p className="font-bold text-slate-900">Issued By (Hub Accounts Supervisor):</p>
            <div className="h-10 border-b border-slate-300 mt-2"></div>
            <p className="text-[10px] text-slate-400 mt-1">Authorized Courier Financial Officer</p>
          </div>
          <div>
            <p className="font-bold text-slate-900">Received & Acknowledged By:</p>
            <div className="h-10 border-b border-slate-300 mt-2"></div>
            <p className="text-[10px] text-slate-400 mt-1">{payout.merchant.companyName} Representative</p>
          </div>
        </div>
      </div>
    </div>
  );
}