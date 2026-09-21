# PROJECT.md

**FACT** — verificado en `src/lib/site-config.ts`, `supabase/migrations/002_posts.sql` (contenido
real del blog), y el dominio en producción `tvproacademy.com.ar`.

## Qué es

Sitio web + panel de administración + portal de alumnos para **TV Pro Academy**, una academia de
entrenamiento de fútbol en Córdoba, Argentina (Benito Soria esq. Belgrano, Barrio Vélez
Sarsfield). Tagline: "Entrenamiento específico para jugadores que buscan dar el salto de
calidad."

Nació como una instancia del "CodeTlon Demo Template" (de ahí el `name: "codetlon-demo-template"`
que todavía queda en `package.json`, y el `README.md` desactualizado — ver `KNOWN_ISSUES.md`)
y se convirtió en un proyecto real con lógica propia: dashboard de admin y portal de alumnos con
Supabase, que el template genérico no tiene.

## Para quién

- **Visitantes públicos** del sitio (`/`, `/nosotros`, `/entrenamiento`, `/blog`, `/contacto`):
  leads potenciales viendo la propuesta de la academia.
- **El admin de la academia** (`/dashboard`): gestiona el contenido público (hero, nosotros,
  servicios, instalaciones, metodología, blog) y el registro de alumnos (alta, asistencia,
  pagos, acceso al portal).
- **Los alumnos** (`/portal`): ven su propio estado de cuenta (clases tomadas del ciclo actual,
  si está al día o vencido, historial de pagos) — solo lectura, no pueden editar nada.

## Qué problema resuelve

El panel de alumnos (`/dashboard/alumnos`) **reemplaza un cuaderno físico** de asistencia y pagos:
antes de esto, la academia llevaba el control de qué alumno pagó, cuántas clases le quedan del
mes y desde cuándo, a mano. Ahora eso se calcula automáticamente a partir de dos registros
simples (marcar una clase tomada, registrar un pago) — ver `DOMAIN.md` para la lógica exacta de
cómo se deriva "al día"/"vencido".

El portal de alumnos es una capa de transparencia: el alumno puede consultar su propio estado sin
tener que preguntarle al profesor.
