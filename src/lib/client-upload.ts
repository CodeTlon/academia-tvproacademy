/**
 * Sube un archivo al servidor (volumen de Coolify) con un POST directo a /api/upload, sin pasar por un
 * Server Action: el límite de body de las acciones (20MB) es menor que el de video/PDF en upload-limits.ts.
 * Solo funciona con sesión del dashboard.
 */
export async function uploadDirectToStorage(
  file: File,
  folder: string,
): Promise<{ url?: string; error?: string }> {
  const contentType = file.type || 'application/octet-stream'
  const res = await fetch(`/api/upload?folder=${encodeURIComponent(folder)}`, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: file,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { error: data.error ?? 'Falló la subida del archivo.' }
  return { url: data.url }
}

/** Borra un archivo propio (/media/...) del volumen. Solo admin; ignora URLs externas. */
export async function deleteFromStorage(url: string): Promise<void> {
  const { deleteMediaAction } = await import('@/actions/media')
  await deleteMediaAction(url)
}
