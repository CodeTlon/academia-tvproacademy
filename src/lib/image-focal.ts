/**
 * Codificación de "focal point" y zoom dentro del fragmento de una URL de imagen.
 *
 *     https://.../foo.webp#focal=50,30&scale=1.2
 *
 * Permite que el admin elija qué zona de la imagen mostrar (object-position)
 * y cuánto recortar (transform: scale) sin agregar columnas en cada tabla.
 * Los fragmentos no viajan por HTTP, así que la URL sigue siendo válida para
 * el optimizador de Next/Image.
 */

import type { CSSProperties } from 'react'

export interface ImageFocal {
  src: string
  position: string
  scale: number
}

const DEFAULT_POSITION = '50% 50%'
const DEFAULT_SCALE = 1

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function parseFocal(url: string | null | undefined): ImageFocal {
  if (!url) return { src: '', position: DEFAULT_POSITION, scale: DEFAULT_SCALE }
  const hashIdx = url.indexOf('#')
  if (hashIdx < 0) return { src: url, position: DEFAULT_POSITION, scale: DEFAULT_SCALE }

  const src = url.slice(0, hashIdx)
  const params = new URLSearchParams(url.slice(hashIdx + 1))

  let position = DEFAULT_POSITION
  const focal = params.get('focal')
  if (focal) {
    const [xs, ys] = focal.split(',')
    const x = Number(xs)
    const y = Number(ys)
    if (!Number.isNaN(x) && !Number.isNaN(y)) {
      position = `${clamp(x, 0, 100)}% ${clamp(y, 0, 100)}%`
    }
  }

  const scaleParam = params.get('scale')
  const scale = scaleParam ? clamp(Number(scaleParam) || 1, 1, 3) : DEFAULT_SCALE

  return { src, position, scale }
}

export function encodeFocal(src: string, position: string, scale: number): string {
  if (!src) return ''
  const [xs = '50%', ys = '50%'] = position.split(' ')
  const x = Math.round(parseFloat(xs))
  const y = Math.round(parseFloat(ys))
  const s = clamp(scale, 1, 3)

  const params = new URLSearchParams()
  if (!(x === 50 && y === 50)) params.set('focal', `${x},${y}`)
  if (s !== 1) params.set('scale', String(Number(s.toFixed(2))))

  const base = src.split('#')[0] ?? src
  const query = params.toString()
  return query ? `${base}#${query}` : base
}

/**
 * Devuelve `src` (sin fragment) y un `style` listo para mergear en un
 * <Image fill> o <img>. Aplica object-position y, si scale > 1, también
 * transform: scale + transform-origin centrado en el focal.
 */
export function focalImageProps(url: string | null | undefined): {
  src: string
  style: CSSProperties
} {
  const { src, position, scale } = parseFocal(url)
  const style: CSSProperties = { objectPosition: position }
  if (scale > 1) {
    style.transform = `scale(${scale})`
    style.transformOrigin = position
  }
  return { src, style }
}
