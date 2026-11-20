import { NextRequest, NextResponse } from 'next/server'
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')
const CSV_PATH = join(DATA_DIR, 'complaints.csv')
const HEADER = 'id,complaint_type,zone,sub_area,description,reported_by,name,mobile,created_at,status\n'

function ensureCsv() {
  mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(CSV_PATH)) appendFileSync(CSV_PATH, HEADER)
}

const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { complaintType, zone, subArea, description, reportedBy, name, mobile } = body ?? {}
    if (!name || !mobile) {
      return NextResponse.json({ ok: false, error: 'Name and mobile are required' }, { status: 400 })
    }
    ensureCsv()
    const rows = readFileSync(CSV_PATH, 'utf8').trim().split('\n').slice(1)
    const id = rows.length + 1
    const createdAt = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    const line = [
      id,
      esc(complaintType || 'General'),
      esc(zone || ''),
      esc(subArea || ''),
      esc(description || ''),
      esc(reportedBy || 'Citizen'),
      esc(name),
      esc(mobile),
      esc(createdAt),
      'Submitted',
    ].join(',') + '\n'
    appendFileSync(CSV_PATH, line)
    return NextResponse.json({ ok: true, id: `CMP-${String(id).padStart(4, '0')}` })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Failed to save complaint' }, { status: 500 })
  }
}

export async function GET() {
  ensureCsv()
  const csv = readFileSync(CSV_PATH, 'utf8')
  return new NextResponse(csv, {
    headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="complaints.csv"' },
  })
}
