'use client'

import { waLink } from '@/lib/utils'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'

/** Barra fija bottom, solo mobile: CTA directo a WhatsApp para reservar turno. */
export default function StickyMobileCTA({ whatsapp, businessName }: { whatsapp: string; businessName: string }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#071424]/95 backdrop-blur-xl px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <a
        href={waLink(whatsapp, `Hola! Quiero reservar un turno en ${businessName}`)}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#f5bf00] text-[#241a00] font-bold uppercase tracking-wide text-sm px-6 py-3 rounded-full shadow-[0_0_20px_rgba(245,191,0,0.4)] transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071424]"
      >
        <WhatsAppIcon size={18} />
        Reservá tu turno
      </a>
    </div>
  )
}
