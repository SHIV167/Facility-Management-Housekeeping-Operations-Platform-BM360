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
    if (!m || m[2].length > 7_000_000) return ''
    const ext = m[1] === 'jpeg' ? 'jpg' : m[1]
    const fname = `complaint_${tag}_${Date.now()}_${i}.${ext}`
    const b64 = m[2]
    fs.writeFileSync(path.join(PHOTOS_DIR, fname), Buffer.from(b64, 'base64'))
    // persist to DB so photos survive Render redeploys (ephemeral disk)
    query(`INSERT INTO media_files (name, data, mime) VALUES ($1,$2,$3) ON CONFLICT (name) DO NOTHING`, [fname, b64, `image/${ext === 'jpg' ? 'jpeg' : ext}`]).catch(() => {})
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
  const complaints = rows.map((c: any) => ({
    ...c,
    dueDate: c.due_date ? new Date(c.due_date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—',
  }))
  return NextResponse.json({ ok: true, complaints })
}

export async function POST(req: NextRequest) {
  const b = await req.json()
  const pub = await queryOne<{ next: string }>(
    `SELECT 'CMP-' || lpad((COALESCE(MAX(id),0)+1)::text, 4, '0') AS next FROM complaints`
  )
  const prio = String(b.priority || '').toLowerCase()
  const slaMin = /urgent|high|p1|immediate/.test(prio) ? 30 : 60
  const dueTs = new Date(Date.now() + slaMin * 60000)
  const dueIso = dueTs.toISOString()
  // Store as ISO string for TIMESTAMPTZ column
  const due = dueIso
  const source = String(b.source || b.reportedBy || b.reported_by || 'Citizen')
  const reporterRole = source === 'itpo' ? 'ITPO Official' : source === 'agency' ? 'Agency' : source === 'admin' ? 'Admin' : 'Citizen'
  const reporterName = b.name || b.reporter_name || (reporterRole === 'ITPO Official' ? 'ITPO Official' : reporterRole === 'Agency' ? 'Agency Staff' : reporterRole === 'Admin' ? 'System Admin' : 'Citizen')
  // Save uploaded photos first so we can tag files with the complaint id
  let photoPaths: string[] = []
  try {
    photoPaths = savePhotos(Array.isArray(b.photos) ? b.photos : (b.photo ? [b.photo] : []), 'pending')
  } catch { /* non-blocking — photos optional */ }
  const assignedOfficialId = b.assignedOfficialId || b.assigned_official_id || null
  const agencyId = b.agencyId || b.agency_id || null
  const agencyName = b.agencyName || b.agency_name || ''
  // (column, value) pairs — status is a literal, rest are params $1..$n
  let fields: [string, any][] = [
    ['public_id', pub?.next],
    ['title', b.title || b.description?.slice(0, 60) || 'Citizen Complaint'],
    ['complaint_type', b.complaintType || b.complaint_type || 'General'],
    ['zone', b.zone || ''],
    ['sub_area', b.subArea || b.sub_area || ''],
    ['description', b.description || ''],
    ['service', b.service || ''],
    ['reported_by', reporterRole],
    ['reporter_name', reporterName],
    ['reporter_mobile', b.mobile || b.reporter_mobile || ''],
    ['photo_url', photoPaths[0] || null],
    ['photos', JSON.stringify(photoPaths)],
    ['assigned_official_id', assignedOfficialId],
    ['agency_id', agencyId],
    ['agency_name', agencyName],
    ['priority', b.priority || 'MEDIUM'],
    ['sla_minutes', slaMin],
  ]
  let rows: any[] = []
  let lastErr: any = null
  // Try progressive column-drop: missing columns get removed, retry
  for (let attempt = 0; attempt < fields.length + 2; attempt++) {
    const cols = fields.map(([c]) => c)
    const vals = fields.map(([, v]) => v)
    const ph = vals.map((_, i) => `$${i + 1}`).join(',')
    try {
      rows = await query(
        `INSERT INTO complaints (${cols.join(',')}, status) VALUES (${ph},'PENDING') RETURNING *`,
        vals
      )
      break
    } catch (e: any) {
      lastErr = e
      const m = String(e?.message || '').match(/column "?(\w+)"? does not exist/i)
      if (m) {
        const idx = fields.findIndex(([c]) => c === m[1])
        if (idx >= 0) { fields.splice(idx, 1); continue }
      }
      break
    }
  }
  // Last-resort minimal insert — core columns only
  if (!rows.length) {
    try {
      rows = await query(
        `INSERT INTO complaints (public_id, title, complaint_type, zone, description, service, reported_by, reporter_name, reporter_mobile, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'PENDING') RETURNING *`,
        [pub?.next, b.title || b.description?.slice(0, 60) || 'Citizen Complaint', b.complaintType || b.complaint_type || 'General', b.zone || '', b.description || '', b.service || '', reporterRole, reporterName, b.mobile || b.reporter_mobile || '']
      )
    } catch (e2) {
      throw lastErr || e2 || new Error('complaint insert failed')
    }
  }
  const c = rows[0]
  // Try to set due_date separately in case column type mismatch caused 500
  if (c.id) {
    query(`UPDATE complaints SET due_date=$1 WHERE id=$2`, [dueIso, c.id]).catch(() => {
      query(`UPDATE complaints SET due_date=$1 WHERE id=$2`, [due, c.id]).catch(() => {})
    })
  }
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
  // Append evidence photos to an existing complaint
  if (b.addPhotos?.length) {
    const cur = await queryOne<any>('SELECT photos, photo_url FROM complaints WHERE id=$1', [complaintId])
    if (!cur) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    const existing: string[] = Array.isArray(cur.photos) ? cur.photos : (cur.photo_url ? [cur.photo_url] : [])
    const added = savePhotos(b.addPhotos, String(complaintId))
    const merged = [...existing, ...added]
    await query('UPDATE complaints SET photos=$2, photo_url=COALESCE(photo_url,$3), updated_at=now() WHERE id=$1', [complaintId, JSON.stringify(merged), merged[0] || null]).catch(async () => {
      await query('UPDATE complaints SET photo_url=$2 WHERE id=$1', [complaintId, merged[0] || null]).catch(() => {})
    })
    await query(`INSERT INTO complaint_updates (complaint_id, action, actor, role, details) VALUES ($1,'Photo Added',$2,$3,$4)`,
      [complaintId, b.actor || 'Agency', b.role || 'Agency', `${added.length} evidence photo(s) uploaded`]).catch(() => {})
    return NextResponse.json({ ok: true, photos: merged })
  }
  // Full edit mode — update any provided fields
  if (b.edit) {
    const rows = await query(
      `UPDATE complaints SET title=$2, complaint_type=$3, zone=$4, sub_area=$5, description=$6, service=$7, due_date=$8, status=$9, priority=$10, sla_minutes=$11, agency_id=$12, agency_name=$13, updated_at=now() WHERE id=$1 RETURNING *`,
      [complaintId, b.title ?? '', b.complaintType ?? b.complaint_type ?? 'General', b.zone ?? '', b.subArea ?? b.sub_area ?? '', b.description ?? '', b.service ?? '', b.dueDate ?? b.due_date ?? '', b.status ?? 'PENDING', b.priority ?? 'MEDIUM', b.slaMinutes ?? 60, b.agencyId ?? b.agency_id ?? null, b.agencyName ?? b.agency_name ?? '']
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
