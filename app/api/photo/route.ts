import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  const f = new URL(req.url).searchParams.get('f') || ''
  const safe = path.basename(f)
  const filePath = path.join(process.cwd(), 'data', 'photos', safe)
  if (!safe || !fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const ext = path.extname(safe).toLowerCase()
  const type = ext === '.png' ? 'image/png' : 'image/jpeg'
  return new NextResponse(fs.readFileSync(filePath), { headers: { 'Content-Type': type } })
}
