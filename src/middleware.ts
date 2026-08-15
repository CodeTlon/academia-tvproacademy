import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(URL, ANON, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isDashboard = path.startsWith('/dashboard')
  const isLogin = path === '/dashboard/login'
  const isCambiarPassword = path === '/dashboard/cambiar-password'
  const isPortal = path.startsWith('/portal')
  const isPortalLogin = path === '/portal/login'
  const isPortalCambiarPassword = path === '/portal/cambiar-password'
  const isStudent = user?.user_metadata?.role === 'student'

  // Sin sesión en una ruta protegida del panel → redirigir al login
  if (isDashboard && !isLogin && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard/login'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  // Sin sesión en una ruta protegida del portal → redirigir al login del portal
  if (isPortal && !isPortalLogin && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/portal/login'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  // Ya autenticado intentando entrar al login → redirigir a su panel
  if (isLogin && user) {
    const url = request.nextUrl.clone()
    url.pathname = isStudent ? '/portal' : '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }
  if (isPortalLogin && user) {
    const url = request.nextUrl.clone()
    url.pathname = isStudent ? '/portal' : '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Cuenta de alumno pidiendo el panel de admin, o cuenta de admin pidiendo
  // el portal → cada una a lo suyo.
  if (isDashboard && !isLogin && user && isStudent) {
    const url = request.nextUrl.clone()
    url.pathname = '/portal'
    url.search = ''
    return NextResponse.redirect(url)
  }
  if (isPortal && !isPortalLogin && user && !isStudent) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Contraseña temporal (alta nueva o reset) sin cambiar → forzar a cambiarla
  // antes de dejar entrar a cualquier otra ruta del panel/portal.
  if (isDashboard && !isLogin && !isCambiarPassword && user?.user_metadata?.must_change_password) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard/cambiar-password'
    url.search = ''
    return NextResponse.redirect(url)
  }
  if (isPortal && !isPortalLogin && !isPortalCambiarPassword && user?.user_metadata?.must_change_password) {
    const url = request.nextUrl.clone()
    url.pathname = '/portal/cambiar-password'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/portal/:path*'],
}
