import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const rows = await query('SELECT * FROM qr_codes ORDER BY id')
  return NextResponse.json({ ok: true, codes: rows })
}

export async function POST(req: NextRequest) {
  const b = await req.json()
  if (b.id) {
    const rows = await query(
      `UPDATE qr_codes SET title=$2, type=$3, zone=$4, url=$5, fg_color=$6, bg_color=$7, size=$8, status=$9, updated_at=now() WHERE id=$1 RETURNING *`,
      [b.id, b.title, b.type || 'complaint', b.zone || null, b.url || null, b.fgColor || b.fg_color || '#0b3c4a', b.bgColor || b.bg_color || '#ffffff', b.size || 220, b.status || 'Active']
    )
    return NextResponse.json({ ok: true, code: rows[0] })
  }
  const rows = await query(
    `INSERT INTO qr_codes (title, type, zone, url, fg_color, bg_color, size, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [b.title, b.type || 'complaint', b.zone || null, b.url || null, b.fgColor || b.fg_color || '#0b3c4a', b.bgColor || b.bg_color || '#ffffff', b.size || 220, b.status || 'Active']
  )
  return NextResponse.json({ ok: true, code: rows[0] })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await query('DELETE FROM qr_codes WHERE id=$1', [Number(id)])
  return NextResponse.json({ ok: true })
}
