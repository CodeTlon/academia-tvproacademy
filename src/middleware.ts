import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

// Redirect OPTIMISTA por cookie: no es una barrera de seguridad. La sesión, el rol y la contraseña temporal
// se validan de verdad en el servidor (guardPage en los layouts y requireAdmin/requireStudent en cada acción).
export function middleware(req: NextRequest) {
  const hasSession = Boolean(getSessionCookie(req))
  const { pathname } = req.nextUrl
  if (!hasSession && pathname !== '/login') {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/dashboard/:path*', '/portal/:path*'] }
