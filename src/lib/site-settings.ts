import { cache } from 'react'
import { createSupabaseServerClient } from './supabase-server'
import { siteConfig } from './site-config'

// El fallback se deriva 1:1 de site-config.ts (no se retipean los campos a
// mano) para que nunca pueda divergir de lo que leen las páginas públicas:
// si no hay fila en `site_settings` para una key, se usa exactamente lo que
// ya se ve hoy en el sitio.
const FALLBACK = {
  business: siteConfig.business,
  hero: siteConfig.content.hero,
  about: { ...siteConfig.content.about, image: siteConfig.images.about },
  services: siteConfig.content.services,
  facilities: siteConfig.content.facilities,
  process: siteConfig.content.process,
  schedule: siteConfig.content.schedule,
}

export type SiteSettingsKey = keyof typeof FALLBACK
export type SiteSettings = typeof FALLBACK
export type BusinessSettings = typeof siteConfig.business
export type HeroSettings = typeof siteConfig.content.hero
export type AboutSettings = typeof FALLBACK.about
export type ServiceItem = (typeof siteConfig.content.services)[number]
export type ProcessStep = (typeof siteConfig.content.process)[number]
export type ScheduleSlot = (typeof siteConfig.content.schedule)[number]

/** Fetchea todas las filas de site_settings y las mergea sobre el fallback. Cacheado por request (React cache) para que las secciones que comparten página no dupliquen la query. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('site_settings').select('key, value')

  const result = { ...FALLBACK }
  for (const row of data ?? []) {
    if (row.key in result) {
      ;(result as Record<string, unknown>)[row.key] = row.value
    }
  }
  return result
})
