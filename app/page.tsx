export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { addShipment, addExpense, addPayment } from "./actions";

function calcProfit(s: any) {
  const landed = s.productCostRmb * s.exchangeRate + s.freightGhs + s.dutyGhs;
  return s.clientQuoteGhs - landed;
}

export default async function Home() {
  const shipments = await db.orm.public.Shipment.orderBy((s) => s.createdAt.desc()).all();
  const expenses = await db.orm.public.Expense.orderBy((e) => e.createdAt.desc()).all();
  const payments = await db.orm.public.Payment.orderBy((p) => p.createdAt.desc()).all();
  const clients = await db.orm.public.Client.all();

  const totalProfit = shipments.reduce((sum, s) => sum + calcProfit(s), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amountGhs, 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amountGhs, 0);
  const netPosition = totalProfit - totalExpenses;

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-black">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">trckr — Dashboard</h1>
            <p className="text-sm text-neutral-500 mt-1">China → Ghana · Shipments, expenses & profit</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-neutral-500">Net Position</p>
            <p className="text-2xl font-semibold tabular-nums">GH₵ {netPosition.toFixed(2)}</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* Summary */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-200 border border-black">
            <div className="p-6">
              <p className="text-xs uppercase tracking-widest text-neutral-500">Total Profit</p>
              <p className="text-3xl font-semibold tabular-nums mt-2">GH₵ {totalProfit.toFixed(2)}</p>
              <p className="text-xs text-neutral-500 mt-1">{shipments.length} shipments</p>
            </div>
            <div className="p-6">
              <p className="text-xs uppercase tracking-widest text-neutral-500">Total Expenses</p>
              <p className="text-3xl font-semibold tabular-nums mt-2">GH₵ {totalExpenses.toFixed(2)}</p>
              <p className="text-xs text-neutral-500 mt-1">{expenses.length} records</p>
            </div>
            <div className="p-6">
              <p className="text-xs uppercase tracking-widest text-neutral-500">Payments Received</p>
              <p className="text-3xl font-semibold tabular-nums mt-2">GH₵ {totalPayments.toFixed(2)}</p>
              <p className="text-xs text-neutral-500 mt-1">{payments.length} payments</p>
            </div>
          </div>
        </section>

        {/* Forms */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Shipment */}
          <div className="border border-black">
            <div className="border-b border-black px-5 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest">Add Shipment</h2>
            </div>
            <form action={addShipment} className="p-5 space-y-3">
              <select name="clientId" required className="w-full border border-neutral-400 px-3 py-2 text-sm bg-white focus:outline-none focus:border-black">
                <option value="">Select Client…</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input name="goods" placeholder="Goods Description" required className="w-full border border-neutral-400 px-3 py-2 text-sm focus:outline-none focus:border-black" />
              <input name="shippingMark" placeholder="Shipping Mark (optional)" className="w-full border border-neutral-400 px-3 py-2 text-sm focus:outline-none focus:border-black" />
              <div className="grid grid-cols-2 gap-3">
                <input name="productCostRmb" type="number" step="0.01" placeholder="Cost (RMB)" required className="w-full border border-neutral-400 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                <input name="exchangeRate" type="number" step="0.01" placeholder="Rate" required className="w-full border border-neutral-400 px-3 py-2 text-sm focus:outline-none focus:border-black" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="freightGhs" type="number" step="0.01" placeholder="Freight (GHS)" required className="w-full border border-neutral-400 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                <input name="dutyGhs" type="number" step="0.01" placeholder="Duty (GHS)" required className="w-full border border-neutral-400 px-3 py-2 text-sm focus:outline-none focus:border-black" />
              </div>
              <input name="clientQuoteGhs" type="number" step="0.01" placeholder="Client Quote (GHS)" required className="w-full border border-neutral-400 px-3 py-2 text-sm focus:outline-none focus:border-black" />
              <button type="submit" className="w-full bg-black text-white text-sm font-medium px-4 py-2.5 hover:bg-neutral-800 transition-colors">
                Add Shipment
              </button>
            </form>
          </div>

          {/* Add Expense */}
          <div className="border border-black">
            <div className="border-b border-black px-5 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest">Add Expense</h2>
            </div>
            <form action={addExpense} className="p-5 space-y-3">
              <input name="category" placeholder="Category (e.g. Freight)" required className="w-full border border-neutral-400 px-3 py-2 text-sm focus:outline-none focus:border-black" />
              <input name="amountGhs" type="number" step="0.01" placeholder="Amount (GHS)" required className="w-full border border-neutral-400 px-3 py-2 text-sm focus:outline-none focus:border-black" />
              <input name="note" placeholder="Note (optional)" className="w-full border border-neutral-400 px-3 py-2 text-sm focus:outline-none focus:border-black" />
              <button type="submit" className="w-full bg-black text-white text-sm font-medium px-4 py-2.5 hover:bg-neutral-800 transition-colors">
                Add Expense
              </button>
            </form>
          </div>

          {/* Add Payment */}
          <div className="border border-black">
            <div className="border-b border-black px-5 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest">Add Payment</h2>
            </div>
            <form action={addPayment} className="p-5 space-y-3">
              <select name="clientId" required className="w-full border border-neutral-400 px-3 py-2 text-sm bg-white focus:outline-none focus:border-black">
                <option value="">Select Client…</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input name="amountGhs" type="number" step="0.01" placeholder="Amount (GHS)" required className="w-full border border-neutral-400 px-3 py-2 text-sm focus:outline-none focus:border-black" />
              <button type="submit" className="w-full bg-black text-white text-sm font-medium px-4 py-2.5 hover:bg-neutral-800 transition-colors">
                Add Payment
              </button>
            </form>
          </div>
        </section>

        {/* Shipments table */}
        <section className="border border-black">
          <div className="border-b border-black px-5 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest">Shipments</h2>
            <span className="text-xs text-neutral-500">{shipments.length} total</span>
          </div>
          {shipments.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500">No shipments yet. Add one above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-widest text-neutral-500">
                    <th className="px-5 py-3 font-medium">Client</th>
                    <th className="px-5 py-3 font-medium">Goods</th>
                    <th className="px-5 py-3 font-medium text-right">Landed Cost</th>
                    <th className="px-5 py-3 font-medium text-right">Quote</th>
                    <th className="px-5 py-3 font-medium text-right">Profit</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s: any) => {
                    const landed = s.productCostRmb * s.exchangeRate + s.freightGhs + s.dutyGhs;
                    const profit = calcProfit(s);
                    return (
                      <tr key={s.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-5 py-3 font-medium">{s.client?.name ?? "—"}</td>
                        <td className="px-5 py-3 text-neutral-600">{s.goods}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-neutral-600">GH₵ {landed.toFixed(2)}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-neutral-600">GH₵ {s.clientQuoteGhs.toFixed(2)}</td>
                        <td className="px-5 py-3 text-right tabular-nums font-semibold">
                          GH₵ {profit.toFixed(2)}
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-block border border-neutral-300 text-neutral-700 text-xs px-2 py-0.5">{s.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent expenses */}
        <section className="border border-black">
          <div className="border-b border-black px-5 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest">Recent Expenses</h2>
            <span className="text-xs text-neutral-500">{expenses.length} total</span>
          </div>
          {expenses.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500">No expenses yet.</p>
          ) : (
            <ul>
              {expenses.map((e: any) => (
                <li key={e.id} className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                  <div>
                    <p className="font-medium">{e.category}</p>
                    {e.note && <p className="text-xs text-neutral-500 mt-0.5">{e.note}</p>}
                  </div>
                  <p className="font-semibold tabular-nums">GH₵ {e.amountGhs.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}