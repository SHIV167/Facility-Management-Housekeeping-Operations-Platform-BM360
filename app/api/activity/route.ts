import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  if (new URL(req.url).searchParams.get('download') === 'csv') {
    const rows = await query('SELECT * FROM activity_log ORDER BY id')
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = 'id,timestamp,actor,role,action,details\n' + rows.map((r: any) =>
      [r.id, esc(r.created_at), esc(r.actor), esc(r.role), esc(r.action), esc(r.details)].join(',')
    ).join('\n')
    return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="activity_log.csv"' } })
  }
  const rows = await query('SELECT * FROM activity_log ORDER BY id DESC LIMIT 500')
  return NextResponse.json({ ok: true, logs: rows.map((r: any) => ({ id: r.id, timestamp: new Date(r.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }), actor: r.actor, role: r.role, action: r.action, details: r.details })) })
}

export async function POST(req: NextRequest) {
  const b = await req.json()
  if (!b.action) return NextResponse.json({ ok: false }, { status: 400 })
  const rows = await query(
    `INSERT INTO activity_log (actor, role, action, entity_type, entity_id, details) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [b.actor || 'System', b.role || 'System', b.action, b.entityType || b.entity_type || '', b.entityId || b.entity_id || '', b.details || '']
  )
  return NextResponse.json({ ok: true, id: rows[0].id })
}
