import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query, queryOne } from '@/lib/db'

const COLS = 'id, name, username, employee_id, designation, phone, email, zones, status, created_at, updated_at'

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (id) {
    const row = await queryOne(`SELECT ${COLS} FROM itpo_officials WHERE id=$1`, [id])
    return NextResponse.json({ ok: true, official: row })
  }
  const rows = await query(`SELECT ${COLS} FROM itpo_officials ORDER BY id`)
  return NextResponse.json({ ok: true, officials: rows })
}

export async function POST(req: NextRequest) {
  const b = await req.json()
  const hash = b.password ? await bcrypt.hash(String(b.password), 10) : null
  const rows = await query(
    `INSERT INTO itpo_officials (name, username, employee_id, designation, phone, email, zones, status, password_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING ${COLS}`,
    [b.name, b.username || '', b.employeeId || b.employee_id || '', b.designation || '', b.phone || '', b.email || '', b.zones || [], b.status || 'Active', hash]
  )
  return NextResponse.json({ ok: true, official: rows[0] })
}

export async function PATCH(req: NextRequest) {
  const b = await req.json()
  if (b.password) {
    const hash = await bcrypt.hash(String(b.password), 10)
    const rows = await query(
      `UPDATE itpo_officials SET name=$2, username=$3, employee_id=$4, designation=$5, phone=$6, email=$7, zones=$8, status=$9, password_hash=$10, updated_at=now() WHERE id=$1 RETURNING ${COLS}`,
      [b.id, b.name, b.username || '', b.employeeId || b.employee_id || '', b.designation || '', b.phone || '', b.email || '', b.zones || [], b.status || 'Active', hash]
    )
    return NextResponse.json({ ok: true, official: rows[0] })
  }
  const rows = await query(
    `UPDATE itpo_officials SET name=$2, username=$3, employee_id=$4, designation=$5, phone=$6, email=$7, zones=$8, status=$9, updated_at=now() WHERE id=$1 RETURNING ${COLS}`,
    [b.id, b.name, b.username || '', b.employeeId || b.employee_id || '', b.designation || '', b.phone || '', b.email || '', b.zones || [], b.status || 'Active']
  )
  return NextResponse.json({ ok: true, official: rows[0] })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await query('DELETE FROM itpo_officials WHERE id=$1', [id])
  return NextResponse.json({ ok: true })
}
