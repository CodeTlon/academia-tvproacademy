import DOMPurify from 'isomorphic-dompurify'

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
 * `iframe` no está en el set por defecto de DOMPurify (a propósito, es el vector de XSS/
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

const ALLOWED_ATTR = [
  'href', 'target', 'rel', // a
  'src', 'alt', 'title', // img / video / iframe
  'controls', 'style', // video
  'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'loading', // iframe
  'data-youtube-video', // div wrapper del embed de youtube
]

const YOUTUBE_IFRAME_SRC = /^https:\/\/(www\.)?(youtube(-nocookie)?\.com)\/embed\//

let hookInstalled = false

function ensureIframeDomainHook() {
  if (hookInstalled) return
  hookInstalled = true
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'IFRAME') {
      const src = node.getAttribute('src') ?? ''
      if (!YOUTUBE_IFRAME_SRC.test(src)) {
        node.remove()
      }
    }
  })
}

export function sanitizePostContent(html: string): string {
  if (!html) return ''
  ensureIframeDomainHook()
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  })
}
