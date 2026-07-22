// ponytail: contenido de blog hardcodeado (sin CMS) — array estático alcanza para una demo.
export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  image: string
  body: string[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'footwork-agilidad-en-espacios-reducidos',
    title: 'Footwork: cómo ganar agilidad en espacios reducidos',
    excerpt: 'Los ejercicios de pies que usamos en TVPRO para que ganes velocidad de reacción sin perder el control del balón.',
    category: 'Agility',
    date: '2026-05-12',
    readTime: '4 min',
    image: '/images/blog/footwork-agilidad.webp',
    body: [
      'La agilidad no es solo correr rápido: es la capacidad de cambiar de dirección sin perder el equilibrio ni el control del balón. En espacios reducidos, donde la mayoría de las jugadas de alta presión se definen, el footwork marca la diferencia entre perder la pelota o resolver la situación.',
      'En TVPRO trabajamos progresiones de escalera de coordinación combinadas con toques de balón, para que el cuerpo aprenda a moverse rápido mientras los pies siguen ejecutando la técnica correcta. La clave está en la repetición con exigencia creciente: primero sin oposición, después con presión de un compañero, y finalmente en situación de juego real.',
      'Un jugador con buen footwork gana metros de ventaja incluso sin ser el más veloz en línea recta. Por eso es de los primeros bloques que trabajamos con cualquier jugador que se suma a la academia.',
    ],
  },
  {
    slug: 'control-de-balon-bajo-presion',
    title: 'Control de balón bajo presión: el detalle que separa niveles',
    excerpt: 'Por qué una recepción orientada vale más que mil toques sueltos, y cómo entrenarla con presión real.',
    category: 'Technique',
    date: '2026-05-26',
    readTime: '5 min',
    image: '/images/blog/control-balon-presion.webp',
    body: [
      'Cualquiera controla la pelota parado y sin oposición. La diferencia entre un jugador amateur y uno de nivel profesional aparece cuando hay un rival encima y medio segundo para decidir.',
      'Trabajamos la recepción orientada: cada control debe dejar el balón listo para el siguiente paso, ya sea un pase, una conducción o un remate. Nunca un control "neutro" que obligue a un segundo toque de más.',
      'La presión se agrega de forma progresiva: primero un rival pasivo, después un rival que presiona en diagonal, y por último ejercicios con doble presión simulando una recuperación de equipo rival. Así el jugador automatiza la decisión antes de que la presión lo sorprenda en un partido real.',
    ],
  },
  {
    slug: 'toma-de-decisiones-el-entrenamiento-invisible',
    title: 'Toma de decisiones: el entrenamiento que no se ve en la cancha',
    excerpt: 'La velocidad mental separa a los jugadores que "leen" el juego de los que solo lo corren.',
    category: 'Mental',
    date: '2026-06-09',
    readTime: '4 min',
    image: '/images/blog/toma-decisiones.webp',
    body: [
      'Un jugador puede tener una técnica excelente y aun así quedarse atrás si no procesa rápido lo que pasa a su alrededor. La toma de decisiones es un músculo cognitivo, y como cualquier músculo, se entrena con repetición específica.',
      'Usamos ejercicios de reconocimiento de patrones: situaciones de juego reducidas (2 vs 1, 3 vs 2) donde el jugador tiene que resolver en fracciones de segundo con la opción correcta, no necesariamente la más vistosa.',
      'Con el tiempo, el jugador empieza a anticipar la jugada antes de que ocurra, en lugar de reaccionar cuando ya es tarde. Eso es lo que llamamos "leer el juego", y es una de las diferencias más claras entre un jugador de nivel amateur y uno que compite en torneos serios.',
    ],
  },
  {
    slug: 'como-elegir-el-torneo-correcto-para-tu-nivel',
    title: 'Cómo elegir el torneo correcto para tu nivel actual',
    excerpt: 'Jugar de más o de menos frena el progreso por igual. Algunas señales para elegir bien la próxima competencia.',
    category: 'Carrera',
    date: '2026-06-20',
    readTime: '3 min',
    image: '/images/blog/elegir-torneo.webp',
    body: [
      'Un error común es buscar siempre el torneo más exigente disponible, pensando que la presión constante acelera el progreso. En la práctica, sin una base sólida, esa presión genera más errores que aprendizajes.',
      'Lo ideal es un nivel de competencia que exija un poco más de lo que el jugador domina hoy, no el doble. Ahí es donde realmente se consolidan los recursos técnicos y tácticos trabajados en los entrenamientos.',
      'Si tu equipo está por definir en qué torneo competir la próxima temporada, en TVPRO podemos ayudarte a evaluar el nivel de exigencia y planificar la preparación específica para llegar a punto.',
    ],
  },
  {
    slug: 'la-importancia-de-medir-el-progreso',
    title: 'La importancia de medir el progreso, no solo entrenar',
    excerpt: 'Entrenar sin métricas es entrenar a ciegas. Así seguimos la evolución de cada jugador en la academia.',
    category: 'Metodología',
    date: '2026-06-28',
    readTime: '4 min',
    image: '/images/blog/medir-progreso.webp',
    body: [
      'Muchos jugadores entrenan durante meses sin una forma clara de saber si están mejorando. Esto no solo frena la motivación, sino que impide ajustar el plan de trabajo a tiempo.',
      'En TVPRO evaluamos periódicamente los mismos ejercicios de footwork, control y toma de decisiones que trabajamos en los entrenamientos, para tener una referencia objetiva de la evolución de cada jugador.',
      'No se trata de comparar a un jugador con otro, sino de comparar a cada jugador con su propia versión anterior. Esa es la métrica que realmente importa para el progreso a largo plazo.',
    ],
  },
]

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}
