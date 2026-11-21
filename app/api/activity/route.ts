import { NextRequest, NextResponse } from 'next/server'
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')
const CSV_PATH = join(DATA_DIR, 'activity_log.csv')
const HEADER = 'id,timestamp,actor,role,action,details\n'

function ensureCsv() {
  mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(CSV_PATH)) appendFileSync(CSV_PATH, HEADER)
}

const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`

export async function POST(req: NextRequest) {
  try {
    const { actor, role, action, details } = await req.json()
    if (!action) return NextResponse.json({ ok: false }, { status: 400 })
    ensureCsv()
    const rows = readFileSync(CSV_PATH, 'utf8').trim().split('\n').slice(1)
    const id = rows.length + 1
    const timestamp = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    appendFileSync(CSV_PATH, [id, esc(timestamp), esc(actor || 'System'), esc(role || 'System'), esc(action), esc(details || '')].join(',') + '\n')
    return NextResponse.json({ ok: true, id })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
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

export async function GET(req: NextRequest) {
  ensureCsv()
  const csv = readFileSync(CSV_PATH, 'utf8')
  if (new URL(req.url).searchParams.get('download') === 'csv') {
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="activity_log.csv"' },
    })
  }
  const [header, ...rows] = parseCsv(csv)
  const logs = rows.filter((r) => r.length > 1).map((r) => ({
    id: Number(r[0]), timestamp: r[1], actor: r[2], role: r[3], action: r[4], details: r[5] || '',
  }))
  return NextResponse.json({ ok: true, logs })
}
