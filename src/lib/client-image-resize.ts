/**
 * Achica una imagen en el navegador antes de subirla. Sin esto, una foto de
 * celular real (6-12MB) llega tal cual al server action y Vercel corta el
 * body de cualquier función serverless en ~4.5MB — el upload falla siempre,
 * sin importar lo que diga next.config.js.
 */
export async function resizeImageFile(file: File, maxDim = 2000, quality = 0.85): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
  if (scale === 1 && file.size < 2 * 1024 * 1024) return file

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) return file
  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
}
