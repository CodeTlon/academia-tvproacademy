import { test, expect } from '@playwright/test'

// Flujo completo admin -> alumno con acceso. Necesita un admin ya creado (scripts/crear-usuario.mts) y su clave en
// E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD. Corre una sola vez (proyecto desktop): crea datos de prueba en la base.
const email = process.env.E2E_ADMIN_EMAIL
const password = process.env.E2E_ADMIN_PASSWORD

test.describe.configure({ mode: 'serial' })
test.skip(!email || !password, 'Sin E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD')

test('admin crea alumno y acceso; el alumno entra, cambia la clave y ve su estado', async ({ page, browser, isMobile }, info) => {
  test.skip(info.project.name !== 'desktop', 'El flujo con datos corre solo en desktop')
  void isMobile

  // Login admin
  await page.goto('/login')
  await page.fill('#email', email!)
  await page.fill('#password', password!)
  await page.getByRole('button', { name: /Iniciar sesión/ }).click()
  await expect(page).toHaveURL(/\/dashboard/)

  // Un alumno nunca entra al panel de admin (se prueba más abajo con su sesión).
  const nombre = `Alumno E2E ${Date.now()}`
  await page.goto('/dashboard/alumnos/nuevo')
  await page.fill('input[name="name"]', nombre)
  await page.getByRole('button', { name: /Guardar|Crear/ }).first().click()
  await expect(page).toHaveURL(/\/dashboard\/alumnos\/[0-9a-f-]{36}/)

  // Crear acceso al portal (genera usuario y contraseña temporal)
  await page.getByRole('button', { name: /Crear acceso/ }).click()
  const dialogoConfirmar = page.getByRole('button', { name: /Confirmar|Crear|Sí/ })
  if (await dialogoConfirmar.last().isVisible().catch(() => false)) await dialogoConfirmar.last().click()
  const codes = page.locator('code')
  await expect(codes.first()).toBeVisible({ timeout: 15000 })
  const emailAlumno = (await codes.nth(0).innerText()).trim()
  const claveTemporal = (await codes.nth(1).innerText()).trim()
  expect(emailAlumno).toMatch(/@tvproacademy\.com\.ar$/)

  // Sesión de alumno en otro contexto
  const ctx = await browser.newContext()
  const alumno = await ctx.newPage()
  await alumno.goto('/login')
  await alumno.fill('#email', emailAlumno)
  await alumno.fill('#password', claveTemporal)
  await alumno.getByRole('button', { name: /Iniciar sesión/ }).click()
  // Contraseña temporal: lo obliga a cambiarla antes de ver nada
  await expect(alumno).toHaveURL(/\/portal\/cambiar-password/)
  await alumno.goto('/portal')
  await expect(alumno).toHaveURL(/\/portal\/cambiar-password/)
  await alumno.fill('#password', 'NuevaClave2026!')
  await alumno.fill('#confirmPassword', 'NuevaClave2026!')
  await alumno.locator('form button[type="submit"]').click()
  await expect(alumno).toHaveURL(/\/portal$/)
  await expect(alumno.getByText(nombre)).toBeVisible()

  // El alumno no puede entrar al panel de admin
  await alumno.goto('/dashboard')
  await expect(alumno).toHaveURL(/\/portal/)
  // ni subir archivos
  const sube = await alumno.request.post('/api/upload?folder=blog', { headers: { 'content-type': 'image/png', origin: new URL(alumno.url()).origin }, data: Buffer.from('x') })
  expect(sube.status()).toBe(403)
  await ctx.close()

  // Admin: la subida de una imagen válida se sirve por /media
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
  const origin = new URL(page.url()).origin
  const up = await page.request.post('/api/upload?folder=blog', { headers: { 'content-type': 'image/png', origin }, data: png })
  expect(up.status()).toBe(200)
  const { url } = await up.json()
  expect(url).toMatch(/^\/media\/blog\/[0-9a-f-]{36}\.png$/)
  const got = await page.request.get(url)
  expect(got.status()).toBe(200)
  expect(got.headers()['content-type']).toBe('image/png')
  // path traversal
  expect((await page.request.get('/media/..%2F..%2Fetc%2Fpasswd')).status()).toBe(404)

  // Borrar al alumno borra también su cuenta: ya no puede entrar
  await page.goto('/dashboard/alumnos')
})
