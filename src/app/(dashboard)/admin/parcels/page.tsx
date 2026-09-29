import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminParcelsPage() {
  const parcels = await prisma.parcel.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      merchant: true,
      driver: {
        include: {
          user: true,
        },
      },
    },
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Parcels</h1>
          <p className="text-sm text-gray-500">
            Overview of all shipments across merchants and drivers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/parcels/print-batch"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            Batch Print Labels
          </Link>
          <Link
            href="/admin/dispatch"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            Go to Dispatch
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Tracking #</th>
                <th className="px-6 py-3">Recipient</th>
                <th className="px-6 py-3">City / Address</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">COD Amount</th>
                <th className="px-6 py-3">Merchant</th>
                <th className="px-6 py-3">Assigned Driver</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {parcels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    No parcels found.
                  </td>
                </tr>
              ) : (
                parcels.map((parcel) => (
                  <tr key={parcel.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-6 py-4 font-mono font-medium text-blue-600 whitespace-nowrap">
                      <Link
                        href={`/track/${parcel.trackingNumber}`}
                        target="_blank"
                        className="hover:underline"
                      >
                        {parcel.trackingNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{parcel.recipientName}</div>
                      <div className="text-xs text-gray-400">{parcel.recipientPhone}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      <div className="text-gray-900">{parcel.city}</div>
                      <div className="text-xs text-gray-400 truncate">{parcel.detailedAddress}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {parcel.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {parcel.codAmount != null ? parcel.codAmount.toString() : '0.00'} {parcel.codCurrency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {parcel.merchant?.companyName || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {parcel.driver?.user?.name || (
                        <span className="text-amber-600 text-xs italic font-normal">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <Link
                        href={`/parcels/${parcel.id}/label`}
                        target="_blank"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline"
                      >
                        Label
                      </Link>
                      <span className="text-gray-300">|</span>
                      <Link
                        href={`/parcels/${parcel.id}/waybill`}
                        target="_blank"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline"
                      >
                        Waybill
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}