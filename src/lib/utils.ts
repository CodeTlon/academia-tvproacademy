import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Link de WhatsApp (wa.me) con mensaje pre-cargado. Funciona de verdad, sin backend. */
export function waLink(whatsapp: string, message: string) {
  return `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
}

/** Tiempo de lectura estimado a partir del HTML de un post (200 palabras/min). */
export function readTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min`
}
