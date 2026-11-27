import sanitizeHtml from 'sanitize-html'

/**
 * Sanitiza el HTML que produce el editor Tiptap del blog (PostForm.tsx) antes de guardarlo
 * y de nuevo antes de renderizarlo (doble capa — server action + página pública). Sin esto,
 * `post.content` se vuelca directo con `dangerouslySetInnerHTML` en blog/[slug]/page.tsx: XSS
 * almacenado servido a cualquier visitante del blog.
 *
 * Whitelist armada a mano en base a lo que el editor puede generar (ver PostForm.tsx):
 * - @tiptap/starter-kit: párrafos, marcas de texto, headings, listas, blockquote, code, hr.
 * - @tiptap/extension-image: <img src alt title>.
 * - @tiptap/extension-link: <a href target rel>.
 * - @tiptap/extension-youtube: <div data-youtube-video><iframe src width height …></div>.
 * - Nodo custom `InlineVideo` (PostForm.tsx): <video controls style src>.
 *
 * Usa `sanitize-html` (htmlparser2, sin DOM). Antes era `isomorphic-dompurify`, pero su jsdom
 * no cargaba en las funciones de Vercel y cualquier página del blog daba 500.
 *
 * `iframe` no está en el set por defecto (a propósito, es el vector de XSS/
 * clickjacking más directo) — se habilita acá solo para esto, y el hook de abajo lo borra
 * si el `src` no apunta a youtube.com/youtube-nocookie.com, para que no sirva de forma
 * genérica para embeber cualquier URL.
 */

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 's', 'del', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'hr',
  'a', 'img', 'video', 'iframe', 'div',
]

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions['allowedAttributes'] = {
  a: ['href', 'target', 'rel', 'title'],
  img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
  video: ['src', 'controls', 'style', 'title', 'width', 'height'],
  iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'loading'],
  div: ['data-youtube-video'],
}

const YOUTUBE_IFRAME_SRC = /^https:\/\/(www\.)?(youtube(-nocookie)?\.com)\/embed\//

export function sanitizePostContent(html: string): string {
  if (!html) return ''
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    // Un iframe que no sea un embed de YouTube se borra entero (no solo su src).
    exclusiveFilter: (frame) =>
      frame.tag === 'iframe' && !YOUTUBE_IFRAME_SRC.test(frame.attribs.src ?? ''),
  })
}
