import { cache } from 'react'
import { createSupabaseServerClient } from './supabase-server'
import { demoConfig } from './demo-config'

// El fallback se deriva 1:1 de demo-config.ts (no se retipean los campos a
// mano) para que nunca pueda divergir de lo que leen las páginas públicas:
// si no hay fila en `site_settings` para una key, se usa exactamente lo que
// ya se ve hoy en el sitio.
const FALLBACK = {
  business: demoConfig.business,
  hero: demoConfig.content.hero,
  about: demoConfig.content.about,
  services: demoConfig.content.services,
  facilities: demoConfig.content.facilities,
  process: demoConfig.content.process,
  schedule: demoConfig.content.schedule,
}

export type SiteSettingsKey = keyof typeof FALLBACK
export type SiteSettings = typeof FALLBACK
export type BusinessSettings = typeof demoConfig.business
export type HeroSettings = typeof demoConfig.content.hero
export type AboutSettings = typeof demoConfig.content.about
export type ServiceItem = (typeof demoConfig.content.services)[number]
export type ProcessStep = (typeof demoConfig.content.process)[number]
export type ScheduleSlot = (typeof demoConfig.content.schedule)[number]

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
