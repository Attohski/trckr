export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { deletePayment } from "../actions";

export default async function PaymentsPage() {
  const payments = await db.orm.public.Payment.orderBy((p) => p.createdAt.desc()).all();
  const clients = await db.orm.public.Client.all();

  const clientMap = new Map<number, string>();
  clients.forEach((c: any) => clientMap.set(c.id, c.name));

  const total = payments.reduce((sum: number, p: any) => sum + p.amountGhs, 0);

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-end justify-between border-b border-black pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">All Payments ({payments.length})</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500">Total: GH₵ {total.toFixed(2)}</span>
          <a href="/api/export/payments" className="text-sm font-medium underline underline-offset-4 hover:opacity-60">
            Export CSV
          </a>
        </div>
      </div>

      <div className="border border-black">
        {payments.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500">No payments yet.</p>
        ) : (
          <ul>
            {payments.map((p: any) => (
              <li key={p.id} className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div>
                  <p className="font-medium">{clientMap.get(p.clientId) ?? "—"}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <p className="font-semibold tabular-nums">GH₵ {p.amountGhs.toFixed(2)}</p>
                  <form action={deletePayment}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-xs font-medium underline underline-offset-4 hover:opacity-60">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}