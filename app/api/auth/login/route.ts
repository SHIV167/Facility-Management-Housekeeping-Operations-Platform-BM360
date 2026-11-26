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
    // Agency staff/supervisors authenticate by registered mobile number
    let staff = await queryOne<{ id: number; name: string; username: string; role: string }>(
      `SELECT id, name, username, role FROM staff WHERE regexp_replace(COALESCE(phone,''),'\\D','','g') LIKE '%' || $1 AND status='Active' ORDER BY CASE WHEN role ILIKE '%manager%' THEN 0 WHEN role ILIKE '%supervisor%' THEN 1 ELSE 2 END, id LIMIT 1`,
      [mobile]
    ).catch(() => null)
    // Fallback: agency contact phone → resolve to that agency's manager staff (auto-provision if none)
    if (!staff) {
      const ag = await queryOne<{ id: number; name: string; contact_person: string }>(
        `SELECT id, name, contact_person FROM agencies WHERE regexp_replace(COALESCE(phone,''),'\\D','','g') LIKE '%' || $1 LIMIT 1`, [mobile]
      ).catch(() => null)
      if (ag) {
        staff = await queryOne<{ id: number; name: string; username: string; role: string }>(
          `SELECT id, name, username, role FROM staff WHERE agency_id=$1 AND status='Active' ORDER BY CASE WHEN role ILIKE '%manager%' THEN 0 WHEN role ILIKE '%supervisor%' THEN 1 ELSE 2 END LIMIT 1`,
          [ag.id]
        ).catch(() => null)
        if (!staff) {
          const mgrName = ag.contact_person || ag.name
          staff = await queryOne<{ id: number; name: string; username: string; role: string }>(
            `INSERT INTO staff (agency_id, name, role, designation, phone, status) VALUES ($1,$2,'Manager','Agency Manager',$3,'Active') RETURNING id, name, username, role`,
            [ag.id, mgrName, mobile]
          ).catch(() => null)
        }
      }
    }
    const role = staff ? (/manager/i.test(staff.role) ? 'Agency Manager' : /supervisor/i.test(staff.role) ? 'Agency Supervisor' : 'Field Staff') : null
    if (!role) {
      // Only registered agency staff or All-Campus-authorized mobiles may log in
      const zoneAccess = await queryOne<{ access_mobiles: string }>(
        `SELECT access_mobiles FROM zones WHERE access_mobiles <> ''`
      ).catch(() => null)
      const allowed = (zoneAccess?.access_mobiles || '').split(',').map((m) => m.trim()).filter(Boolean)
      if (!allowed.includes(mobile)) {
        return NextResponse.json({ ok: false, error: 'Mobile number not registered. Contact admin.' }, { status: 403 })
      }
    }
    const finalRole = role || 'User'
    await setSessionCookie(createSessionToken(staff?.username || mobile, finalRole))
    await queryOne(
      `INSERT INTO activity_log (actor, role, action, details) VALUES ($1,$2,'Login',$3)`,
      [staff?.username || mobile, finalRole, staff ? `${staff.name} OTP login` : 'OTP verified — logged into portal']
    ).catch(() => {})
    return NextResponse.json({ ok: true, role: finalRole, staffId: staff?.id, name: staff?.name })
  }

  return NextResponse.json({ ok: false, error: 'Missing credentials' }, { status: 400 })
}
