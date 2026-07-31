'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { friendlyError } from '@/lib/friendly-error'
import { requireUser } from './auth'
import type { SiteSettingsKey } from '@/lib/site-settings'

export type SettingsState = { success?: boolean; error?: string } | undefined

/**
 * Los campos de lista (StringList/ListField) mandan su valor como un string
 * JSON (`[...]`) en un único input; el resto son texto plano.
 */
function parseFieldValue(raw: string): unknown {
  const trimmed = raw.trim()
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed)
    } catch {
      // no era JSON después de todo, se guarda como texto
    }
  }
  return raw
}

/**
 * Upsert genérico de una clave en site_settings. `key` se pasa vía
 * `.bind(null, key)` desde cada *Form.tsx — arma el `value` a partir de TODOS
 * los campos del FormData recibido, así que un form nuevo nunca necesita
 * tocar esta función.
 */
export async function updateSiteSettings(
  key: SiteSettingsKey,
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  try {
    await requireUser()

    // Las settings "lista pura" (services, facilities, process, schedule) usan
    // un único ListField/StringList — su value en DB es el array tal cual, no
    // { fieldName: [...] }, para calzar 1:1 con el fallback de siteConfig (ver
    // FALLBACK en lib/site-settings.ts). Las settings "objeto" (business, hero,
    // about) mandan 2+ campos y se arman como objeto.
    // Los campos "$ACTION_*"/"$ACTION_KEY" los inyecta React al usar una server
    // action bindeada (.bind(null, key)) como action de un <form> — codifican
    // el argumento bindeado para que el form funcione sin JS. Si no se filtran
    // acá, se cuentan como campos "reales" y una setting de lista pura (1 solo
    // campo real) termina guardada como { fieldName: [...], $ACTION_*: ... }
    // en vez del array — la página pública que espera un array explota con
    // "X.map is not a function".
    const entries = [...formData.entries()]
      .filter((e): e is [string, string] => typeof e[1] === 'string')
      .filter(([field]) => !field.startsWith('$ACTION'))
    const value: unknown =
      entries.length === 1
        ? parseFieldValue(entries[0][1])
        : Object.fromEntries(entries.map(([field, raw]) => [field, parseFieldValue(raw)]))

    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) return { error: friendlyError(error, 'No se pudo guardar. Intentá de nuevo.') }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e, 'No se pudo guardar. Intentá de nuevo.') }
  }
}
