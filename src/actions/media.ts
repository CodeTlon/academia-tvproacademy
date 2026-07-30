'use server'

import sharp from 'sharp'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { friendlyError } from '@/lib/friendly-error'
import { extractStoragePath } from '@/lib/storage'
import { MAX_IMAGE_BYTES } from '@/lib/upload-limits'
import { requireUser } from './auth'

/**
 * Sube una imagen al bucket `media`. El archivo ya viene achicado por
 * resizeImageFile en el navegador (evita el límite de body de Vercel); acá
 * se re-optimiza a WebP calidad 82 con sharp para un peso final consistente
 * sin importar el formato/tamaño original.
 */
export async function uploadImageAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    await requireUser()
    const file = formData.get('file')
    if (!(file instanceof File)) return { error: 'Archivo inválido.' }
    if (file.size > MAX_IMAGE_BYTES) return { error: 'La imagen no puede superar 12 MB.' }

    const folder = String(formData.get('folder') ?? 'uploads')
    const original = Buffer.from(await file.arrayBuffer())

    const buf = await sharp(original)
      .rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()

    const path = `${folder}/${crypto.randomUUID()}.webp`
    const supabase = await createSupabaseServerClient()
    // Blob (no el Buffer de sharp directo): un Buffer chico puede ser una
    // vista sobre el ArrayBuffer "pooled" interno de Node — el fetch/undici
    // que usa @supabase/storage-js lo rechaza con "SharedArrayBuffer is not
    // allowed". Envolver en Blob evita el chequeo por completo.
    const blob = new Blob([new Uint8Array(buf)], { type: 'image/webp' })
    const { error } = await supabase.storage.from('media').upload(path, blob, { contentType: 'image/webp', upsert: false })
    if (error) {
      console.error('uploadImageAction storage error:', error)
      return { error: friendlyError(error, 'No se pudo subir la imagen.') }
    }

    const { data } = supabase.storage.from('media').getPublicUrl(path)
    return { url: data.publicUrl }
  } catch (e) {
    console.error('uploadImageAction exception:', e)
    return { error: friendlyError(e, 'No se pudo subir la imagen.') }
  }
}

/** Borra un archivo del bucket `media` a partir de su URL pública (botón "Quitar"). */
export async function deleteMediaAction(url: string): Promise<{ error?: string }> {
  try {
    await requireUser()
    const path = extractStoragePath(url)
    if (!path) return {}
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.storage.from('media').remove([path])
    if (error) return { error: friendlyError(error, 'No se pudo eliminar el archivo.') }
    return {}
  } catch (e) {
    return { error: friendlyError(e, 'No se pudo eliminar el archivo.') }
  }
}
