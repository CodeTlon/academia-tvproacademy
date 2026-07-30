'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { Node, mergeAttributes } from '@tiptap/core'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TipTapImage from '@tiptap/extension-image'
import TipTapLink from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import { createPostAction, updatePostAction, type PostState } from '@/actions/posts'
import { uploadImageAction } from '@/actions/media'
import { uploadDirectToStorage } from '@/lib/client-upload'
import { MAX_INLINE_VIDEO_BYTES } from '@/lib/upload-limits'
import { TextField, TextArea, Checkbox, ImageUpload } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import {
  Bold, Italic, Heading2, List, ListOrdered, Link as LinkIcon, Quote,
  Image as ImageIcon, Youtube as YoutubeIcon, Video as VideoIcon, Loader2, X,
} from 'lucide-react'

// TipTap no trae un nodo para <video> nativo (solo @tiptap/extension-youtube).
const InlineVideo = Node.create({
  name: 'inlineVideo',
  group: 'block',
  atom: true,
  addAttributes() {
    return { src: { default: null } }
  },
  parseHTML() {
    return [{ tag: 'video' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, { controls: 'true', style: 'max-width:100%;border-radius:8px' })]
  },
})

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  category: string | null
  published: boolean
}

export default function PostForm({ post }: { post?: Post }) {
  const isEdit = !!post
  const action = isEdit ? updatePostAction.bind(null, post.id) : createPostAction
  const [state, formAction] = useFormState<PostState, FormData>(action, undefined)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TipTapImage,
      InlineVideo,
      TipTapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Escribí el contenido del artículo…' }),
      Youtube.configure({ controls: true }),
    ],
    content: post?.content ?? '',
    immediatelyRender: false,
  })

  return (
    <form
      action={(formData) => {
        formData.set('content', editor?.getHTML() ?? '')
        formAction(formData)
      }}
      className="space-y-6 max-w-3xl"
    >
      {state?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{state.error}</div>
      )}

      <TextField
        label="Título"
        name="title"
        defaultValue={post?.title}
        required
        placeholder="Footwork: cómo ganar agilidad en espacios reducidos"
        hint="El slug (URL) se genera automáticamente desde el título."
      />

      <TextField label="Categoría" name="category" defaultValue={post?.category ?? ''} placeholder="Technique" />

      <ImageUpload
        label="Imagen de portada"
        name="cover_image"
        defaultValue={post?.cover_image}
        folder="blog"
        hint="Se muestra en el listado del blog y arriba del artículo."
      />

      <TextArea
        label="Resumen / extracto"
        name="excerpt"
        defaultValue={post?.excerpt ?? ''}
        rows={2}
        placeholder="Los ejercicios de pies que usamos en TVPRO para ganar velocidad de reacción."
        hint="Aparece en el listado del blog."
      />

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Contenido</label>
        <ContentEditor editor={editor} />
      </div>

      <Checkbox label="Publicado (visible en el blog público)" name="published" defaultChecked={post?.published ?? false} />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}

function ToolbarBtn({
  onClick, active, title, children, disabled,
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode; disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded transition-colors disabled:opacity-40 ${active ? 'bg-gold/20 text-gold-dark' : 'text-zinc-500 hover:text-zinc-900'}`}
    >
      {children}
    </button>
  )
}

function ContentEditor({ editor }: { editor: Editor | null }) {
  const [busyImage, setBusyImage] = useState(false)
  const [busyVideo, setBusyVideo] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [showYt, setShowYt] = useState(false)
  const [ytInput, setYtInput] = useState('')

  function addLink() {
    const url = window.prompt('URL del link:')
    if (!url) return
    if (editor?.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run()
    } else {
      editor?.chain().focus().setLink({ href: url }).run()
    }
  }

  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusyImage(true)
    setErr(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'blog/content')
    const res = await uploadImageAction(fd)
    setBusyImage(false)
    if (res.error) { setErr(res.error); e.target.value = ''; return }
    if (res.url) {
      editor?.chain().focus().setImage({ src: res.url, alt: '' }).run()
      editor?.commands.createParagraphNear()
    }
    e.target.value = ''
  }

  async function pickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_INLINE_VIDEO_BYTES) {
      setErr(`El video no puede superar ${Math.round(MAX_INLINE_VIDEO_BYTES / (1024 * 1024))}MB.`)
      e.target.value = ''
      return
    }
    setBusyVideo(true)
    setErr(null)
    const { url, error } = await uploadDirectToStorage(file, 'blog/content')
    setBusyVideo(false)
    if (error) { setErr(error); e.target.value = ''; return }
    if (url) {
      editor?.chain().focus().insertContent({ type: 'inlineVideo', attrs: { src: url } }).run()
      editor?.commands.createParagraphNear()
    }
    e.target.value = ''
  }

  function insertYoutube() {
    const src = ytInput.trim()
    if (!src) return
    editor?.commands.setYoutubeVideo({ src })
    setYtInput('')
    setShowYt(false)
    setErr(null)
  }

  return (
    <div>
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 rounded-t-md border border-zinc-200 border-b-0 bg-zinc-50">
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Negrita">
          <Bold size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Cursiva">
          <Italic size={15} />
        </ToolbarBtn>
        <div className="w-px h-4 bg-zinc-200 mx-1" />
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="Título H2">
          <Heading2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Cita">
          <Quote size={15} />
        </ToolbarBtn>
        <div className="w-px h-4 bg-zinc-200 mx-1" />
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Lista con viñetas">
          <List size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Lista numerada">
          <ListOrdered size={15} />
        </ToolbarBtn>
        <div className="w-px h-4 bg-zinc-200 mx-1" />
        <ToolbarBtn onClick={addLink} active={editor?.isActive('link')} title="Insertar link">
          <LinkIcon size={15} />
        </ToolbarBtn>

        <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold cursor-pointer text-zinc-500 hover:text-zinc-900" title="Subir e insertar imagen">
          {busyImage ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
          <input type="file" accept="image/*" onChange={pickImage} disabled={busyImage} className="hidden" />
        </label>

        <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold cursor-pointer text-zinc-500 hover:text-zinc-900" title={`Subir video propio (máx. ${Math.round(MAX_INLINE_VIDEO_BYTES / (1024 * 1024))}MB)`}>
          {busyVideo ? <Loader2 size={14} className="animate-spin" /> : <VideoIcon size={14} />}
          <input type="file" accept="video/mp4" onChange={pickVideo} disabled={busyVideo} className="hidden" />
        </label>

        <ToolbarBtn onClick={() => { setShowYt(!showYt); setErr(null) }} active={showYt} title="Insertar video de YouTube">
          <YoutubeIcon size={15} />
        </ToolbarBtn>

        {err && <span className="text-xs text-red-500 ml-2">{err}</span>}
      </div>

      {showYt && (
        <div className="flex gap-2 px-2 py-2 border border-zinc-200 border-b-0 bg-zinc-50">
          <input
            type="text"
            value={ytInput}
            onChange={(e) => setYtInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), insertYoutube())}
            placeholder="Pegá el link de YouTube…"
            className="flex-1 bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            autoFocus
          />
          <button type="button" onClick={insertYoutube} className="px-3 py-1.5 rounded-md text-xs font-bold bg-gold text-on-gold flex-shrink-0">
            Insertar
          </button>
          <button type="button" onClick={() => { setShowYt(false); setYtInput('') }} className="px-2 py-1.5 rounded-md text-zinc-400 hover:text-zinc-700 border border-zinc-200 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="border border-zinc-200 rounded-b-md px-3 py-2.5 min-h-[240px] text-sm text-zinc-900 [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-zinc-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
      />
    </div>
  )
}
