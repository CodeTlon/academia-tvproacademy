import { createSupabaseBrowserClient } from './supabase'
import { extractStoragePath } from './storage'

/**
 * Sube directo al bucket desde el navegador (no vía Server Action) — para
 * video, el body de una Server Action en Vercel se corta en ~4.5MB, muy por
 * debajo de un MP4 real. El browser client comparte la cookie de sesión con
 * createSupabaseServerClient(), así que la policy "Authenticated can upload
 * media" (to authenticated) aplica igual.
 */
export async function uploadDirectToStorage(file: File, folder: string): Promise<{ url?: string; error?: string }> {
  const supabase = createSupabaseBrowserClient()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${folder}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('media').upload(path, file, { contentType: file.type, upsert: false })
  if (error) return { error: error.message }
  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return { url: data.publicUrl }
}

export async function deleteFromStorage(url: string) {
  const path = extractStoragePath(url)
  if (!path) return
  const supabase = createSupabaseBrowserClient()
  await supabase.storage.from('media').remove([path])
}
