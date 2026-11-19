export const dynamic = "force-dynamic";

import { db } from "@/lib/db";

function calcProfit(s: any) {
  const landed = s.productCostRmb * s.exchangeRate + s.freightGhs + s.dutyGhs;
  return s.clientQuoteGhs - landed;
}

export default async function AnalyticsPage() {
  const shipments = await db.orm.public.Shipment.all();
  const expenses = await db.orm.public.Expense.all();

  const totalRevenue = shipments.reduce((sum: number, s: any) => sum + s.clientQuoteGhs, 0);
  const totalProfit = shipments.reduce((sum: number, s: any) => sum + calcProfit(s), 0);
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amountGhs, 0);
  const avgMargin = shipments.length ? (totalProfit / totalRevenue) * 100 : 0;

  // By status
  const byStatus: Record<string, number> = {};
  shipments.forEach((s: any) => { byStatus[s.status] = (byStatus[s.status] || 0) + 1; });

  // By client
  const byClient: Record<string, { count: number; profit: number; revenue: number }> = {};
  shipments.forEach((s: any) => {
    if (!byClient[s.clientName]) byClient[s.clientName] = { count: 0, profit: 0, revenue: 0 };
    byClient[s.clientName].count += 1;
    byClient[s.clientName].profit += calcProfit(s);
    byClient[s.clientName].revenue += s.clientQuoteGhs;
  });
  const topClients = Object.entries(byClient).sort((a, b) => b[1].profit - a[1].profit);

  // Profit by month
  const byMonth: Record<string, number> = {};
  shipments.forEach((s: any) => {
    const d = new Date(s.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = (byMonth[key] || 0) + calcProfit(s);
  });
  const months = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]));
  const maxMonthProfit = Math.max(...months.map((m) => m[1]), 1);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase">Revenue</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">GH₵ {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Profit</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">GH₵ {totalProfit.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase">Expenses</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">GH₵ {totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase">Avg Margin</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{avgMargin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Profit by Month */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Profit by Month</h2>
        {months.length === 0 ? (
          <p className="text-slate-500 text-sm">No data yet.</p>
        ) : (
          <div className="flex items-end gap-3 h-48">
            {months.map(([month, profit]) => (
              <div key={month} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-xs font-medium text-slate-600 mb-1">GH₵ {profit.toFixed(0)}</span>
                <div
                  className={`w-full rounded-t ${profit >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                  style={{ height: `${Math.max((Math.abs(profit) / maxMonthProfit) * 100, 4)}%` }}
                />
                <span className="text-xs text-slate-500 mt-2">{month}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Shipments by Status</h2>
          <ul className="space-y-2">
            {Object.entries(byStatus).map(([status, count]) => (
              <li key={status} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{status}</span>
                <span className="font-semibold text-slate-800">{count}</span>
              </li>
            ))}
            {Object.keys(byStatus).length === 0 && <p className="text-slate-500 text-sm">No data yet.</p>}
          </ul>
        </div>

        {/* Top Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Top Clients by Profit</h2>
          <ul className="space-y-3">
            {topClients.slice(0, 5).map(([name, data]) => (
              <li key={name} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-slate-800">{name}</p>
                  <p className="text-xs text-slate-500">{data.count} shipment(s) · GH₵ {data.revenue.toFixed(0)} revenue</p>
                </div>
                <span className={`font-semibold ${data.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  GH₵ {data.profit.toFixed(2)}
                </span>
              </li>
            ))}
            {topClients.length === 0 && <p className="text-slate-500 text-sm">No data yet.</p>}
          </ul>
        </div>
      </div>
    </main>
  );
}