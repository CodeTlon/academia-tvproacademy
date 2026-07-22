import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Link de WhatsApp (wa.me) con mensaje pre-cargado. Funciona de verdad, sin backend. */
export function waLink(whatsapp: string, message: string) {
  return `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
}
