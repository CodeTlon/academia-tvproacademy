import { createWriteStream } from 'node:fs'
import { rm } from 'node:fs/promises'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { NextResponse, type NextRequest } from 'next/server'
import { getUser, isStudent } from '@/lib/session'
import { publicUrl, reservePath } from '@/lib/storage'
import { maxBytesForMime } from '@/lib/upload-limits'

// Subida de archivos del dashboard al volumen del servidor. Solo usuarios autenticados. El cuerpo es el archivo crudo;
// carpeta y tipo viajan en la query/cabecera. La extensión sale del tipo permitido, nunca del nombre que mande el cliente.
// Solo imágenes (sin SVG: puede llevar scripts), PDF y video: se sirven desde nuestro dominio y un HTML subido sería XSS.
const EXT_POR_TIPO: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif',
  'application/pdf': 'pdf', 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
}
// Hasta 3 segmentos (ej. blog/adjuntos); sin "..", sin segmentos vacíos ni caracteres raros.
const FOLDER = /^[a-z0-9_-]{1,40}(\/[a-z0-9_-]{1,40}){0,2}$/i

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  if (isStudent(user)) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
  // Anti-CSRF: la subida tiene que venir de este mismo sitio.
  const origen = request.headers.get('origin')
  if (!origen || new URL(origen).host !== request.headers.get('host')) {
    return NextResponse.json({ error: 'Origen inválido.' }, { status: 403 })
  }

  const folder = request.nextUrl.searchParams.get('folder') ?? ''
  if (!FOLDER.test(folder)) return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  const contentType = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
  const ext = EXT_POR_TIPO[contentType]
  if (!ext) return NextResponse.json({ error: 'Tipo de archivo no permitido.' }, { status: 415 })

  const max = maxBytesForMime(contentType)
  const declarado = Number(request.headers.get('content-length') ?? 0)
  if (!declarado || declarado > max) {
    return NextResponse.json({ error: `Máximo ${Math.round(max / (1024 * 1024))}MB.` }, { status: declarado ? 413 : 411 })
  }
  if (!request.body) return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })

  const key = `${folder}/${crypto.randomUUID()}.${ext}`
  const abs = await reservePath(key)
  // El Content-Length se puede falsear: se cuentan los bytes reales y se corta si se pasa del máximo.
  let recibidos = 0
  const limite = new Transform({
    transform(chunk, _enc, cb) {
      recibidos += chunk.length
      if (recibidos > max) cb(new Error('LIMITE'))
      else cb(null, chunk)
    },
  })
  try {
    await pipeline(Readable.fromWeb(request.body as import('node:stream/web').ReadableStream), limite, createWriteStream(abs, { flags: 'wx' }))
  } catch (e) {
    await rm(abs, { force: true })
    if (e instanceof Error && e.message === 'LIMITE') return NextResponse.json({ error: `Máximo ${Math.round(max / (1024 * 1024))}MB.` }, { status: 413 })
    console.error('[upload]', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'No se pudo guardar el archivo.' }, { status: 500 })
  }
  return NextResponse.json({ url: publicUrl(key) })
}

