import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

const COLS = 'id, name, contact_person, phone, email, address, services, zones, status, employee_count, joined_date, created_at'

export async function GET() {
  const rows = await query(`SELECT ${COLS} FROM agencies ORDER BY id`)
  return NextResponse.json({ ok: true, agencies: rows })
}

export async function POST(req: NextRequest) {
  const b = await req.json()
  let fields: [string, any][] = [
    ['name', b.name],
    ['contact_person', b.contactPerson || b.contact_person || ''],
    ['phone', b.phone || ''],
    ['email', b.email || ''],
    ['address', b.address || ''],
    ['services', b.services || []],
    ['zones', b.zones || []],
    ['status', b.status || 'Active'],
    ['joined_date', b.joinedDate || b.joined_date || ''],
  ]
  let rows: any[] = []
  let lastErr: any = null
  for (let attempt = 0; attempt < fields.length + 2; attempt++) {
    const cols = fields.map(([c]) => c)
    const vals = fields.map(([, v]) => v)
    const ph = vals.map((_, i) => `$${i + 1}`).join(',')
    try {
      rows = await query(`INSERT INTO agencies (${cols.join(',')}) VALUES (${ph}) RETURNING ${COLS}`, vals)
      break
    } catch (e: any) {
      lastErr = e
      const m = String(e?.message || '').match(/column "?(\w+)"? does not exist/i)
      if (m) {
        const idx = fields.findIndex(([c]) => c === m[1])
        if (idx >= 0) { fields.splice(idx, 1); continue }
      }
      // Type mismatch fallback — retry with text-cast values for array columns
      const txt = fields.map(([c, v]) => [c, Array.isArray(v) ? v.join(',') : v] as [string, any])
      try {
        const cols2 = txt.map(([c]) => c)
        const vals2 = txt.map(([, v]) => v)
        const ph2 = vals2.map((_, i) => `$${i + 1}`).join(',')
        rows = await query(`INSERT INTO agencies (${cols2.join(',')}) VALUES (${ph2}) RETURNING ${COLS}`, vals2)
        break
      } catch (e2) { lastErr = e2; break }
    }
  }
  if (!rows.length) throw lastErr || new Error('agency insert failed')
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
