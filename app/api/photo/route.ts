import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams
  const f = params.get('f') || params.get('file') || ''
  const safe = path.basename(f)
  const filePath = path.join(process.cwd(), 'data', 'photos', safe)
  const ext = path.extname(safe).toLowerCase()
  const type = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
  if (safe && fs.existsSync(filePath)) {
    return new NextResponse(fs.readFileSync(filePath), { headers: { 'Content-Type': type } })
  }
  // fallback: serve from PostgreSQL media_files (Render ephemeral disk)
  try {
    const { queryOne } = await import('@/lib/db')
    const row = await queryOne<any>('SELECT data, mime FROM media_files WHERE name=$1', [safe])
    if (row?.data) {
      return new NextResponse(Buffer.from(row.data, 'base64'), { headers: { 'Content-Type': row.mime || type } })
    }
  } catch {}
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
