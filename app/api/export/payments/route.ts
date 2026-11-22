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
  const payments = await db.orm.public.Payment.all();
  const clients = await db.orm.public.Client.all();
  const clientMap = new Map<number, string>();
  clients.forEach((c: any) => clientMap.set(c.id, c.name));

  const rows = payments.map((p: any) => ({
    id: p.id,
    client: clientMap.get(p.clientId) ?? "",
    amountGhs: p.amountGhs,
    createdAt: p.createdAt,
  }));
  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="payments.csv"',
    },
  });
}