import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function GET(req: NextRequest) {
  const status = new URL(req.url).searchParams.get('status')
  const zone = new URL(req.url).searchParams.get('zone')
  let sql = `SELECT c.*, a.name AS agency_name, o.name AS official_name FROM complaints c
             LEFT JOIN agencies a ON a.id=c.agency_id LEFT JOIN itpo_officials o ON o.id=c.assigned_official_id`
  const conds: string[] = [], params: any[] = []
  if (status) { params.push(status); conds.push(`c.status=$${params.length}`) }
  if (zone) { params.push(zone); conds.push(`c.zone=$${params.length}`) }
  if (conds.length) sql += ' WHERE ' + conds.join(' AND ')
  sql += ' ORDER BY c.id DESC'
  const rows = await query(sql, params)
  return NextResponse.json({ ok: true, complaints: rows })
}

export async function POST(req: NextRequest) {
  const b = await req.json()
  const pub = await queryOne<{ next: string }>(
    `SELECT 'CMP-' || lpad((COALESCE(MAX(id),0)+1)::text, 4, '0') AS next FROM complaints`
  )
  const rows = await query(
    `INSERT INTO complaints (public_id, title, complaint_type, zone, sub_area, description, service, reported_by, reporter_name, reporter_mobile, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'PENDING') RETURNING *`,
    [pub?.next, b.title || b.description?.slice(0, 60) || 'Citizen Complaint', b.complaintType || b.complaint_type || 'General', b.zone || '', b.subArea || b.sub_area || '', b.description || '', b.service || '', b.reportedBy || b.reported_by || 'Citizen', b.name || b.reporter_name || '', b.mobile || b.reporter_mobile || '']
  )
  const c = rows[0]
  await query(
    `INSERT INTO complaint_updates (complaint_id, action, actor, role, details) VALUES ($1,'Complaint Submitted',$2,'Citizen',$3)`,
    [c.id, b.name || 'Citizen', `Complaint ${c.public_id} registered`]
  )
  await query(
    `INSERT INTO activity_log (actor, role, action, entity_type, entity_id, details) VALUES ($1,'Citizen','Complaint Submitted','complaint',$2,$3)`,
    [b.name || 'Citizen', String(c.id), `${c.public_id} · ${c.complaint_type} · ${c.zone}`]
  )
  return NextResponse.json({ ok: true, id: c.public_id, complaint: c })
}

export async function PATCH(req: NextRequest) {
  const b = await req.json()
  const status = b.status
  const actor = b.actor || 'System'
  const role = b.role || 'System'
  const complaintId = Number(b.id || b.complaintId)
  const rows = await query(
    `UPDATE complaints SET status=$2, resolved_at=CASE WHEN $2 IN ('COMPLETED','RESOLVED') THEN now() ELSE resolved_at END, resolved_by=CASE WHEN $2 IN ('COMPLETED','RESOLVED') THEN $3 ELSE resolved_by END, updated_at=now() WHERE id=$1 RETURNING *`,
    [complaintId, status, actor]
  )
  if (!rows[0]) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
  const action = status === 'COMPLETED' || status === 'RESOLVED' ? 'Complaint Closed / Completed' : 'Complaint Reopened'
  await query(
    `INSERT INTO complaint_updates (complaint_id, action, actor, role, details) VALUES ($1,$2,$3,$4,$5)`,
    [complaintId, action, actor, role, `Status → ${status}`]
  )
  await query(
    `INSERT INTO activity_log (actor, role, action, entity_type, entity_id, details) VALUES ($1,$2,$3,'complaint',$4,$5)`,
    [actor, role, action, String(complaintId), `Complaint #${complaintId} → ${status}`]
  )
  return NextResponse.json({ ok: true, complaint: rows[0] })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await query('DELETE FROM complaints WHERE id=$1', [Number(id)])
  return NextResponse.json({ ok: true })
}
