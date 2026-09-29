import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Barcode } from "@/components/Barcode";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PrintTrigger } from "./PrintTrigger";

interface Props {
  params: Promise<{ id: string }>;
}

async function getUserFromSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("courier_session")?.value;
  if (!sessionCookie) return null;

  try {
    const parsed = JSON.parse(sessionCookie);
    const userId = parsed.userId || parsed.id;
    if (!userId) return null;

    return await prisma.user.findUnique({
      where: { id: userId },
      include: { merchantProfile: true, driverProfile: true },
    });
  } catch (e) {
    return null;
  }
}

export default async function ParcelLabelPage({ params }: Props) {
  const { id } = await params;
  const user = await getUserFromSession();

  if (!user) {
    redirect("/login?redirect=/parcels/" + id + "/label");
  }

  // Support lookup by either trackingNumber or internal ID
  const parcel = await prisma.parcel.findFirst({
    where: {
      OR: [
        { trackingNumber: id },
        { id: id }
      ]
    },
    include: {
      merchant: {
        include: {
          user: {
            select: { name: true, phone: true },
          },
        },
      },
    },
  });

  if (!parcel) {
    notFound();
  }

  // Strict Tenant Isolation: Merchants can ONLY print their own waybill labels
  if (user.role === "MERCHANT") {
    if (!user.merchantProfile || parcel.merchantId !== user.merchantProfile.id) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-200 max-w-md text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">✕</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-sm text-slate-600 mb-6">You do not have permission to view or print waybills belonging to other merchants.</p>
            <Link href="/merchant/parcels" className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition">
              Back to My Parcels
            </Link>
          </div>
        </div>
      );
    }
  }

  const codFormatted =
    parcel.codCurrency === "USD"
      ? `$${Number(parcel.codAmount).toFixed(2)} USD`
      : `${Number(parcel.codAmount).toLocaleString()} LBP`;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex flex-col items-center justify-start print:bg-white print:p-0">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between print:hidden">
        <Link
          href={user.role === "MERCHANT" ? "/merchant/parcels" : "/admin/dispatch"}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <PrintTrigger />
        </div>
      </div>

      {/* Waybill / Shipping Label Canvas */}
      <div className="w-full max-w-2xl bg-white border border-slate-300 rounded-xl shadow-lg p-8 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">CEDEX LOGISTICS</h1>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mt-0.5">Express Dispatch & COD Services</p>
            <p className="text-xs text-slate-600 mt-1">Lebanon: +961 3 448 482 | Direct: +90 545 682 8864</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white font-mono text-xs font-bold rounded">
              STANDARD WAYBILL
            </span>
            <p className="text-xs font-mono text-slate-500 mt-1.5">{new Date(parcel.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Barcode Strip */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6 print:bg-transparent print:border-slate-300">
          <Barcode value={parcel.trackingNumber} />
          <p className="font-mono text-base font-bold tracking-widest text-slate-900 mt-1">{parcel.trackingNumber}</p>
        </div>

        {/* Sender & Recipient Grids */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border border-slate-200 p-4 rounded-lg">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">MERCHANT / SENDER</p>
            <p className="text-sm font-bold text-slate-900">{parcel.merchant.companyName}</p>
            <p className="text-xs text-slate-600">{parcel.merchant.user.name}</p>
            <p className="text-xs font-mono text-slate-600 mt-1">{parcel.merchant.user.phone || "No Phone"}</p>
          </div>

          <div className="border-2 border-slate-900 p-4 rounded-lg bg-slate-50/50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">DELIVERY DESTINATION</p>
            <p className="text-base font-black text-slate-900">{parcel.recipientName}</p>
            <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">{parcel.recipientPhone}</p>
            <p className="text-xs text-slate-700 mt-2 font-medium">{parcel.detailedAddress || "Standard Address"}</p>
            <p className="text-xs font-bold text-slate-900 uppercase mt-0.5">{parcel.city}, {parcel.governorate}</p>
          </div>
        </div>

        {/* COD Strip */}
        <div className="border-2 border-slate-900 rounded-xl p-4 bg-amber-50/40 flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">CASH ON DELIVERY (COD)</p>
            <p className="text-xs text-slate-600 font-medium">To be collected by driver upon physical delivery</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-slate-900">{codFormatted}</p>
          </div>
        </div>

        {parcel.notes && (
          <div className="border border-amber-200 bg-amber-50 p-3 rounded-lg mb-6">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Handling Notes</p>
            <p className="text-xs text-amber-900 mt-0.5">{parcel.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t border-slate-200">
          <p className="text-[11px] text-slate-500">Live parcel tracking accessible via http://localhost:3000/track/{parcel.trackingNumber}</p>
        </div>
      </div>
    </div>
  );
}
