"use client";

import { uploadInvoice, deleteInvoice } from "../actions";

export default function InvoiceCell({
  shipmentId,
  invoiceUrl,
}: {
  shipmentId: number;
  invoiceUrl: string | null;
}) {
  if (invoiceUrl) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          Download
        </a>
        <form action={deleteInvoice}>
          <input type="hidden" name="shipmentId" value={shipmentId} />
          <input type="hidden" name="url" value={invoiceUrl} />
          <button type="submit" className="text-xs text-rose-500 hover:underline">Delete</button>
        </form>
      </div>
    );
  }
  return (
    <form action={uploadInvoice} className="flex items-center gap-1">
      <input type="hidden" name="shipmentId" value={shipmentId} />
      <input
        type="file"
        name="invoice"
        accept="application/pdf,image/*"
        required
        className="text-xs w-28 file:mr-1 file:rounded file:border-0 file:bg-slate-100 file:px-1.5 file:py-0.5 file:text-xs"
      />
      <button type="submit" className="text-xs font-medium text-emerald-600 hover:underline">Upload</button>
    </form>
  );
}