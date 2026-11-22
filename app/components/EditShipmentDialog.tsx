"use client";

import { useState } from "react";
import { updateShipment } from "../actions";

export default function EditShipmentDialog({
  shipment,
  clients,
}: {
  shipment: any;
  clients: { id: number; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-blue-600 hover:underline">Edit</button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Edit Shipment</h3>
            <form action={updateShipment} onSubmit={() => setOpen(false)} className="space-y-3">
              <input type="hidden" name="id" value={shipment.id} />
              <select name="clientId" defaultValue={shipment.clientId} required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input name="goods" defaultValue={shipment.goods} required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              <input name="shippingMark" defaultValue={shipment.shippingMark || ""} placeholder="Shipping Mark" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input name="productCostGhs" type="number" step="0.01" defaultValue={shipment.productCostGhs} required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" />
                <input name="freightGhs" type="number" step="0.01" defaultValue={shipment.freightGhs} required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                <input name="dutyGhs" type="number" step="0.01" defaultValue={shipment.dutyGhs} required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <input name="clientQuoteGhs" type="number" step="0.01" defaultValue={shipment.clientQuoteGhs} required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              <select name="status" defaultValue={shipment.status} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                {["Quoted", "Deposit Received", "Ordered", "In Transit", "Clearing", "Delivered", "Paid"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-slate-900 text-white rounded-lg px-4 py-2 text-sm">Save</button>
                <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}