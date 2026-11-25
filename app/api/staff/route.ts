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
  const rows = await query(
    `INSERT INTO staff (agency_id, name, role, designation, username, phone, employee_id, zones, reporting_supervisor_id, shift, status, password_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [b.agencyId || b.agency_id || null, b.name, b.role || 'Field Staff', b.designation || '', b.username || '', b.phone || '', b.employeeId || b.employee_id || '', b.zones || [], b.reportingSupervisorId || b.reporting_supervisor_id || null, b.shift || 'No Shift', b.status || 'Pending', hash]
  )
  await query('UPDATE agencies SET employee_count = (SELECT count(*) FROM staff WHERE agency_id=$1) WHERE id=$1', [b.agencyId || b.agency_id])
  return NextResponse.json({ ok: true, staff: rows[0] })
}

export async function PATCH(req: NextRequest) {
  const b = await req.json()
  const cols = [b.id, b.agencyId || b.agency_id || null, b.name, b.role || 'Field Staff', b.designation || '', b.username || '', b.phone || '', b.employeeId || b.employee_id || '', b.zones || [], b.reportingSupervisorId || b.reporting_supervisor_id || null, b.shift || 'No Shift', b.status || 'Pending']
  const hash = b.password ? await bcrypt.hash(String(b.password), 10) : null
  const fullSql = hash
    ? `UPDATE staff SET agency_id=$2, name=$3, role=$4, designation=$5, username=$6, phone=$7, employee_id=$8, zones=$9, reporting_supervisor_id=$10, shift=$11, status=$12, password_hash=$13, updated_at=now() WHERE id=$1 RETURNING *`
    : `UPDATE staff SET agency_id=$2, name=$3, role=$4, designation=$5, username=$6, phone=$7, employee_id=$8, zones=$9, reporting_supervisor_id=$10, shift=$11, status=$12, updated_at=now() WHERE id=$1 RETURNING *`
  try {
    const rows = await query(fullSql, hash ? [...cols, hash] : cols)
    return NextResponse.json({ ok: true, staff: rows[0] })
  } catch {
    // fallback for DBs missing newer columns
    try {
      const rows = await query(
        `UPDATE staff SET agency_id=$2, name=$3, role=$4, phone=$5, status=$6 WHERE id=$1 RETURNING *`,
        [b.id, b.agencyId || b.agency_id || null, b.name, b.role || 'Field Staff', b.phone || '', b.status || 'Pending']
      )
      return NextResponse.json({ ok: true, staff: rows[0] })
    } catch (e2) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
  }
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
