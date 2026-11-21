import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const CSV_PATH = path.join(DATA_DIR, 'attendance.csv')
const PHOTOS_DIR = path.join(DATA_DIR, 'photos')

const HEADERS = 'staff_id,staff_name,zone,date_time,gps,photo_file\n'

function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.mkdirSync(PHOTOS_DIR, { recursive: true })
  if (!fs.existsSync(CSV_PATH)) {
    fs.writeFileSync(CSV_PATH, HEADERS)
  }
}

function csvEscape(v: string) {
  return `"${String(v).replace(/"/g, '""')}"`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { staffId, staffName, zone, timestamp, gps, photo } = body ?? {}

    if (!staffId || !staffName || !timestamp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    ensureDirs()

    // save photo if provided (data URL)
    let photoFile = ''
    if (typeof photo === 'string' && photo.startsWith('data:image')) {
      const matches = photo.match(/^data:image\/(\w+);base64,(.+)$/)
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]
        const safeName = `${staffId}_${Date.now()}.${ext}`
        fs.writeFileSync(path.join(PHOTOS_DIR, safeName), Buffer.from(matches[2], 'base64'))
        photoFile = `photos/${safeName}`
      }
    }

    const row = [
      staffId,
      csvEscape(staffName),
      csvEscape(zone || ''),
      csvEscape(timestamp),
      csvEscape(gps || ''),
      csvEscape(photoFile),
    ].join(',') + '\n'

    fs.appendFileSync(CSV_PATH, row)

    return NextResponse.json({ success: true, photoFile })
  } catch (err) {
    console.error('attendance save failed', err)
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 })
  }
}

function parseCsv(text: string) {
  const rows: string[][] = []
  let cur: string[] = [], field = '', inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else inQ = false }
      else field += c
    } else if (c === '"') inQ = true
    else if (c === ',') { cur.push(field); field = '' }
    else if (c === '\n') { cur.push(field); rows.push(cur); cur = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (field || cur.length) { cur.push(field); rows.push(cur) }
  return rows
}

function readRecords() {
  ensureDirs()
  const [header, ...rows] = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'))
  return rows.filter((r) => r.length > 1).map((r, i) => ({
    id: i + 1,
    staffId: r[0], staffName: r[1], zone: r[2], dateTime: r[3], gps: r[4], photoFile: r[5],
  }))
}

function writeRecords(records: ReturnType<typeof readRecords>) {
  const lines = records.map((r) => [
    r.staffId, csvEscape(r.staffName), csvEscape(r.zone), csvEscape(r.dateTime), csvEscape(r.gps), csvEscape(r.photoFile),
  ].join(','))
  fs.writeFileSync(CSV_PATH, HEADERS + lines.join('\n') + (lines.length ? '\n' : ''))
}

export async function GET(req: NextRequest) {
  ensureDirs()
  const csv = fs.readFileSync(CSV_PATH, 'utf8')
  if (new URL(req.url).searchParams.get('format') === 'json') {
    return NextResponse.json({ ok: true, records: readRecords() })
  }
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="attendance.csv"',
    },
  })
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, staffName, zone, dateTime, gps } = await req.json()
    const records = readRecords()
    const idx = records.findIndex((r) => r.id === Number(id))
    if (idx === -1) return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    records[idx] = { ...records[idx], staffName: staffName ?? records[idx].staffName, zone: zone ?? records[idx].zone, dateTime: dateTime ?? records[idx].dateTime, gps: gps ?? records[idx].gps }
    writeRecords(records)
    logActivitySafe(records[idx].staffName, 'Admin', 'Attendance Updated', `Record #${id} edited`)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const records = readRecords()
    const idx = records.findIndex((r) => r.id === Number(id))
    if (idx === -1) return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    const removed = records[idx]
    writeRecords(records.filter((r) => r.id !== Number(id)))
    logActivitySafe(removed.staffName, 'Admin', 'Attendance Deleted', `Record #${id} · ${removed.dateTime}`)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

function logActivitySafe(actor: string, role: string, action: string, details: string) {
  try {
    const logPath = path.join(DATA_DIR, 'activity_log.csv')
    const logHeader = 'id,timestamp,actor,role,action,details\n'
    if (!fs.existsSync(logPath)) fs.writeFileSync(logPath, logHeader)
    const rows = fs.readFileSync(logPath, 'utf8').trim().split('\n').slice(1)
    const ts = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`
    fs.appendFileSync(logPath, [rows.length + 1, esc(ts), esc(actor), esc(role), esc(action), esc(details)].join(',') + '\n')
  } catch {}
}
