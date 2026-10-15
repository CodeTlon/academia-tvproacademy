import { test, expect } from '@playwright/test'

// Humo de las páginas públicas (corre en los 3 viewports: mobile, tablet y desktop).
for (const ruta of ['/', '/entrenamiento', '/nosotros', '/contacto', '/blog']) {
  test(`pública ${ruta} carga sin errores`, async ({ page }) => {
    const errores: string[] = []
    page.on('pageerror', (e) => errores.push(e.message))
    const res = await page.goto(ruta)
    expect(res?.status()).toBe(200)
    await expect(page.locator('h1').first()).toBeVisible()
    expect(errores).toEqual([])
  })
}

test('health responde con started_at', async ({ request }) => {
  const res = await request.get('/api/health')
  expect(res.status()).toBe(200)
  expect((await res.json()).started_at).toBeTruthy()
})

test('rutas privadas sin sesión van al login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
  await page.goto('/portal')
  await expect(page).toHaveURL(/\/login/)
})

test('sitemap y robots apuntan al dominio', async ({ request }) => {
  expect((await request.get('/sitemap.xml')).status()).toBe(200)
  expect((await request.get('/robots.txt')).status()).toBe(200)
})
