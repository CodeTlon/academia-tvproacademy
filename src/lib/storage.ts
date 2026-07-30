const PUBLIC_MARKER = '/storage/v1/object/public/media/'

/** Extrae el path dentro del bucket `media` a partir de una URL pública, para poder borrarlo. */
export function extractStoragePath(url: string): string | null {
  const i = url.indexOf(PUBLIC_MARKER)
  return i === -1 ? null : decodeURIComponent(url.slice(i + PUBLIC_MARKER.length))
}
