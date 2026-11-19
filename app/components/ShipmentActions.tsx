"use client";

import { markShipped, markDelivered } from "../actions";

export default function ShipmentActions({
  shipmentId,
  delivered,
  shippedDate,
}: {
  shipmentId: number;
  delivered: boolean;
  shippedDate: string | null;
}) {
  if (delivered) {
    return <span className="text-xs text-neutral-500">Delivered</span>;
  }
  return (
    <div className="flex items-center gap-2">
      {!shippedDate && (
        <form action={markShipped} className="flex items-center gap-1">
          <input type="hidden" name="shipmentId" value={shipmentId} />
          <input
            type="date"
            name="date"
            required
            className="border border-neutral-300 px-2 py-1 text-xs w-32"
          />
          <button type="submit" className="text-xs font-medium underline underline-offset-4">Ship</button>
        </form>
      )}
      <form action={markDelivered} className="flex items-center gap-1">
        <input type="hidden" name="shipmentId" value={shipmentId} />
        <input
          type="date"
          name="date"
          required
          className="border border-neutral-300 px-2 py-1 text-xs w-32"
        />
        <button type="submit" className="text-xs font-medium underline underline-offset-4">Deliver</button>
      </form>
    </div>
  );
}