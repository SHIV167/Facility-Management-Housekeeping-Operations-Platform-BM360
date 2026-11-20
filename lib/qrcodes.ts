export type QrType = 'complaint' | 'custom'

export interface QrRecord {
  id: string
  title: string
  type: QrType
  zone?: string
  url?: string
  fgColor: string
  bgColor: string
  size: number
  status: 'Active' | 'Inactive'
  createdAt: string
}

export const QR_SIZE_OPTIONS = [128, 180, 220, 300]

export function buildQrPayload(record: Pick<QrRecord, 'type' | 'zone' | 'url'>, origin: string): string {
  if (record.type === 'complaint' && record.zone) {
    return `${origin}/raise-complaint?zone=${encodeURIComponent(record.zone)}`
  }
  return record.url || `${origin}/raise-complaint`
}

const STORAGE_KEY = 'bm360_qr_records'

export function loadQrRecords(): QrRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as QrRecord[]) : []
  } catch {
    return []
  }
}

export function saveQrRecords(records: QrRecord[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {}
}
