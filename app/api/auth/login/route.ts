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
      // Fall through — may be an ITPO official login
      const official = await queryOne<{ id: number; name: string; username: string; password_hash: string }>(
        'SELECT id, name, username, password_hash FROM itpo_officials WHERE (lower(username)=lower($1) OR lower(email)=lower($1)) AND status=\'Active\'',
        [String(b.username).trim()]
      )
      if (official && official.password_hash && await bcrypt.compare(String(b.password || ''), official.password_hash)) {
        await setSessionCookie(createSessionToken(official.username, 'ITPO Official'))
        await queryOne(
          `INSERT INTO activity_log (actor, role, action, details) VALUES ($1,$2,'Login',$3)`,
          [official.username, 'ITPO Official', `ITPO official login — ${official.name}`]
        ).catch(() => {})
        return NextResponse.json({ ok: true, role: 'ITPO Official', officialId: official.id, name: official.name })
      }
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
