export default function DashboardHomePage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Bienvenido al panel
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Administrá el contenido del sitio de TV Pro Academy.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <p className="text-sm text-zinc-500">
          Todavía no hay secciones de contenido cargadas. A medida que se sumen
          (contenido del sitio, blog, alumnos, agenda…) van a aparecer acá y en
          el menú lateral.
        </p>
      </div>
    </div>
  )
}
