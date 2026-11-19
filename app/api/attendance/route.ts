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

export async function GET() {
  ensureDirs()
  const csv = fs.readFileSync(CSV_PATH, 'utf8')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="attendance.csv"',
    },
  })
}
