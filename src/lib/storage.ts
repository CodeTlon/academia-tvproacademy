import { createReadStream } from 'node:fs'
import { mkdir, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join, resolve, sep } from 'node:path'

// Archivos en disco: volumen persistente de Coolify (STORAGE_DIR). Todo es público y se sirve por /media/[...ruta].
// Las keys son `[carpeta[/subcarpeta[/subcarpeta]]/]archivo.ext` (hasta 4 segmentos; los archivos migrados de Supabase pueden estar en la raíz). Los nombres con UUID no se reutilizan, por eso se cachean un año.
const SEGMENTO = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

export const STORAGE_DIR = resolve(process.env.STORAGE_DIR ?? './storage')

export const MEDIA_PREFIX = '/media/'

// Extensiones servibles y su Content-Type. El tipo sale de la extensión, nunca de lo que diga el cliente.
export const TIPOS_POR_EXT: Record<string, string> = {
  webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', avif: 'image/avif', gif: 'image/gif',
  pdf: 'application/pdf', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
}

// Resuelve la ruta dentro del volumen y rechaza todo lo que se escape (.., absolutas, caracteres raros).
function rutaSegura(key: string): string {
  const partes = key.split('/')
  if (partes.length > 4 || !partes.every((p) => SEGMENTO.test(p) && !p.includes('..'))) {
    throw new Error('Ruta de archivo inválida')
  }
  const abs = resolve(STORAGE_DIR, ...partes)
  if (!abs.startsWith(STORAGE_DIR + sep)) throw new Error('Ruta de archivo inválida')
  return abs
}

export const publicUrl = (key: string) => `${MEDIA_PREFIX}${key}`

/** Devuelve la key si la URL es un archivo propio (/media/...), para poder borrarlo; si no, null. */
export function keyFromUrl(url: string): string | null {
  if (!url.startsWith(MEDIA_PREFIX)) return null
  const key = decodeURIComponent(url.slice(MEDIA_PREFIX.length).split(/[?#]/)[0])
  try {
    rutaSegura(key)
    return key
  } catch {
    return null
  }
}

/** Guarda un archivo nuevo (nunca pisa uno existente: la key lleva un UUID). Devuelve la URL pública. */
export async function putObject(key: string, body: Buffer | Uint8Array) {
  const abs = rutaSegura(key)
  await mkdir(dirname(abs), { recursive: true })
  await writeFile(abs, body, { flag: 'wx' })
  return publicUrl(key)
}

export async function deleteObject(key: string) {
  try {
    await rm(rutaSegura(key), { force: true })
  } catch {
    // Ruta inválida o archivo ya borrado: no es un error para quien llama.
  }
}

/** Ruta absoluta de la key para escribir en streaming (crea la carpeta). */
export async function reservePath(key: string): Promise<string> {
  const abs = rutaSegura(key)
  await mkdir(dirname(abs), { recursive: true })
  return abs
}

export async function fileInfo(key: string): Promise<{ size: number; abs: string } | null> {
  try {
    const abs = rutaSegura(key)
    const s = await stat(abs)
    return s.isFile() ? { size: s.size, abs } : null
  } catch {
    return null
  }
}

export const streamFile = (abs: string, rango?: { start: number; end: number }) => createReadStream(abs, rango)

export const rutaDe = (key: string) => join(STORAGE_DIR, key)
