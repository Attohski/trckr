import { db } from "@/lib/db";

function toCsv(rows: Record<string, any>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

export async function GET() {
  const expenses = await db.orm.public.Expense.all();
  const rows = expenses.map((e: any) => ({
    id: e.id,
    category: e.category,
    amountGhs: e.amountGhs,
    note: e.note,
    shipmentId: e.shipmentId,
    createdAt: e.createdAt,
  }));
  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="expenses.csv"',
    },
  });
}