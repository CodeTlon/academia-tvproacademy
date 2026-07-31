'use client'

import { useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { parseFocal, encodeFocal } from '@/lib/image-focal'

/**
 * Picker visual para elegir el "focal point" + zoom de una imagen.
 * Trabaja sobre URLs con fragmento (ver `lib/image-focal.ts`).
 *
 *   value: URL con o sin fragment (`#focal=X,Y&scale=N`).
 *   onChange: recibe la URL ya codificada con el nuevo fragment.
 */
export default function FocalPicker({
  value,
  onChange,
  previewAspect = '16 / 9',
  previewWidth = 220,
}: {
  value?: string
  onChange: (url: string) => void
  previewAspect?: string
  previewWidth?: number
}) {
  const { src, position, scale } = parseFocal(value)
  const previewRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  if (!src) return null

  const [xs, ys] = position.split(' ')
  const x = parseFloat(xs)
  const y = parseFloat(ys)

  function setPosition(clientX: number, clientY: number) {
    const el = previewRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = ((clientX - rect.left) / rect.width) * 100
    const py = ((clientY - rect.top) / rect.height) * 100
    const cx = Math.max(0, Math.min(100, px))
    const cy = Math.max(0, Math.min(100, py))
    onChange(encodeFocal(src, `${cx}% ${cy}%`, scale))
  }

  function setScale(s: number) {
    onChange(encodeFocal(src, position, s))
  }

  function reset() {
    onChange(encodeFocal(src, '50% 50%', 1))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4 flex-wrap">
        <div
          ref={previewRef}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setDragging(true)
            setPosition(e.clientX, e.clientY)
          }}
          onPointerMove={(e) => {
            if (dragging) setPosition(e.clientX, e.clientY)
          }}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture(e.pointerId)
            setDragging(false)
          }}
          onPointerCancel={() => setDragging(false)}
          className="relative rounded-md overflow-hidden cursor-crosshair select-none flex-shrink-0 bg-zinc-100 border border-zinc-200"
          style={{
            width: '100%',
            maxWidth: `${previewWidth}px`,
            aspectRatio: previewAspect,
            touchAction: 'none',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
            style={{
              objectPosition: position,
              transform: scale > 1 ? `scale(${scale})` : undefined,
              transformOrigin: scale > 1 ? position : undefined,
            }}
          />
          {/* Punto que indica la posición */}
          <span
            className="absolute pointer-events-none rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: '16px',
              height: '16px',
              transform: 'translate(-50%, -50%)',
              background: '#f5bf00',
              boxShadow: '0 0 0 2px rgba(0,0,0,0.6), 0 0 10px rgba(245,191,0,0.7)',
            }}
          />
          {/* Mira (cross-hair) */}
          <span
            className="absolute pointer-events-none"
            style={{ left: `${x}%`, top: 0, bottom: 0, width: '1px', background: 'rgba(245,191,0,0.35)' }}
          />
          <span
            className="absolute pointer-events-none"
            style={{ top: `${y}%`, left: 0, right: 0, height: '1px', background: 'rgba(245,191,0,0.35)' }}
          />
        </div>

        <div className="flex-1 min-w-[200px] space-y-3">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Zoom <span className="text-zinc-400 font-normal normal-case">({scale.toFixed(2)}×)</span>
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full accent-gold"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>1×</span>
              <span>2×</span>
              <span>3×</span>
            </div>
          </div>
          <div>
            <p className="text-zinc-500 text-xs leading-snug mb-2">
              <strong className="text-zinc-700">Click o arrastrá</strong> sobre la imagen para mover el foco.
              Subí el zoom para recortar más cerca de ese punto.
            </p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <RotateCcw size={12} /> Restablecer
            </button>
          </div>
          <p className="text-zinc-400 text-[11px] font-mono">
            focal: {Math.round(x)}%, {Math.round(y)}%
          </p>
        </div>
      </div>
    </div>
  )
}
