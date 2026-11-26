import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

const DDL = `CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  type TEXT DEFAULT 'info',
  agency_id INT,
  complaint_id INT,
  link TEXT DEFAULT '',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
)`

async function ensure() {
  await query(DDL).catch(() => {})
}

export async function GET(req: NextRequest) {
  await ensure()
  const agencyId = new URL(req.url).searchParams.get('agency_id')
  const unreadOnly = new URL(req.url).searchParams.get('unread') === '1'
  const params: any[] = []
  let where = ''
  if (agencyId) { params.push(Number(agencyId)); where += ` AND (agency_id=$${params.length} OR agency_id IS NULL)` }
  if (unreadOnly) where += ' AND read=FALSE'
  const rows = await query(
    `SELECT * FROM notifications WHERE 1=1 ${where} ORDER BY id DESC LIMIT 100`, params
  ).catch(() => [])
  const unread = await queryOneCount(unreadOnly ? null : (agencyId ? Number(agencyId) : null))
  return NextResponse.json({ ok: true, notifications: rows, unread })
}

async function queryOneCount(agencyId: number | null) {
  const { queryOne } = await import('@/lib/db')
  const params: any[] = []
  let where = 'read=FALSE'
  if (agencyId) { params.push(agencyId); where += ` AND (agency_id=$${params.length} OR agency_id IS NULL)` }
  const r = await queryOne<{ c: string }>(`SELECT count(*)::text AS c FROM notifications WHERE ${where}`, params).catch(() => null)
  return Number(r?.c || 0)
}

export async function POST(req: NextRequest) {
  await ensure()
  const b = await req.json()
  const rows = await query(
    `INSERT INTO notifications (title, message, type, agency_id, complaint_id, link) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [b.title || 'Notification', b.message || '', b.type || 'info', b.agencyId ?? b.agency_id ?? null, b.complaintId ?? b.complaint_id ?? null, b.link || '']
  ).catch(() => [])
  return NextResponse.json({ ok: true, notification: rows[0] || null })
}

export async function PATCH(req: NextRequest) {
  await ensure()
  const b = await req.json()
  if (b.all) {
    const agencyId = b.agencyId ?? b.agency_id ?? null
    const params: any[] = agencyId ? [agencyId] : []
    const where = agencyId ? ' WHERE (agency_id=$1 OR agency_id IS NULL)' : ''
    await query(`UPDATE notifications SET read=TRUE${where}`, params).catch(() => {})
    return NextResponse.json({ ok: true })
  }
  await query(`UPDATE notifications SET read=TRUE WHERE id=$1`, [Number(b.id)]).catch(() => {})
  return NextResponse.json({ ok: true })
}
