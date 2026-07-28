import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
  return createClient(url, key)
}

/**
 * Cliente Supabase para Client Components — comparte la cookie de sesión con
 * createSupabaseServerClient() (@supabase/ssr). Se usa para subir archivos
 * grandes (video/PDF) directo al bucket `media` desde el navegador, sin pasar
 * por un Server Action: Vercel cappea el body de cualquier función serverless
 * a 4.5MB (no se puede overridear desde next.config.js), así que un archivo
 * real terminaría fallando ahí, no en los límites propios de la app.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
  return createBrowserClient(url, key)
}

export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder'
  return createClient(url, key)
}
