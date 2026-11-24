import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { query, queryOne } from '@/lib/db'

const PHOTOS_DIR = path.join(process.cwd(), 'data', 'photos')

function savePhotos(dataUrls: string[], tag: string): string[] {
  if (!dataUrls?.length) return []
  fs.mkdirSync(PHOTOS_DIR, { recursive: true })
  return dataUrls.slice(0, 6).map((du, i) => {
    const m = String(du).match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/)
    if (!m) return ''
    const ext = m[1] === 'jpeg' ? 'jpg' : m[1]
    const fname = `complaint_${tag}_${Date.now()}_${i}.${ext}`
    fs.writeFileSync(path.join(PHOTOS_DIR, fname), Buffer.from(m[2], 'base64'))
    return `/api/photo?file=${fname}`
  }).filter(Boolean)
}

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
  const ctype = String(b.complaintType || b.complaint_type || b.service || '').toLowerCase()
  const slaMin = ctype.includes('urgent') ? 30 : 60
  const due = new Date(Date.now() + slaMin * 60000).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
  const source = String(b.source || b.reportedBy || b.reported_by || 'Citizen')
  const reporterRole = source === 'itpo' ? 'ITPO Official' : source === 'agency' ? 'Agency' : 'Citizen'
  const reporterName = b.name || b.reporter_name || (reporterRole === 'ITPO Official' ? 'ITPO Official' : reporterRole === 'Agency' ? 'Agency Staff' : 'Citizen')
  // Save uploaded photos first so we can tag files with the complaint id
  const photoPaths = savePhotos(Array.isArray(b.photos) ? b.photos : (b.photo ? [b.photo] : []), 'pending')
  const assignedOfficialId = b.assignedOfficialId || b.assigned_official_id || null
  let rows: any[] = []
  try {
    rows = await query(
      `INSERT INTO complaints (public_id, title, complaint_type, zone, sub_area, description, service, reported_by, reporter_name, reporter_mobile, status, due_date, photo_url, photos, assigned_official_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'PENDING',$11,$12,$13,$14) RETURNING *`,
      [pub?.next, b.title || b.description?.slice(0, 60) || 'Citizen Complaint', b.complaintType || b.complaint_type || 'General', b.zone || '', b.subArea || b.sub_area || '', b.description || '', b.service || '', reporterRole, reporterName, b.mobile || b.reporter_mobile || '', due, photoPaths[0] || null, JSON.stringify(photoPaths), assignedOfficialId]
    )
  } catch {
    // Fallback for DBs missing newer columns (photos/assigned_official_id)
    rows = await query(
      `INSERT INTO complaints (public_id, title, complaint_type, zone, sub_area, description, service, reported_by, reporter_name, reporter_mobile, status, due_date, photo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'PENDING',$11,$12) RETURNING *`,
      [pub?.next, b.title || b.description?.slice(0, 60) || 'Citizen Complaint', b.complaintType || b.complaint_type || 'General', b.zone || '', b.subArea || b.sub_area || '', b.description || '', b.service || '', reporterRole, reporterName, b.mobile || b.reporter_mobile || '', due, photoPaths[0] || null]
    )
  }
  const c = rows[0]
  // Rename saved files with the real complaint id for traceability
  if (photoPaths.length) {
    const renamed = photoPaths.map((p) => {
      const fname = p.split('file=')[1]
      const next = fname.replace('complaint_pending_', `complaint_${c.id}_`)
      try { fs.renameSync(path.join(PHOTOS_DIR, fname), path.join(PHOTOS_DIR, next)) } catch {}
      return `/api/photo?file=${next}`
    })
    await query('UPDATE complaints SET photo_url=$2, photos=$3 WHERE id=$1', [c.id, renamed[0] || null, JSON.stringify(renamed)]).catch(() => {})
    c.photo_url = renamed[0] || null
    c.photos = renamed
  }
  await query(
    `INSERT INTO complaint_updates (complaint_id, action, actor, role, details) VALUES ($1,'Complaint Submitted',$2,$3,$4)`,
    [c.id, reporterName, reporterRole, `Complaint ${c.public_id} registered${photoPaths.length ? ` with ${photoPaths.length} photo(s)` : ''}`]
  )
  await query(
    `INSERT INTO activity_log (actor, role, action, entity_type, entity_id, details) VALUES ($1,$2,'Complaint Submitted','complaint',$3,$4)`,
    [reporterName, reporterRole, String(c.id), `${c.public_id} · ${c.complaint_type} · ${c.zone}`]
  )
  return NextResponse.json({ ok: true, id: c.public_id, complaint: c })
}

export async function PATCH(req: NextRequest) {
  const b = await req.json()
  const complaintId = Number(b.id || b.complaintId)
  // Full edit mode — update any provided fields
  if (b.edit) {
    const rows = await query(
      `UPDATE complaints SET title=$2, complaint_type=$3, zone=$4, sub_area=$5, description=$6, service=$7, due_date=$8, status=$9, updated_at=now() WHERE id=$1 RETURNING *`,
      [complaintId, b.title ?? '', b.complaintType ?? b.complaint_type ?? 'General', b.zone ?? '', b.subArea ?? b.sub_area ?? '', b.description ?? '', b.service ?? '', b.dueDate ?? b.due_date ?? '', b.status ?? 'PENDING']
    ).catch(async () => {
      return query(
        `UPDATE complaints SET title=$2, complaint_type=$3, zone=$4, sub_area=$5, description=$6, service=$7, due_date=$8, status=$9 WHERE id=$1 RETURNING *`,
        [complaintId, b.title ?? '', b.complaintType ?? b.complaint_type ?? 'General', b.zone ?? '', b.subArea ?? b.sub_area ?? '', b.description ?? '', b.service ?? '', b.dueDate ?? b.due_date ?? '', b.status ?? 'PENDING']
      )
    })
    if (!rows[0]) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    await query(`INSERT INTO activity_log (actor, role, action, entity_type, entity_id, details) VALUES ($1,$2,'Complaint Updated','complaint',$3,$4)`,
      [b.actor || 'Admin', b.role || 'Admin', String(complaintId), `${rows[0].public_id} edited`]).catch(() => {})
    return NextResponse.json({ ok: true, complaint: rows[0] })
  }
  const status = b.status
  const actor = b.actor || 'System'
  const role = b.role || 'System'
  let rows: any[] = []
  try {
    rows = await query(
      `UPDATE complaints SET status=$2, resolved_at=CASE WHEN $2 IN ('COMPLETED','RESOLVED') THEN now() ELSE resolved_at END, resolved_by=CASE WHEN $2 IN ('COMPLETED','RESOLVED') THEN $3 ELSE resolved_by END, updated_at=now() WHERE id=$1 RETURNING *`,
      [complaintId, status, actor]
    )
  } catch {
    rows = await query(
      `UPDATE complaints SET status=$2, resolved_at=CASE WHEN $2 IN ('COMPLETED','RESOLVED') THEN now() ELSE resolved_at END, resolved_by=CASE WHEN $2 IN ('COMPLETED','RESOLVED') THEN $3 ELSE resolved_by END WHERE id=$1 RETURNING *`,
      [complaintId, status, actor]
    )
  }
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
