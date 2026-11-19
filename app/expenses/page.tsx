export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { deleteExpense } from "../actions";

export default async function ExpensesPage() {
  const expenses = await db.orm.public.Expense.orderBy((e) => e.createdAt.desc()).all();
  const total = expenses.reduce((sum: number, e: any) => sum + e.amountGhs, 0);

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-end justify-between border-b border-black pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">All Expenses ({expenses.length})</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500">Total: GH₵ {total.toFixed(2)}</span>
          <a href="/api/export/expenses" className="text-sm font-medium underline underline-offset-4 hover:opacity-60">
            ⬇ Export CSV
          </a>
        </div>
      </div>

      <div className="border border-black">
        {expenses.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500">No expenses yet.</p>
        ) : (
          <ul>
            {expenses.map((e: any) => (
              <li key={e.id} className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div>
                  <p className="font-medium">{e.category}</p>
                  {e.note && <p className="text-xs text-neutral-500 mt-0.5">{e.note}</p>}
                </div>
                <div className="flex items-center gap-6">
                  <p className="font-semibold tabular-nums">GH₵ {e.amountGhs.toFixed(2)}</p>
                  <form action={deleteExpense}>
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit" className="text-xs font-medium underline underline-offset-4 hover:opacity-60">Delete</button>
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