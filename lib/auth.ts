import crypto from 'crypto'
import { cookies } from 'next/headers'
import { queryOne } from '@/lib/db'

const SECRET = process.env.SESSION_SECRET || 'bm360-dev-secret-change-me'
const COOKIE = 'bm360_session'
const TTL_MS = 1000 * 60 * 60 * 8 // 8 hours

function sign(payload: string) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
}

export function createSessionToken(userId: string, role: string) {
  const expires = Date.now() + TTL_MS
  const payload = Buffer.from(JSON.stringify({ uid: userId, role, exp: expires })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token: string): { uid: string; role: string } | null {
  try {
    const [payload, sig] = token.split('.')
    if (!payload || !sig || sign(payload) !== sig) return null
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (!data.exp || data.exp < Date.now()) return null
    return { uid: data.uid, role: data.role }
  } catch {
    return null
  }
}

export async function getSession() {
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  if (!token) return null
  const s = verifySessionToken(token)
  if (!s) return null
  const admin = await queryOne('SELECT username, role FROM admins WHERE username=$1', [s.uid]).catch(() => null)
  return { uid: s.uid, role: s.role, name: admin?.username || s.uid }
}

export async function setSessionCookie(token: string) {
  const store = await cookies()
  store.set(COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: TTL_MS / 1000 })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(COOKIE)
}
