'use client'

import { useEffect, useState } from 'react'
import { Share2, Check, Link2 } from 'lucide-react'

/** Web Share API con fallback a copiar el link. Usado en posts del blog. */
export default function ShareButton({ title, className = '' }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  // navigator no existe en SSR: se resuelve en el cliente para no romper el render inicial.
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && navigator.share !== undefined)
  }, [])

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        /* usuario canceló el share sheet — no hacemos nada */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard no disponible — no rompemos la UI */
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071424] ${className}`}
      style={{ borderColor: 'var(--brand-border)', color: 'var(--brand-text)' }}
      aria-label={copied ? 'Link copiado' : 'Compartir artículo'}
    >
      {copied ? <Check size={16} className="text-[#f5bf00]" /> : canShare ? <Share2 size={16} /> : <Link2 size={16} />}
      {copied ? 'Link copiado' : 'Compartir'}
    </button>
  )
}
