import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { queryOne } from '@/lib/db'
import { createSessionToken, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}))

  // Admin username/password login
  if (b.username) {
    const admin = await queryOne<{ username: string; password_hash: string; role: string }>(
      'SELECT username, password_hash, role FROM admins WHERE username=$1',
      [String(b.username).trim().toLowerCase()]
    )
    if (!admin || !(await bcrypt.compare(String(b.password || ''), admin.password_hash))) {
      return NextResponse.json({ ok: false, error: 'Invalid username or password' }, { status: 401 })
    }
    await setSessionCookie(createSessionToken(admin.username, admin.role))
    await queryOne(
      `INSERT INTO activity_log (actor, role, action, details) VALUES ($1,$2,'Login','Admin login via username/password')`,
      [admin.username, admin.role]
    ).catch(() => {})
    return NextResponse.json({ ok: true, role: admin.role })
  }

  // Mobile OTP login — OTP intentionally static for this phase
  if (b.mobile) {
    const mobile = String(b.mobile).replace(/\D/g, '')
    if (b.otp !== '123456') {
      return NextResponse.json({ ok: false, error: 'Invalid OTP' }, { status: 401 })
    }
    const role = 'User'
    await setSessionCookie(createSessionToken(mobile, role))
    await queryOne(
      `INSERT INTO activity_log (actor, role, action, details) VALUES ($1,$2,'Login','OTP verified — logged into portal')`,
      [mobile, role]
    ).catch(() => {})
    return NextResponse.json({ ok: true, role })
  }

  return NextResponse.json({ ok: false, error: 'Missing credentials' }, { status: 400 })
}
