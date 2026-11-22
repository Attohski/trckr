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
  const shipments = await db.orm.public.Shipment.all();
  const clients = await db.orm.public.Client.all();
  const clientMap = new Map<number, string>();
  clients.forEach((c: any) => clientMap.set(c.id, c.name));

  const rows = shipments.map((s: any) => ({
  id: s.id,
  client: clientMap.get(s.clientId) ?? "",
  goods: s.goods,
  shippingMark: s.shippingMark,
  productCostGhs: s.productCostGhs,
  clientQuoteGhs: s.clientQuoteGhs,
  profitGhs: (s.clientQuoteGhs ?? 0) - (s.productCostGhs ?? 0),
  status: s.status,
  shippedDate: s.shippedDate,
  deliveredDate: s.deliveredDate,
  delivered: s.delivered,
  createdAt: s.createdAt,
}));

  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="shipments.csv"',
    },
  });
}