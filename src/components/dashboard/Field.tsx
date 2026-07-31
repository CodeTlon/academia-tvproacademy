'use client'

import { useEffect, useRef, useState } from 'react'
import { Trash2, Plus, Upload, Loader2, Image as ImageIcon, Video as VideoIcon } from 'lucide-react'
import { uploadImageAction, deleteMediaAction } from '@/actions/media'
import { uploadDirectToStorage, deleteFromStorage } from '@/lib/client-upload'
import { resizeImageFile } from '@/lib/client-image-resize'
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from '@/lib/upload-limits'
import { friendlyError } from '@/lib/friendly-error'
import FocalPicker from '@/components/dashboard/FocalPicker'

export const fieldLabel = 'block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5'
export const fieldInput =
  'w-full bg-white border border-zinc-200 rounded-md px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold-dark transition-colors'

export function TextField({
  label,
  name,
  defaultValue,
  type = 'text',
  hint,
  required,
  placeholder,
  maxLength,
}: {
  label: string
  name: string
  defaultValue?: string
  type?: string
  hint?: string
  required?: boolean
  placeholder?: string
  maxLength?: number
}) {
  return (
    <div>
      <label htmlFor={name} className={fieldLabel}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        className={fieldInput}
      />
      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  hint,
  placeholder,
}: {
  label: string
  name: string
  defaultValue?: string
  rows?: number
  hint?: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={name} className={fieldLabel}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className={`${fieldInput} resize-none`}
      />
      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

export function Checkbox({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string
  name: string
  defaultChecked?: boolean
  hint?: string
}) {
  return (
    <div>
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="w-4 h-4 rounded accent-gold" />
        <span className="text-sm font-bold text-zinc-700">{label}</span>
      </label>
      {hint && <p className="text-zinc-400 text-xs mt-1.5 ml-6">{hint}</p>}
    </div>
  )
}

// ─── ImageUpload — foto real (archivo) o URL manual ─────────────────────────
// Hidden input carga la URL final al form. `compact` = miniatura chica para
// usar dentro de una fila de ListField.

export function ImageUpload({
  label,
  name,
  defaultValue,
  folder = 'uploads',
  hint,
  compact,
  value,
  onChangeUrl,
  previewAspect = '16 / 9',
}: {
  label?: string
  /** Requerido en modo standalone (hidden input propio). Omitir en modo controlado (dentro de ListField). */
  name?: string
  defaultValue?: string | null
  folder?: string
  hint?: string
  compact?: boolean
  /** Modo controlado: si se pasan value/onChangeUrl, el padre maneja el valor y no se renderiza hidden input propio. */
  value?: string
  onChangeUrl?: (url: string) => void
  /** Aspect ratio del preview del selector de foco (ej: "16 / 9", "1 / 1"). */
  previewAspect?: string
}) {
  const controlled = onChangeUrl !== undefined
  const [internalUrl, setInternalUrl] = useState(defaultValue ?? '')
  // Valor real que viaja al form (modo standalone) — a diferencia del preview
  // (puede ser un blob: mientras se sube), esto nunca es un blob: local.
  const [committedUrl, setCommittedUrl] = useState(defaultValue ?? '')
  const url = controlled ? value ?? '' : internalUrl
  const setUrl = controlled ? onChangeUrl! : setInternalUrl
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current) }, [])

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (!picked) return
    if (picked.size > MAX_IMAGE_BYTES) {
      setErr(`La imagen no puede superar ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB.`)
      e.target.value = ''
      return
    }
    const previousUrl = url
    const preview = URL.createObjectURL(picked)
    objectUrlRef.current = preview
    setUrl(preview)
    setBusy(true)
    setErr(null)

    const file = await resizeImageFile(picked)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    let res: { url?: string; error?: string }
    try {
      res = await uploadImageAction(fd)
    } catch (uploadErr) {
      URL.revokeObjectURL(preview)
      setBusy(false)
      setErr(friendlyError(uploadErr, 'Error al subir la imagen. Intentá de nuevo.'))
      setUrl(previousUrl)
      e.target.value = ''
      return
    }
    URL.revokeObjectURL(preview)
    setBusy(false)
    if (res.error) {
      setErr(res.error)
      setUrl(previousUrl)
      e.target.value = ''
      return
    }
    if (res.url) {
      setUrl(res.url)
      if (!controlled) setCommittedUrl(res.url)
      if (previousUrl) deleteMediaAction(previousUrl)
    }
    e.target.value = ''
  }

  function handleUrlChange(newUrl: string) {
    setUrl(newUrl)
    if (!controlled) setCommittedUrl(newUrl)
  }

  return (
    <div>
      {label && <label className={fieldLabel}>{label}</label>}
      {!controlled && <input type="hidden" name={name} value={committedUrl} />}
      <div className={`flex gap-4 ${compact ? 'items-center' : 'items-start'}`}>
        <div
          className={`flex-shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center ${
            compact ? 'w-24 h-24' : 'w-40 h-40'
          }`}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={compact ? 24 : 32} className="text-zinc-300" />
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {!compact && (
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="URL de la imagen, o subí un archivo"
              className={fieldInput}
            />
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <label
              className={`inline-flex items-center gap-2 rounded-md font-bold cursor-pointer transition-colors bg-gold/10 text-gold-dark border border-gold/30 hover:bg-gold/20 ${
                compact ? 'px-2 py-1.5 text-[11px]' : 'px-3 py-2 text-xs'
              }`}
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {busy ? 'Subiendo…' : compact ? 'Subir' : 'Subir archivo'}
              <input type="file" accept="image/*" onChange={onPick} disabled={busy} className="hidden" />
            </label>
            {url && (
              <button
                type="button"
                onClick={() => {
                  deleteMediaAction(url)
                  handleUrlChange('')
                }}
                className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                Quitar
              </button>
            )}
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
        </div>
      </div>
      {url && !url.startsWith('blob:') && (
        <div className="mt-3 pt-3 border-t border-zinc-100">
          <FocalPicker value={url} onChange={handleUrlChange} previewAspect={previewAspect} previewWidth={compact ? 220 : 320} />
        </div>
      )}
      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

// ─── VideoUpload — sube un MP4 directo al bucket (bypass server action, ver
// client-upload.ts) o acepta una URL manual.

export function VideoUpload({
  label,
  name,
  defaultValue,
  folder = 'videos',
  hint,
}: {
  label?: string
  name: string
  defaultValue?: string | null
  folder?: string
  hint?: string
}) {
  const [url, setUrl] = useState(defaultValue ?? '')
  const [committedUrl, setCommittedUrl] = useState(defaultValue ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current) }, [])

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_VIDEO_BYTES) {
      setErr(`El video no puede superar ${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))} MB.`)
      e.target.value = ''
      return
    }
    const previousUrl = url
    const preview = URL.createObjectURL(file)
    objectUrlRef.current = preview
    setUrl(preview)
    setBusy(true)
    setErr(null)

    let res: { url?: string; error?: string }
    try {
      res = await uploadDirectToStorage(file, folder)
    } catch (uploadErr) {
      URL.revokeObjectURL(preview)
      setBusy(false)
      setErr(friendlyError(uploadErr, 'Error al subir el video. Intentá de nuevo.'))
      setUrl(previousUrl)
      e.target.value = ''
      return
    }
    URL.revokeObjectURL(preview)
    setBusy(false)
    if (res.error) {
      setErr(res.error)
      setUrl(previousUrl)
      e.target.value = ''
      return
    }
    if (res.url) {
      setUrl(res.url)
      setCommittedUrl(res.url)
      if (previousUrl) deleteFromStorage(previousUrl)
    }
    e.target.value = ''
  }

  return (
    <div>
      {label && <label className={fieldLabel}>{label}</label>}
      <input type="hidden" name={name} value={committedUrl} />
      <div className="flex flex-col gap-2">
        {url ? (
          <video src={url} className="w-full max-w-xs aspect-video rounded-lg border border-zinc-200 bg-zinc-900 object-cover" muted playsInline controls preload="metadata" />
        ) : (
          <div className="w-full max-w-xs aspect-video rounded-lg border border-dashed border-zinc-300 bg-zinc-50 flex flex-col items-center justify-center gap-1.5">
            <VideoIcon size={20} className="text-zinc-300" />
            <span className="text-xs text-zinc-400">Sin video</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold cursor-pointer transition-colors bg-gold/10 text-gold-dark border border-gold/30 hover:bg-gold/20">
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {busy ? 'Subiendo…' : 'Subir MP4'}
            <input type="file" accept="video/mp4" onChange={onPick} disabled={busy} className="hidden" />
          </label>
          {url && (
            <button
              type="button"
              onClick={() => {
                deleteFromStorage(url)
                setUrl('')
                setCommittedUrl('')
              }}
              className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              Quitar
            </button>
          )}
        </div>
        {err && <p className="text-xs text-red-500">{err}</p>}
      </div>
      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

// ─── StringList — lista editable de strings (ej: bullets, facilities) ───────
// Serializa como JSON en un input hidden.

export function StringList({
  label,
  name,
  defaultValue,
  placeholder,
  hint,
}: {
  label: string
  name: string
  defaultValue?: string[]
  placeholder?: string
  hint?: string
}) {
  const [items, setItems] = useState<string[]>(defaultValue?.length ? defaultValue : [''])

  return (
    <div>
      <label className={fieldLabel}>{label}</label>
      <input type="hidden" name={name} value={JSON.stringify(items.filter((s) => s.trim()))} />
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={it}
              onChange={(e) => {
                const copy = [...items]
                copy[i] = e.target.value
                setItems(copy)
              }}
              placeholder={placeholder}
              className={fieldInput}
            />
            <button
              type="button"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="px-3 rounded-md text-zinc-400 hover:text-red-500 border border-zinc-200 transition-colors"
              aria-label="Quitar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems([...items, ''])}
        className="mt-2 inline-flex items-center gap-2 text-xs text-gold-dark hover:text-zinc-900 transition-colors font-bold"
      >
        <Plus size={14} /> Agregar
      </button>
      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

// ─── ListField — lista editable de objetos con forma fija (ej: services,
// process, schedule, values). Serializa como JSON en un input hidden. Un solo
// componente genérico en vez de un *List a medida por sección.

export type ListFieldSpec = { name: string; placeholder: string; type?: 'text' | 'textarea' | 'image'; folder?: string }

export function ListField({
  label,
  name,
  fields,
  defaultValue,
  hint,
  addLabel = 'Agregar',
}: {
  label: string
  name: string
  fields: ListFieldSpec[]
  defaultValue?: Record<string, string>[]
  hint?: string
  addLabel?: string
}) {
  const empty = () => Object.fromEntries(fields.map((f) => [f.name, '']))
  const [items, setItems] = useState<Record<string, string>[]>(
    defaultValue?.length ? defaultValue : [empty()],
  )

  const serialized = items.filter((it) => fields.some((f) => (it[f.name] ?? '').trim()))

  return (
    <div>
      <label className={fieldLabel}>{label}</label>
      <input type="hidden" name={name} value={JSON.stringify(serialized)} />
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2 items-start bg-zinc-50 border border-zinc-200 rounded-md p-3">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fields.map((f) => {
                if (f.type === 'image') {
                  return (
                    <div key={f.name} className="sm:col-span-2">
                      <ImageUpload
                        compact
                        folder={f.folder ?? 'uploads'}
                        value={it[f.name] ?? ''}
                        onChangeUrl={(url) => {
                          const copy = [...items]
                          copy[i] = { ...copy[i], [f.name]: url }
                          setItems(copy)
                        }}
                      />
                    </div>
                  )
                }
                if (f.type === 'textarea') {
                  return (
                    <textarea
                      key={f.name}
                      value={it[f.name] ?? ''}
                      onChange={(e) => {
                        const copy = [...items]
                        copy[i] = { ...copy[i], [f.name]: e.target.value }
                        setItems(copy)
                      }}
                      placeholder={f.placeholder}
                      rows={2}
                      className={`${fieldInput} resize-none sm:col-span-2`}
                    />
                  )
                }
                return (
                  <input
                    key={f.name}
                    type="text"
                    value={it[f.name] ?? ''}
                    onChange={(e) => {
                      const copy = [...items]
                      copy[i] = { ...copy[i], [f.name]: e.target.value }
                      setItems(copy)
                    }}
                    placeholder={f.placeholder}
                    className={fieldInput}
                  />
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="mt-0.5 px-3 py-2.5 rounded-md text-zinc-400 hover:text-red-500 border border-zinc-200 bg-white transition-colors flex-shrink-0"
              aria-label="Quitar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems([...items, empty()])}
        className="mt-2 inline-flex items-center gap-2 text-xs text-gold-dark hover:text-zinc-900 transition-colors font-bold"
      >
        <Plus size={14} /> {addLabel}
      </button>
      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}
