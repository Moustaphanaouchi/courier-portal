import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminPayoutsPage() {
  const [merchants, recentPayouts] = await Promise.all([
    prisma.merchant.findMany({
      include: {
        user: true,
        parcels: {
          where: {
            status: 'DELIVERED',
            isCodCollected: true,
            isMerchantPaid: false,
          },
        },
      },
    }),
    prisma.merchantPayout.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        merchant: true,
        parcels: {
          select: { id: true, trackingNumber: true },
        },
      },
    }),
  ]);

  const merchantCalculations = merchants.map((m) => {
    const grossUsd = m.parcels
      .filter((p) => p.codCurrency === 'USD')
      .reduce((sum, p) => sum + Number(p.codAmount), 0);
    const grossLbp = m.parcels
      .filter((p) => p.codCurrency === 'LBP')
      .reduce((sum, p) => sum + Number(p.codAmount), 0);
    const feesUsd = m.parcels.reduce((sum, p) => sum + Number(p.deliveryFee || 0), 0);
    const netUsd = grossUsd - feesUsd;

    return {
      id: m.id,
      name: m.companyName,
      contact: m.user?.name || '—',
      pendingCount: m.parcels.length,
      grossUsd,
      grossLbp,
      feesUsd,
      netUsd,
    };
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Merchant Payouts</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review collected COD balances, reconcile delivery fees, and view remittance statements.
        </p>
      </div>

      {/* Pending Balances Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Pending Remittances (Delivered &amp; Collected)</h2>
          <span className="text-xs text-gray-500">Awaiting payout generation</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Merchant</th>
                <th className="px-6 py-3">Delivered Parcels</th>
                <th className="px-6 py-3">Gross COD</th>
                <th className="px-6 py-3">Courier Fees</th>
                <th className="px-6 py-3 font-bold text-gray-900">Net Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {merchantCalculations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No merchants found.
                  </td>
                </tr>
              ) : (
                merchantCalculations.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{m.name}</div>
                      <div className="text-xs text-gray-400">{m.contact}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {m.pendingCount} parcel{m.pendingCount === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {m.grossUsd > 0 && <div className="text-gray-900 font-medium">${m.grossUsd.toFixed(2)} USD</div>}
                      {m.grossLbp > 0 && <div className="text-gray-500 text-xs">{m.grossLbp.toLocaleString()} LBP</div>}
                      {m.grossUsd === 0 && m.grossLbp === 0 && <span className="text-gray-400">$0.00</span>}
                    </td>
                    <td className="px-6 py-4 text-red-600 font-medium">
                      -${m.feesUsd.toFixed(2)} USD
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold text-base ${m.netUsd > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                        ${m.netUsd.toFixed(2)} USD
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Payouts Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Payout History &amp; Statements</h2>
          <span className="text-xs text-gray-500">Processed remittances</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Merchant</th>
                <th className="px-6 py-3">Parcels</th>
                <th className="px-6 py-3">Gross COD</th>
                <th className="px-6 py-3">Fee Deducted</th>
                <th className="px-6 py-3">Net Paid</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentPayouts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-400">
                    No completed payouts recorded yet.
                  </td>
                </tr>
              ) : (
                recentPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">
                      {p.referenceNumber || p.id.slice(0, 10)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {p.merchant.companyName}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {p.parcels.length} parcel{p.parcels.length === 1 ? '' : 's'}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      ${Number(p.grossCodUsd).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-red-600">
                      -${Number(p.totalFeesUsd).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      ${Number(p.netPayoutUsd).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        p.isSettled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {p.isSettled ? 'Settled' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/merchant/payouts/${p.id}/statement`}
                        target="_blank"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                      >
                        View Statement →
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