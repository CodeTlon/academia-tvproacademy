export const MAX_IMAGE_BYTES = 12 * 1024 * 1024
export const MAX_VIDEO_BYTES = 25 * 1024 * 1024
/** Video insertado dentro del contenido del blog (sube directo a Storage desde el navegador, no vía Server Action). */
export const MAX_INLINE_VIDEO_BYTES = 15 * 1024 * 1024
export const MAX_DOC_BYTES = 20 * 1024 * 1024

export function maxBytesForMime(mime: string): number {
  if (mime === 'application/pdf') return MAX_DOC_BYTES
  if (mime.startsWith('video/')) return MAX_VIDEO_BYTES
  return MAX_IMAGE_BYTES
}
