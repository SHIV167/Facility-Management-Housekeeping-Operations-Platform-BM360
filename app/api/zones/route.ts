import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const rows = await query('SELECT * FROM zones ORDER BY id')
  return NextResponse.json({ ok: true, zones: rows })
}

export async function POST(req: NextRequest) {
  const b = await req.json()
  const rows = await query(
    `INSERT INTO zones (name, area, manager, status, access_mobiles) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [b.name, b.area || '', b.manager || 'Unassigned', b.status || 'Active', b.accessMobile || b.access_mobiles || '']
  )
  return NextResponse.json({ ok: true, zone: rows[0] })
}

export async function PATCH(req: NextRequest) {
  const b = await req.json()
  const rows = await query(
    `UPDATE zones SET name=$2, area=$3, manager=$4, status=$5, access_mobiles=$6, updated_at=now() WHERE id=$1 RETURNING *`,
    [b.id, b.name, b.area || '', b.manager || 'Unassigned', b.status || 'Active', b.accessMobile || b.access_mobiles || '']
  )
  return NextResponse.json({ ok: true, zone: rows[0] })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await query('DELETE FROM zones WHERE id=$1', [id])
  return NextResponse.json({ ok: true })
}
