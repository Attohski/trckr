'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { put, del } from '@vercel/blob'

export async function addShipment(formData: FormData) {
  await db.orm.public.Shipment.create({
    clientId: parseInt(formData.get('clientId') as string),
    goods: formData.get('goods') as string,
    shippingMark: (formData.get('shippingMark') as string) || null,
    productCostGhs: parseFloat(formData.get('productCostGhs') as string),
    clientQuoteGhs: parseFloat(formData.get('clientQuoteGhs') as string),
  })
  revalidatePath('/')
  revalidatePath('/shipments')
}

export async function addExpense(formData: FormData) {
  const amount = parseFloat(formData.get('amountGhs') as string)
  if (amount < 0) throw new Error('Amount cannot be negative')
  await db.orm.public.Expense.create({
    category: formData.get('category') as string,
    amountGhs: amount,
    note: (formData.get('note') as string) || null,
  })
  revalidatePath('/')
  revalidatePath('/expenses')
}

export async function addPayment(formData: FormData) {
  await db.orm.public.Payment.create({
    clientId: parseInt(formData.get('clientId') as string),
    amountGhs: parseFloat(formData.get('amountGhs') as string),
  })
  revalidatePath('/')
  revalidatePath('/payments')
}

export async function markShipped(formData: FormData) {
  const shipmentId = parseInt(formData.get('shipmentId') as string)
  const dateStr = formData.get('date') as string
  await db.orm.public.Shipment.where({ id: shipmentId }).update({
    shippedDate: dateStr ? new Date(dateStr) : new Date(),
    status: 'In Transit',
  })
  revalidatePath('/shipments')
  revalidatePath('/')
}

export async function markDelivered(formData: FormData) {
  const shipmentId = parseInt(formData.get('shipmentId') as string)
  const dateStr = formData.get('date') as string
  await db.orm.public.Shipment.where({ id: shipmentId }).update({
    delivered: true,
    deliveredDate: dateStr ? new Date(dateStr) : new Date(),
    status: 'Delivered',
  })
  revalidatePath('/shipments')
  revalidatePath('/')
}

export async function updateShipment(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  await db.orm.public.Shipment.where({ id }).update({
    clientId: parseInt(formData.get('clientId') as string),
    goods: formData.get('goods') as string,
    shippingMark: (formData.get('shippingMark') as string) || null,
    productCostGhs: parseFloat(formData.get('productCostGhs') as string),
    clientQuoteGhs: parseFloat(formData.get('clientQuoteGhs') as string),
    status: formData.get('status') as string,
  })
  revalidatePath('/shipments')
  revalidatePath('/')
}

export async function deleteShipment(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  await db.orm.public.Shipment.where({ id }).delete()
  revalidatePath('/shipments')
  revalidatePath('/')
}

export async function deleteExpense(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  await db.orm.public.Expense.where({ id }).delete()
  revalidatePath('/expenses')
  revalidatePath('/')
}

export async function deletePayment(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  await db.orm.public.Payment.where({ id }).delete()
  revalidatePath('/payments')
  revalidatePath('/')
}

export async function uploadInvoice(formData: FormData) {
  const file = formData.get('invoice') as File
  const shipmentId = parseInt(formData.get('shipmentId') as string)
  if (!file || file.size === 0) return
  const blob = await put(`invoices/${shipmentId}-${file.name}`, file, { access: 'public' })
  await db.orm.public.Shipment.where({ id: shipmentId }).update({ invoiceUrl: blob.url })
  revalidatePath('/shipments')
  revalidatePath('/')
}

export async function deleteInvoice(formData: FormData) {
  const shipmentId = parseInt(formData.get('shipmentId') as string)
  const url = formData.get('url') as string
  if (url) await del(url)
  await db.orm.public.Shipment.where({ id: shipmentId }).update({ invoiceUrl: null })
  revalidatePath('/shipments')
  revalidatePath('/')
}