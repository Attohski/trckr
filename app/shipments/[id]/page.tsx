export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";

function calcProfit(s: any) {
  return (s.clientQuoteGhs ?? 0) - (s.productCostGhs ?? 0);
}

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shipmentId = parseInt(id);

  const shipment = await db.orm.public.Shipment.where({ id: shipmentId }).first();
  if (!shipment) {
    return <main className="p-10 text-neutral-500">Shipment not found.</main>;
  }

  const clients = await db.orm.public.Client.all();
  const clientMap = new Map<number, string>();
  clients.forEach((c: any) => clientMap.set(c.id, c.name));
  const clientName = clientMap.get(shipment.clientId) ?? "—";

  const expenses = await db.orm.public.Expense.where({ shipmentId }).all();
  const payments = await db.orm.public.Payment.where({ clientId: shipment.clientId }).all();

  const profit = calcProfit(shipment);
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amountGhs, 0);
  const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amountGhs, 0);

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center gap-4 border-b border-black pb-4">
        <Link href="/shipments" className="text-sm underline underline-offset-4 hover:opacity-60">
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{shipment.goods}</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-black p-4">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Client</p>
          <p className="font-medium mt-1">{clientName}</p>
        </div>
        <div className="border border-black p-4">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Quote</p>
          <p className="font-semibold tabular-nums mt-1">GH₵ {shipment.clientQuoteGhs.toFixed(2)}</p>
        </div>
        <div className="border border-black p-4">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Profit</p>
          <p className="font-semibold tabular-nums mt-1">GH₵ {profit.toFixed(2)}</p>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="border border-black">
        <div className="border-b border-black px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Cost Breakdown</h2>
        </div>
        <dl className="divide-y divide-neutral-100 text-sm">
          <div className="flex justify-between px-5 py-3">
  <dt className="text-neutral-500">Product Cost</dt>
  <dd className="tabular-nums">GH₵ {shipment.productCostGhs.toFixed(2)}</dd>
</div>
<div className="flex justify-between px-5 py-3 font-semibold">
  <dt>Client Quote</dt>
  <dd className="tabular-nums">GH₵ {shipment.clientQuoteGhs.toFixed(2)}</dd>
</div>
        </dl>
      </div>

      {/* Linked Expenses */}
      <div className="border border-black">
        <div className="border-b border-black px-5 py-3 flex justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Linked Expenses</h2>
          <span className="text-xs text-neutral-500">Total: GH₵ {totalExpenses.toFixed(2)}</span>
        </div>
        {expenses.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500">No expenses linked to this shipment.</p>
        ) : (
          <ul>
            {expenses.map((e: any) => (
              <li key={e.id} className="px-5 py-3 border-b border-neutral-100 flex justify-between text-sm">
                <span>
                  {e.category}
                  {e.note && <span className="text-neutral-400"> — {e.note}</span>}
                </span>
                <span className="tabular-nums">GH₵ {e.amountGhs.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Payments from this Client */}
      <div className="border border-black">
        <div className="border-b border-black px-5 py-3 flex justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Payments from {clientName}</h2>
          <span className="text-xs text-neutral-500">Total: GH₵ {totalPaid.toFixed(2)}</span>
        </div>
        {payments.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500">No payments recorded from this client.</p>
        ) : (
          <ul>
            {payments.map((p: any) => (
              <li key={p.id} className="px-5 py-3 border-b border-neutral-100 flex justify-between text-sm">
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                <span className="tabular-nums">GH₵ {p.amountGhs.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Status & Dates */}
      <div className="border border-black p-5 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-neutral-500">Shipping Mark</span>
          <span>{shipment.shippingMark || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Status</span>
          <span>{shipment.status}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Shipped</span>
          <span>{shipment.shippedDate ? new Date(shipment.shippedDate).toLocaleDateString() : "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Delivered</span>
          <span>{shipment.deliveredDate ? new Date(shipment.deliveredDate).toLocaleDateString() : "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Invoice</span>
          {shipment.invoiceUrl ? (
            <a href={shipment.invoiceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              Download
            </a>
          ) : (
            <span>—</span>
          )}
        </div>
      </div>
    </main>
  );
}