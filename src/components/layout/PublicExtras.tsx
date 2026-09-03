import { getSiteSettings } from '@/lib/site-settings'
import BackToTop from '@/components/ui/BackToTop'
import StickyMobileCTA from '@/components/ui/StickyMobileCTA'

/** Wrapper server-side para los widgets flotantes de las páginas públicas
 * (BackToTop + StickyMobileCTA). No se monta en /dashboard, /portal ni /login
 * — cada page.tsx público lo agrega junto a <Navbar/>/<Footer/>, mismo patrón
 * de composición manual que ya usa el resto del sitio. Deja un espacio extra
 * en mobile (pb-20) para que la barra fija no tape el contenido final. */
export default async function PublicExtras() {
  const { business } = await getSiteSettings()

  return (
    <>
      <div className="md:hidden h-20" aria-hidden="true" />
      <BackToTop />
      <StickyMobileCTA whatsapp={business.whatsapp} businessName={business.name} />
    </>
  )
}
