-- TV Pro Academy — Tabla posts (blog)
-- Migración 002

create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  content      text not null,
  cover_image  text,
  category     text,
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.posts enable row level security;

drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
  on public.posts for select
  using (published = true);

drop policy if exists "Authenticated can manage posts" on public.posts;
create policy "Authenticated can manage posts"
  on public.posts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Seed: los 5 artículos que ya existían hardcodeados en src/lib/blog-data.ts
insert into public.posts (title, slug, excerpt, content, cover_image, category, published, created_at) values
(
  'Footwork: cómo ganar agilidad en espacios reducidos',
  'footwork-agilidad-en-espacios-reducidos',
  'Los ejercicios de pies que usamos en TVPRO para que ganes velocidad de reacción sin perder el control del balón.',
  '<p>La agilidad no es solo correr rápido: es la capacidad de cambiar de dirección sin perder el equilibrio ni el control del balón. En espacios reducidos, donde la mayoría de las jugadas de alta presión se definen, el footwork marca la diferencia entre perder la pelota o resolver la situación.</p><p>En TVPRO trabajamos progresiones de escalera de coordinación combinadas con toques de balón, para que el cuerpo aprenda a moverse rápido mientras los pies siguen ejecutando la técnica correcta. La clave está en la repetición con exigencia creciente: primero sin oposición, después con presión de un compañero, y finalmente en situación de juego real.</p><p>Un jugador con buen footwork gana metros de ventaja incluso sin ser el más veloz en línea recta. Por eso es de los primeros bloques que trabajamos con cualquier jugador que se suma a la academia.</p>',
  '/images/blog/footwork-agilidad.webp',
  'Agility',
  true,
  '2026-05-12'
),
(
  'Control de balón bajo presión: el detalle que separa niveles',
  'control-de-balon-bajo-presion',
  'Por qué una recepción orientada vale más que mil toques sueltos, y cómo entrenarla con presión real.',
  '<p>Cualquiera controla la pelota parado y sin oposición. La diferencia entre un jugador amateur y uno de nivel profesional aparece cuando hay un rival encima y medio segundo para decidir.</p><p>Trabajamos la recepción orientada: cada control debe dejar el balón listo para el siguiente paso, ya sea un pase, una conducción o un remate. Nunca un control "neutro" que obligue a un segundo toque de más.</p><p>La presión se agrega de forma progresiva: primero un rival pasivo, después un rival que presiona en diagonal, y por último ejercicios con doble presión simulando una recuperación de equipo rival. Así el jugador automatiza la decisión antes de que la presión lo sorprenda en un partido real.</p>',
  '/images/blog/control-balon-presion.webp',
  'Technique',
  true,
  '2026-05-26'
),
(
  'Toma de decisiones: el entrenamiento que no se ve en la cancha',
  'toma-de-decisiones-el-entrenamiento-invisible',
  'La velocidad mental separa a los jugadores que "leen" el juego de los que solo lo corren.',
  '<p>Un jugador puede tener una técnica excelente y aun así quedarse atrás si no procesa rápido lo que pasa a su alrededor. La toma de decisiones es un músculo cognitivo, y como cualquier músculo, se entrena con repetición específica.</p><p>Usamos ejercicios de reconocimiento de patrones: situaciones de juego reducidas (2 vs 1, 3 vs 2) donde el jugador tiene que resolver en fracciones de segundo con la opción correcta, no necesariamente la más vistosa.</p><p>Con el tiempo, el jugador empieza a anticipar la jugada antes de que ocurra, en lugar de reaccionar cuando ya es tarde. Eso es lo que llamamos "leer el juego", y es una de las diferencias más claras entre un jugador de nivel amateur y uno que compite en torneos serios.</p>',
  '/images/blog/toma-decisiones.webp',
  'Mental',
  true,
  '2026-06-09'
),
(
  'Cómo elegir el torneo correcto para tu nivel actual',
  'como-elegir-el-torneo-correcto-para-tu-nivel',
  'Jugar de más o de menos frena el progreso por igual. Algunas señales para elegir bien la próxima competencia.',
  '<p>Un error común es buscar siempre el torneo más exigente disponible, pensando que la presión constante acelera el progreso. En la práctica, sin una base sólida, esa presión genera más errores que aprendizajes.</p><p>Lo ideal es un nivel de competencia que exija un poco más de lo que el jugador domina hoy, no el doble. Ahí es donde realmente se consolidan los recursos técnicos y tácticos trabajados en los entrenamientos.</p><p>Si tu equipo está por definir en qué torneo competir la próxima temporada, en TVPRO podemos ayudarte a evaluar el nivel de exigencia y planificar la preparación específica para llegar a punto.</p>',
  '/images/blog/elegir-torneo.webp',
  'Carrera',
  true,
  '2026-06-20'
),
(
  'La importancia de medir el progreso, no solo entrenar',
  'la-importancia-de-medir-el-progreso',
  'Entrenar sin métricas es entrenar a ciegas. Así seguimos la evolución de cada jugador en la academia.',
  '<p>Muchos jugadores entrenan durante meses sin una forma clara de saber si están mejorando. Esto no solo frena la motivación, sino que impide ajustar el plan de trabajo a tiempo.</p><p>En TVPRO evaluamos periódicamente los mismos ejercicios de footwork, control y toma de decisiones que trabajamos en los entrenamientos, para tener una referencia objetiva de la evolución de cada jugador.</p><p>No se trata de comparar a un jugador con otro, sino de comparar a cada jugador con su propia versión anterior. Esa es la métrica que realmente importa para el progreso a largo plazo.</p>',
  '/images/blog/medir-progreso.webp',
  'Metodología',
  true,
  '2026-06-28'
)
on conflict (slug) do nothing;
