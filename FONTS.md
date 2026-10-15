# Fuentes

Las fuentes están **en el repo** (`src/app/fonts/`, archivos `woff2` del subset latin) y se cargan con `next/font/local`. El build no depende de Google Fonts: `next/font/google` baja las fuentes en cada build y fallaba de forma intermitente en CI y en el build de la imagen Docker (gate 14 del estándar de la fábrica). El CI falla si vuelve a aparecer `next/font/google`.

- **En uso:** las diez familias que ofrece el dashboard como tipografía del sitio: Inter, Playfair Display, Montserrat, Open Sans, Raleway, Oswald y Nunito (variables); Roboto, Lato y Poppins (estáticas: 400/700, 400/700 y 400/600/700). Declaradas en `src/app/layout.tsx`; la activa hoy es Montserrat (`site-config.ts`).
- **Origen:** paquetes `@fontsource` / `@fontsource-variable` de npm, que redistribuyen las fuentes de Google Fonts.
- **Licencia:** SIL Open Font License 1.1 (uso comercial y redistribución permitidos).

## Cómo agregar o cambiar una fuente
1. Fuera del repo: `npm pack @fontsource-variable/<familia>` (o `@fontsource/<familia>`) y desempacar el `.tgz`.
2. Copiar a `src/app/fonts/` solo el `woff2` latin (`<familia>-latin-wght-normal.woff2` o `<familia>-latin-<peso>-normal.woff2`).
3. Declararla con `localFont` en `layout.tsx` con el mismo `variable` CSS y sumarla a `FONT_MAP`.
