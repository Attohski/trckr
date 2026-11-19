export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { addClient, deleteClient } from "./actions";

export default async function ClientsPage() {
  const clients = await db.orm.public.Client.all();
  const shipments = await db.orm.public.Shipment.all();
  const payments = await db.orm.public.Payment.all();

  const rows = clients.map((c: any) => {
    const cs = shipments.filter((s: any) => s.clientId === c.id);
    const cp = payments.filter((p: any) => p.clientId === c.id);
    const quoted = cs.reduce((sum: number, s: any) => sum + s.clientQuoteGhs, 0);
    const paid = cp.reduce((sum: number, p: any) => sum + p.amountGhs, 0);
    return { ...c, shipmentCount: cs.length, quoted, paid, balance: quoted - paid };
  });

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Clients ({clients.length})</h1>

      {/* Add client */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Add Client</h2>
        <form action={addClient} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input name="name" placeholder="Client Name" required className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <input name="phone" placeholder="Phone (optional)" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <input name="notes" placeholder="Notes (optional)" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg px-4 py-2 text-sm">Add Client</button>
        </form>
      </div>

      {/* Client table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Phone</th>
              <th className="text-right px-4 py-3 font-medium">Shipments</th>
              <th className="text-right px-4 py-3 font-medium">Quoted</th>
              <th className="text-right px-4 py-3 font-medium">Paid</th>
              <th className="text-right px-4 py-3 font-medium">Balance</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                <td className="px-4 py-3 text-slate-600">{c.phone || "—"}</td>
                <td className="px-4 py-3 text-right text-slate-600">{c.shipmentCount}</td>
                <td className="px-4 py-3 text-right text-slate-600">GH₵ {c.quoted.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-blue-600">GH₵ {c.paid.toFixed(2)}</td>
                <td className={`px-4 py-3 text-right font-semibold ${c.balance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  GH₵ {c.balance.toFixed(2)}
                </td>
                <td className="px-4 py-3">
  {c.shipmentCount === 0 && c.paid === 0 ? (
    <form action={deleteClient}>
      <input type="hidden" name="id" value={c.id} />
      <button type="submit" className="text-xs text-rose-500 hover:underline">Delete</button>
    </form>
  ) : (
    <span className="text-xs text-neutral-400">Has records</span>
  )}
</td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && <p className="p-6 text-slate-500 text-sm">No clients yet.</p>}
      </div>
    </main>
  );
}