import { NextRequest, NextResponse } from 'next/server'

const SECRET = process.env.SESSION_SECRET || 'bm360-dev-secret-change-me'
const COOKIE = 'bm360_session'
const enc = new TextEncoder()

async function verify(token: string): Promise<{ uid: string; role: string; exp: number } | null> {
  try {
    const [p, s] = token.split('.')
    if (!p || !s) return null
    const key = await crypto.subtle.importKey('raw', enc.encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(p))
    const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
    if (hex !== s) return null
    const b64 = p.replace(/-/g, '+').replace(/_/g, '/')
    const data = JSON.parse(atob(b64))
    if (!data.exp || data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public routes
  if (
    pathname === '/' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/raise-complaint') ||
    pathname.startsWith('/qr-codes') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get(COOKIE)?.value
  const session = token ? await verify(token) : null

  // Not authenticated → back to login
  if (!session) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Admin area — Admin role only
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (session.role !== 'Admin') {
      const url = req.nextUrl.clone()
      url.pathname = '/itpo-dashboard'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ITPO / Agency / Official portals — any authenticated user
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
