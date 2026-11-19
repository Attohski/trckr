'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function addClient(formData: FormData) {
  await db.orm.public.Client.create({
    data: {
      name: formData.get('name') as string,
      phone: (formData.get('phone') as string) || null,
      notes: (formData.get('notes') as string) || null,
    },
  })
  revalidatePath('/clients')
  revalidatePath('/')
}

export async function updateClient(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  await db.orm.public.Client.update({
    where: { id },
    data: {
      name: formData.get('name') as string,
      phone: (formData.get('phone') as string) || null,
      notes: (formData.get('notes') as string) || null,
    },
  })
  revalidatePath('/clients')
}

export async function deleteClient(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  await db.orm.public.Client.delete({ where: { id } })
  revalidatePath('/clients')
}