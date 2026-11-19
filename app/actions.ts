'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { put, del } from '@vercel/blob'

export async function addShipment(formData: FormData) {
  const rate = parseFloat(formData.get('exchangeRate') as string)
  if (!rate || rate <= 0) throw new Error('Exchange rate must be greater than 0')

  const cost = parseFloat(formData.get('productCostRmb') as string)
  const freight = parseFloat(formData.get('freightGhs') as string)
  const duty = parseFloat(formData.get('dutyGhs') as string)
  const quote = parseFloat(formData.get('clientQuoteGhs') as string)
  if ([cost, freight, duty, quote].some((v) => v < 0)) {
    throw new Error('Amounts cannot be negative')
  }

  await db.orm.public.Shipment.create({
    data: {
      clientId: parseInt(formData.get('clientId') as string),
      goods: formData.get('goods') as string,
      shippingMark: formData.get('shippingMark') as string || null,
      productCostRmb: cost,
      exchangeRate: rate,
      freightGhs: freight,
      dutyGhs: duty,
      clientQuoteGhs: quote,
    },
  })
  revalidatePath('/')
  revalidatePath('/shipments')
}

export async function addExpense(formData: FormData) {
  await db.orm.public.Expense.create({
    category: formData.get('category') as string,
    amountGhs: parseFloat(formData.get('amountGhs') as string),
    note: formData.get('note') as string,
  })
  revalidatePath('/')
}

export async function addPayment(formData: FormData) {
  await db.orm.public.Payment.create({
    clientId: parseInt(formData.get('clientId') as string),
    amountGhs: parseFloat(formData.get('amountGhs') as string),
  })
  revalidatePath('/')
}

export async function uploadInvoice(formData: FormData) {
  const file = formData.get('invoice') as File
  const shipmentId = parseInt(formData.get('shipmentId') as string)
  if (!file || file.size === 0) return

  const blob = await put(`invoices/${shipmentId}-${file.name}`, file, { access: 'public' })

  await db.orm.public.Shipment.update({
    where: { id: shipmentId },
    data: { invoiceUrl: blob.url },
  })
  revalidatePath('/shipments')
  revalidatePath('/')
}

export async function deleteInvoice(formData: FormData) {
  const shipmentId = parseInt(formData.get('shipmentId') as string)
  const url = formData.get('url') as string
  if (url) await del(url)
  await db.orm.public.Shipment.update({
    where: { id: shipmentId },
    data: { invoiceUrl: null },
  })
  revalidatePath('/shipments')
  revalidatePath('/')
}

export async function markShipped(formData: FormData) {
  const shipmentId = parseInt(formData.get('shipmentId') as string)
  const dateStr = formData.get('date') as string
  await db.orm.public.Shipment.update({
    where: { id: shipmentId },
    data: {
      shippedDate: dateStr ? new Date(dateStr) : new Date(),
      status: 'In Transit',
    },
  })
  revalidatePath('/shipments')
  revalidatePath('/')
}

export async function markDelivered(formData: FormData) {
  const shipmentId = parseInt(formData.get('shipmentId') as string)
  const dateStr = formData.get('date') as string
  await db.orm.public.Shipment.update({
    where: { id: shipmentId },
    data: {
      delivered: true,
      deliveredDate: dateStr ? new Date(dateStr) : new Date(),
      status: 'Delivered',
    },
  })
  revalidatePath('/shipments')
  revalidatePath('/')
}

export async function updateShipment(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  await db.orm.public.Shipment.update({
    where: { id },
    data: {
      clientId: parseInt(formData.get('clientId') as string),
      goods: formData.get('goods') as string,
      shippingMark: (formData.get('shippingMark') as string) || null,
      productCostRmb: parseFloat(formData.get('productCostRmb') as string),
      exchangeRate: parseFloat(formData.get('exchangeRate') as string),
      freightGhs: parseFloat(formData.get('freightGhs') as string),
      dutyGhs: parseFloat(formData.get('dutyGhs') as string),
      clientQuoteGhs: parseFloat(formData.get('clientQuoteGhs') as string),
      status: formData.get('status') as string,
    },
  })
  revalidatePath('/shipments')
  revalidatePath('/')
}

export async function deleteShipment(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  await db.orm.public.Shipment.delete({ where: { id } })
  revalidatePath('/shipments')
  revalidatePath('/')
}

export async function deleteExpense(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  await db.orm.public.Expense.delete({ where: { id } })
  revalidatePath('/expenses')
  revalidatePath('/')
}

export async function deletePayment(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  await db.orm.public.Payment.delete({ where: { id } })
  revalidatePath('/payments')
  revalidatePath('/')
}