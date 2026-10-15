'use server'

import sharp from 'sharp'
import { friendlyError } from '@/lib/friendly-error'
import { deleteObject, keyFromUrl, putObject } from '@/lib/storage'
import { MAX_IMAGE_BYTES } from '@/lib/upload-limits'
import { requireAdmin } from '@/lib/session'

/**
 * Sube una imagen al bucket `media`. El archivo ya viene achicado por
 * resizeImageFile en el navegador (achica el peso del envío); acá
 * se re-optimiza a WebP calidad 82 con sharp para un peso final consistente
 * sin importar el formato/tamaño original.
 */
export async function uploadImageAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    await requireAdmin()
    const file = formData.get('file')
    if (!(file instanceof File)) return { error: 'Archivo inválido.' }
    if (file.size > MAX_IMAGE_BYTES) return { error: 'La imagen no puede superar 12 MB.' }

    const folder = String(formData.get('folder') ?? 'uploads')
    if (!/^[a-z0-9_-]{1,40}(\/[a-z0-9_-]{1,40}){0,2}$/i.test(folder)) return { error: 'Carpeta inválida.' }
    const original = Buffer.from(await file.arrayBuffer())

    const buf = await sharp(original)
      .rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()

    const url = await putObject(`${folder}/${crypto.randomUUID()}.webp`, buf)
    return { url }
  } catch (e) {
    console.error('uploadImageAction exception:', e)
    return { error: friendlyError(e, 'No se pudo subir la imagen.') }
  }
}

/** Borra un archivo propio del volumen a partir de su URL (botón "Quitar"). Las URLs externas se ignoran. */
export async function deleteMediaAction(url: string): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const key = keyFromUrl(url)
    if (key) await deleteObject(key)
    return {}
  } catch (e) {
    return { error: friendlyError(e, 'No se pudo eliminar el archivo.') }
  }
}
