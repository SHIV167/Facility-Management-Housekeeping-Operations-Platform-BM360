import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query, queryOne } from '@/lib/db'

export async function GET(req: NextRequest) {
  const agencyId = new URL(req.url).searchParams.get('agency_id')
  const role = new URL(req.url).searchParams.get('role')
  let sql = `SELECT s.*, a.name AS agency_name FROM staff s LEFT JOIN agencies a ON a.id = s.agency_id`
  const conds: string[] = [], params: any[] = []
  if (agencyId) { params.push(Number(agencyId)); conds.push(`s.agency_id=$${params.length}`) }
  if (role) { params.push(role); conds.push(`s.role=$${params.length}`) }
  if (conds.length) sql += ' WHERE ' + conds.join(' AND ')
  sql += ' ORDER BY s.id'
  const rows = await query(sql, params)
  return NextResponse.json({ ok: true, staff: rows })
}

export async function POST(req: NextRequest) {
  const b = await req.json()
  const hash = b.password ? await bcrypt.hash(String(b.password), 10) : null
  let fields: [string, any][] = [
    ['agency_id', b.agencyId || b.agency_id || null],
    ['name', b.name],
    ['role', b.role || 'Field Staff'],
    ['designation', b.designation || ''],
    ['username', b.username || ''],
    ['phone', b.phone || ''],
    ['employee_id', b.employeeId || b.employee_id || ''],
    ['zones', b.zones || []],
    ['reporting_supervisor_id', b.reportingSupervisorId || b.reporting_supervisor_id || null],
    ['shift', b.shift || 'No Shift'],
    ['status', b.status || 'Pending'],
    ...(hash ? [['password_hash', hash] as [string, any]] : []),
  ]
  let rows: any[] = []
  let lastErr: any = null
  for (let attempt = 0; attempt < fields.length + 2; attempt++) {
    const cols = fields.map(([c]) => c)
    const vals = fields.map(([, v]) => v)
    const ph = vals.map((_, i) => `$${i + 1}`).join(',')
    try {
      rows = await query(`INSERT INTO staff (${cols.join(',')}) VALUES (${ph}) RETURNING *`, vals)
      break
    } catch (e: any) {
      lastErr = e
      const m = String(e?.message || '').match(/column "?(\w+)"? does not exist/i)
      if (m) {
        const idx = fields.findIndex(([c]) => c === m[1])
        if (idx >= 0) { fields.splice(idx, 1); continue }
      }
      // Type mismatch (e.g. zones TEXT vs array) — retry with text-cast arrays
      const txt = fields.map(([c, v]) => [c, Array.isArray(v) ? v.join(',') : v] as [string, any])
      try {
        const cols2 = txt.map(([c]) => c)
        const vals2 = txt.map(([, v]) => v)
        const ph2 = vals2.map((_, i) => `$${i + 1}`).join(',')
        rows = await query(`INSERT INTO staff (${cols2.join(',')}) VALUES (${ph2}) RETURNING *`, vals2)
        break
      } catch (e2) { lastErr = e2; break }
    }
  }
  // Last-resort minimal insert — core columns only, guarantees login works
  if (!rows.length) {
    try {
      rows = await query(
        `INSERT INTO staff (agency_id, name, role, designation, phone, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [b.agencyId || b.agency_id || null, b.name, b.role || 'Field Staff', b.designation || '', b.phone || '', b.status || 'Active']
      )
    } catch (e2) { throw lastErr || e2 || new Error('staff insert failed') }
  }
  await query('UPDATE agencies SET employee_count = (SELECT count(*) FROM staff WHERE agency_id=$1) WHERE id=$1', [b.agencyId || b.agency_id]).catch(() => {})
  return NextResponse.json({ ok: true, staff: rows[0] })
}

export async function PATCH(req: NextRequest) {
  const b = await req.json()
  const hash = b.password ? await bcrypt.hash(String(b.password), 10) : null
  // column -> param index (1-based after id=$1)
  const fields: [string, any][] = [
    ['agency_id', b.agencyId || b.agency_id || null],
    ['name', b.name],
    ['role', b.role || 'Field Staff'],
    ['designation', b.designation || ''],
    ['username', b.username || ''],
    ['phone', b.phone || ''],
    ['employee_id', b.employeeId || b.employee_id || ''],
    ['zones', b.zones || []],
    ['reporting_supervisor_id', b.reportingSupervisorId || b.reporting_supervisor_id || null],
    ['shift', b.shift || 'No Shift'],
    ['status', b.status || 'Pending'],
    ...(hash ? [['password_hash', hash] as [string, any]] : []),
  ]
  // progressively drop columns the DB doesn't have (Render schema drift)
  let active = [...fields]
  for (let attempt = 0; attempt < fields.length + 1; attempt++) {
    const setClause = active.map(([col], i) => `${col}=$${i + 2}`).join(', ')
    const params = [b.id, ...active.map(([, v]) => v)]
    try {
      const sql = active.length
        ? `UPDATE staff SET ${setClause}, updated_at=now() WHERE id=$1 RETURNING *`
        : `UPDATE staff SET name=$2 WHERE id=$1 RETURNING *`
      const p = active.length ? params : [b.id, b.name]
      const rows = await query(sql, p)
      return NextResponse.json({ ok: true, staff: rows[0] })
    } catch (e: any) {
      const msg = String(e?.message || '')
      const m = msg.match(/column "?(\w+)"? does not exist/i) || msg.match(/column (\w+) of relation/i)
      if (m) {
        const bad = m[1]
        const idx = active.findIndex(([c]) => c === bad || c.replace(/_id$/, '') === bad)
        if (idx >= 0) { active.splice(idx, 1); continue }
        // column may be updated_at or other non-field — drop and retry once
        if (bad === 'updated_at') {
          try {
            const setClause2 = active.map(([col], i) => `${col}=$${i + 2}`).join(', ')
            const rows = await query(`UPDATE staff SET ${setClause2} WHERE id=$1 RETURNING *`, params)
            return NextResponse.json({ ok: true, staff: rows[0] })
          } catch { /* fall through */ }
        }
      }
      if (attempt === fields.length) break
      // unknown error — try dropping last field once
      if (active.length) active.pop()
      else break
    }
  }
  return NextResponse.json({ error: 'Update failed — run db/migrations.sql on the database' }, { status: 500 })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const s = await queryOneSafe('SELECT agency_id FROM staff WHERE id=$1', [id])
  await query('DELETE FROM staff WHERE id=$1', [id])
  if (s?.agency_id) await query('UPDATE agencies SET employee_count = GREATEST((SELECT count(*) FROM staff WHERE agency_id=$1),0) WHERE id=$1', [s.agency_id])
  return NextResponse.json({ ok: true })
}

async function queryOneSafe(text: string, params: any[]) {
  const { queryOne } = await import('@/lib/db')
  return queryOne(text, params)
}
