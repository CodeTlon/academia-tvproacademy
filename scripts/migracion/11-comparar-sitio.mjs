#!/usr/bin/env node
// Compara lo que VE un visitante en el sitio actual (Vercel) y en el nuevo (Coolify): texto visible, imágenes (alt + nombre de archivo)
// y enlaces de cada página pública. Las imágenes de Supabase y las de /media se comparan por nombre de archivo.
// Uso: node 11-comparar-sitio.mjs <urlActual> <urlNueva> [rutas...]     (necesita Playwright y Chromium; PW_CHROMIUM_PATH opcional)
import { chromium } from 'playwright'
const [actual, nueva, ...resto] = process.argv.slice(2)
if (!actual || !nueva) { console.error('Uso: 11-comparar-sitio.mjs <urlActual> <urlNueva> [rutas...]'); process.exit(2) }
const rutas = resto.length ? resto : ['/', '/entrenamiento', '/nosotros', '/contacto', '/blog']
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_PATH || undefined })
// Mismo saneado que usa 05-copiar-storage.mjs al renombrar (espacios, paréntesis, acentos): el renombre es intencional.
const limpio = (seg) => seg.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[^A-Za-z0-9]+/, '').replace(/-+(\.[^.]+)$/, '$1')
const nombre = (u) => { try { const x = new URL(u, 'http://x'); const raw = x.searchParams.get('url') ?? x.pathname; return limpio(decodeURIComponent(decodeURIComponent(raw)).split('/').pop()) } catch { return u } }
async function leer(base, ruta) {
  const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage()
  const r = await p.goto(base + ruta, { waitUntil: 'networkidle' })
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((s) => setTimeout(s, 150)) } })
  await p.waitForTimeout(800)
  const d = await p.evaluate(() => ({
    texto: document.body.innerText.replace(/\s+/g, ' ').trim(),
    imgs: [...document.images].map((i) => [i.alt, i.currentSrc || i.src]),
    links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => h && !h.startsWith('#')),
    titulo: document.title,
  }))
  await p.context().close()
  return { status: r.status(), ...d, imgs: d.imgs.map(([a, s]) => `${a}|${nombre(s)}`).sort(), links: [...new Set(d.links.map((h) => h.replace(base, '')))].sort() }
}
let dif = 0
for (const ruta of rutas) {
  const [a, n] = [await leer(actual, ruta), await leer(nueva, ruta)]
  const problemas = []
  if (a.status !== n.status) problemas.push(`status ${a.status} vs ${n.status}`)
  if (a.titulo !== n.titulo) problemas.push('título')
  if (a.texto !== n.texto) { const i = [...a.texto].findIndex((c, k) => c !== n.texto[k]); problemas.push(`texto visible difiere (primer cambio en el carácter ${i}: «${a.texto.slice(Math.max(0, i - 25), i + 40)}» vs «${n.texto.slice(Math.max(0, i - 25), i + 40)}»)`) }
  if (JSON.stringify(a.imgs) !== JSON.stringify(n.imgs)) problemas.push(`imágenes: ${a.imgs.length} vs ${n.imgs.length}; solo en actual: ${a.imgs.filter((x) => !n.imgs.includes(x)).slice(0, 4).join(' ; ') || '-'}; solo en nueva: ${n.imgs.filter((x) => !a.imgs.includes(x)).slice(0, 4).join(' ; ') || '-'}`)
  if (JSON.stringify(a.links) !== JSON.stringify(n.links)) problemas.push(`enlaces difieren (solo en actual: ${a.links.filter((x) => !n.links.includes(x)).slice(0, 4).join(', ') || '-'}; solo en nueva: ${n.links.filter((x) => !a.links.includes(x)).slice(0, 4).join(', ') || '-'})`)
  if (problemas.length) { dif++; console.log(`DIFF ${ruta}\n     ${problemas.join('\n     ')}`) } else console.log(`ok   ${ruta}  (${a.texto.length} caracteres, ${a.imgs.length} imágenes, ${a.links.length} enlaces)`)
}
await b.close()
console.log(dif ? `\n${dif} página(s) con diferencias` : '\nSITIO IDÉNTICO en las páginas comparadas')
process.exit(dif ? 1 : 0)
