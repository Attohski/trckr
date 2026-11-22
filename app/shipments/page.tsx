export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import InvoiceCell from "../components/InvoiceCell";
import ShipmentActions from "../components/ShipmentActions";
import EditShipmentDialog from "../components/EditShipmentDialog";
import { deleteShipment } from "../actions";

function calcProfit(s: any) {
  return (s.clientQuoteGhs ?? 0) - (s.productCostGhs ?? 0);
}

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;

  const allShipments = await db.orm.public.Shipment.orderBy((s) => s.createdAt.desc()).all();
  const clients = await db.orm.public.Client.all();

  const clientMap = new Map<number, string>();
  clients.forEach((c: any) => clientMap.set(c.id, c.name));

  const shipments = allShipments.filter((s: any) => {
    if (filter === "shipped-not-delivered") return s.shippedDate && !s.delivered;
    if (filter === "shipped-delivered") return s.shippedDate && s.delivered;
    return true;
  });

  const tabs = [
    { key: "", label: "All", count: allShipments.length },
    {
      key: "shipped-not-delivered",
      label: "Shipped · Not Delivered",
      count: allShipments.filter((s: any) => s.shippedDate && !s.delivered).length,
    },
    {
      key: "shipped-delivered",
      label: "Shipped · Delivered",
      count: allShipments.filter((s: any) => s.shippedDate && s.delivered).length,
    },
  ];

  const clientOptions = clients.map((c: any) => ({ id: c.id, name: c.name }));

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-end justify-between border-b border-black pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">All Shipments ({shipments.length})</h1>
        <a
          href="/api/export/shipments"
          className="text-sm font-medium underline underline-offset-4 hover:opacity-60"
        >
          Export CSV
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = (filter || "") === t.key;
          return (
            <Link
              key={t.key}
              href={t.key ? `/shipments?filter=${t.key}` : "/shipments"}
              className={`px-4 py-2 text-sm border transition-colors ${
                active
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-neutral-300 hover:border-black"
              }`}
            >
              {t.label} ({t.count})
            </Link>
          );
        })}
      </div>

      <div className="border border-black overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black text-left text-xs uppercase tracking-widest text-neutral-500">
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Goods</th>
              <th className="px-4 py-3 font-medium">Shipping Mark</th>
              <th className="px-4 py-3 font-medium text-right">Quote (GH₵)</th>
              <th className="px-4 py-3 font-medium text-right">Profit (GH₵)</th>
              <th className="px-4 py-3 font-medium">Shipped</th>
              <th className="px-4 py-3 font-medium">Delivered</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
              <th className="px-4 py-3 font-medium">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s: any) => {
              const profit = calcProfit(s);
              return (
                <tr key={s.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{clientMap.get(s.clientId) ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    <Link href={`/shipments/${s.id}`} className="underline underline-offset-4 hover:opacity-60">
                      {s.goods}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{s.shippingMark || "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-600">{s.clientQuoteGhs.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">{profit.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-neutral-600">
                    {s.shippedDate ? new Date(s.shippedDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600">
                    {s.deliveredDate ? new Date(s.deliveredDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block border border-neutral-300 text-neutral-700 text-xs px-2 py-0.5">
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ShipmentActions
                        shipmentId={s.id}
                        delivered={s.delivered}
                        shippedDate={s.shippedDate}
                      />
                      <EditShipmentDialog shipment={s} clients={clientOptions} />
                      <form action={deleteShipment}>
                        <input type="hidden" name="id" value={s.id} />
                        <button
                          type="submit"
                          className="text-xs font-medium underline underline-offset-4 hover:opacity-60"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <InvoiceCell shipmentId={s.id} invoiceUrl={s.invoiceUrl} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {shipments.length === 0 && (
          <p className="p-6 text-sm text-neutral-500">No shipments match this filter.</p>
        )}
      </div>
    </main>
  );
}