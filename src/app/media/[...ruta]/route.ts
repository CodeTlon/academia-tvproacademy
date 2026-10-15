import { Readable } from 'node:stream'
import { NextResponse, type NextRequest } from 'next/server'
import { TIPOS_POR_EXT, fileInfo, streamFile } from '@/lib/storage'

// Archivos públicos del sitio (volumen de Coolify). Nombres con UUID: inmutables, se cachean un año.
// Soporta Range para que el video se pueda adelantar (Safari/iOS lo exige).
export async function GET(req: NextRequest, { params }: { params: Promise<{ ruta: string[] }> }) {
  const { ruta } = await params
  const ext = (ruta.at(-1) ?? '').split('.').pop()?.toLowerCase() ?? ''
  const tipo = TIPOS_POR_EXT[ext]
  const info = tipo ? await fileInfo(ruta.join('/')) : null
  if (!tipo || !info) return new NextResponse('No encontrado', { status: 404 })

  const headers: Record<string, string> = {
    'Content-Type': tipo,
    'Accept-Ranges': 'bytes',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'public, max-age=31536000, immutable',
  }
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('range') ?? '')
  if (m && (m[1] || m[2])) {
    const start = m[1] ? Number(m[1]) : Math.max(info.size - Number(m[2]), 0)
    const end = m[1] && m[2] ? Math.min(Number(m[2]), info.size - 1) : info.size - 1
    if (start > end || start >= info.size) {
      return new NextResponse(null, { status: 416, headers: { 'Content-Range': `bytes */${info.size}` } })
    }
    return new NextResponse(Readable.toWeb(streamFile(info.abs, { start, end })) as ReadableStream, {
      status: 206,
      headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${info.size}`, 'Content-Length': String(end - start + 1) },
    })
  }
  return new NextResponse(Readable.toWeb(streamFile(info.abs)) as ReadableStream, {
    headers: { ...headers, 'Content-Length': String(info.size) },
  })
}
