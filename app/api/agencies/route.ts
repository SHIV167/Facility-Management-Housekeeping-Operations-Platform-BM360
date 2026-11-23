import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

const COLS = 'id, name, contact_person, phone, email, address, services, zones, status, employee_count, joined_date, created_at'

export async function GET() {
  const rows = await query(`SELECT ${COLS} FROM agencies ORDER BY id`)
  return NextResponse.json({ ok: true, agencies: rows })
}

export async function POST(req: NextRequest) {
  const b = await req.json()
  const rows = await query(
    `INSERT INTO agencies (name, contact_person, phone, email, address, services, zones, status, joined_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING ${COLS}`,
    [b.name, b.contactPerson || b.contact_person || '', b.phone || '', b.email || '', b.address || '', b.services || [], b.zones || [], b.status || 'Active', b.joinedDate || b.joined_date || '']
  )
  return NextResponse.json({ ok: true, agency: rows[0] })
}

export async function PATCH(req: NextRequest) {
  const b = await req.json()
  const rows = await query(
    `UPDATE agencies SET name=$2, contact_person=$3, phone=$4, email=$5, address=$6, services=$7, zones=$8, status=$9, joined_date=$10, updated_at=now() WHERE id=$1 RETURNING ${COLS}`,
    [b.id, b.name, b.contactPerson || b.contact_person || '', b.phone || '', b.email || '', b.address || '', b.services || [], b.zones || [], b.status || 'Active', b.joinedDate || b.joined_date || '']
  )
  return NextResponse.json({ ok: true, agency: rows[0] })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await query('DELETE FROM agencies WHERE id=$1', [id])
  return NextResponse.json({ ok: true })
}
