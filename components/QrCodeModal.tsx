'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { ZONE_NAMES } from '@/lib/zones'
import { QrRecord, QR_SIZE_OPTIONS, buildQrPayload } from '@/lib/qrcodes'

interface Props {
  open: boolean
  onClose: () => void
  editing: QrRecord | null
  onSave: (record: QrRecord) => void
}

const inputCls = 'w-full h-10 px-3 rounded-lg border border-[#e5e7eb] text-[13px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/40 focus:border-[#1b8f84]'
const labelCls = 'block text-[12px] font-semibold text-[#374151] mb-1.5'

export default function QrCodeModal({ open, onClose, editing, onSave }: Props) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'complaint' | 'custom'>('complaint')
  const [zone, setZone] = useState('')
  const [url, setUrl] = useState('')
  const [fgColor, setFgColor] = useState('#0b3c4a')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [size, setSize] = useState(220)
  const [preview, setPreview] = useState('')
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (!open) return
    setOrigin(window.location.origin)
    if (editing) {
      setTitle(editing.title)
      setType(editing.type)
      setZone(editing.zone || '')
      setUrl(editing.url || '')
      setFgColor(editing.fgColor)
      setBgColor(editing.bgColor)
      setSize(editing.size)
    } else {
      setTitle(''); setType('complaint'); setZone(''); setUrl('')
      setFgColor('#0b3c4a'); setBgColor('#ffffff'); setSize(220)
    }
  }, [open, editing])

  const payload = type === 'complaint'
    ? (zone ? `${origin}/raise-complaint?zone=${encodeURIComponent(zone)}` : `${origin}/raise-complaint`)
    : url

  useEffect(() => {
    if (!open || !payload) { setPreview(''); return }
    QRCode.toDataURL(payload, { width: size, margin: 1, color: { dark: fgColor, light: bgColor } })
      .then(setPreview)
      .catch(() => setPreview(''))
  }, [open, payload, fgColor, bgColor, size])

  if (!open) return null

  const canSave = title.trim() && (type === 'custom' ? url.trim() : true)

  const handleSave = () => {
    if (!canSave) return
    onSave({
      id: editing?.id || `QR-${Date.now()}`,
      title: title.trim(),
      type,
      zone: type === 'complaint' ? zone || undefined : undefined,
      url: type === 'custom' ? url.trim() : undefined,
      fgColor,
      bgColor,
      size,
      status: editing?.status || 'Active',
      createdAt: editing?.createdAt || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0b1f2a]/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 bg-[#0b3c4a] rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#7fd4c1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 14h3v3h-3zM21 14v3M14 21h3M18 18h3v3" /></svg>
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-white">{editing ? 'Edit QR Code' : 'Generate QR Code'}</h2>
              <p className="text-[11px] text-[#9ec3d0]">Create printable codes for zones, gates, or any link</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9ec3d0] hover:bg-white/10 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Form */}
            <div className="px-5 py-4 space-y-4 border-r border-[#eef1f4]">
              <div>
                <label className={labelCls}>Title <span className="text-[#dc2626]">*</span></label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Hall 14 Entrance QR" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>QR Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {([['complaint', 'Complaint Form Link'], ['custom', 'Custom URL']] as const).map(([v, l]) => (
                    <button key={v} onClick={() => setType(v)} className={`px-3 py-2 rounded-lg border text-[12.5px] font-semibold transition-colors ${type === v ? 'bg-[#0e4c5e] text-white border-[#0e4c5e]' : 'bg-white text-[#374151] border-[#e5e7eb] hover:bg-[#f8fafc]'}`}>{l}</button>
                  ))}
                </div>
              </div>

              {type === 'complaint' ? (
                <div>
                  <label className={labelCls}>Zone</label>
                  <select value={zone} onChange={(e) => setZone(e.target.value)} className={inputCls}>
                    <option value="">All Zones / General</option>
                    {ZONE_NAMES.map((z) => <option key={z} value={z}>{z}</option>)}
                  </select>
                  <p className="text-[10.5px] text-[#9ca3af] mt-1 font-mono break-all">{origin}/raise-complaint{zone ? `?zone=${encodeURIComponent(zone)}` : ''}</p>
                </div>
              ) : (
                <div>
                  <label className={labelCls}>Target URL <span className="text-[#dc2626]">*</span></label>
                  <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className={inputCls} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Foreground</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-9 h-9 rounded-lg border border-[#e5e7eb] cursor-pointer p-0.5" />
                    <input value={fgColor} onChange={(e) => setFgColor(e.target.value)} className={`${inputCls} flex-1 font-mono`} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-9 h-9 rounded-lg border border-[#e5e7eb] cursor-pointer p-0.5" />
                    <input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className={`${inputCls} flex-1 font-mono`} />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Size (px)</label>
                <div className="flex gap-2">
                  {QR_SIZE_OPTIONS.map((s) => (
                    <button key={s} onClick={() => setSize(s)} className={`flex-1 py-1.5 rounded-lg border text-[12px] font-semibold ${size === s ? 'bg-[#0e4c5e] text-white border-[#0e4c5e]' : 'bg-white text-[#374151] border-[#e5e7eb] hover:bg-[#f8fafc]'}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="px-5 py-4 flex flex-col items-center justify-center bg-[#f8fafc]">
              <p className="text-[11px] font-semibold tracking-[0.06em] text-[#9ca3af] mb-3 self-start">LIVE PREVIEW</p>
              <div className="bg-white p-4 rounded-xl border border-[#e8edf2] shadow-sm">
                {preview ? <img src={preview} alt="QR preview" style={{ width: Math.min(size, 220), height: Math.min(size, 220) }} /> : <div className="w-[160px] h-[160px] rounded bg-[#f3f4f6]" />}
              </div>
              <p className="text-[10.5px] text-[#9ca3af] mt-3 text-center break-all px-2 font-mono">{payload || 'Enter details to preview'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#eef1f4] shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f8fafc]">Cancel</button>
          <button onClick={handleSave} disabled={!canSave} className="px-4 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
            {editing ? 'Save Changes' : 'Generate & Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
