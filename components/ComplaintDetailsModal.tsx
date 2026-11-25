'use client'

import { useState, useRef, useEffect } from 'react'
import { useToast } from '@/components/Toast'

export interface ComplaintData {
  id: number
  date?: string
  title: string
  status: string
  completionTime?: string
  location: string
  campus?: string
  service?: string
  agency?: string
  dueDate?: string
  photo?: string | null
}

interface ComplaintUpdate {
  action: string
  timestamp: string
  by: string
}

interface ComplaintDetailsModalProps {
  open: boolean
  onClose: () => void
  complaint: ComplaintData | null
  history?: ComplaintUpdate[]
  onStatusChange?: (status: 'PENDING' | 'COMPLETED') => void
}

export default function ComplaintDetailsModal({ open, onClose, complaint, history = [], onStatusChange }: ComplaintDetailsModalProps) {
  const { toast } = useToast()
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [extraPhotos, setExtraPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const camRef = useRef<HTMLInputElement>(null)
  const [now, setNow] = useState(Date.now())
  const breachedRef = useRef(false)

  const dueRaw = (complaint as any)?.dueDate || (complaint as any)?.due_date || ''
  const dueMs = dueRaw ? new Date(dueRaw).getTime() : NaN
  const hasDue = !isNaN(dueMs)
  const remaining = hasDue ? dueMs - now : null
  const statusDone = complaint?.status === 'COMPLETED' || complaint?.status === 'RESOLVED'
  const breached = hasDue && remaining !== null && remaining <= 0 && !statusDone

  useEffect(() => {
    if (!open) return
    breachedRef.current = false
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [open, complaint?.id])

  useEffect(() => {
    if (breached && !breachedRef.current) {
      breachedRef.current = true
      toast(`SLA BREACHED — ${complaint?.title || 'complaint'} response window ended`, 'error')
    }
  }, [breached])

  if (!open || !complaint) return null

  const isCompleted = complaint.status === 'COMPLETED' || complaint.status === 'RESOLVED'
  const isPending = complaint.status === 'PENDING'

  const statusColor = isCompleted
    ? 'bg-[#e8f8ef] text-[#16a34a]'
    : isPending
    ? 'bg-[#fff7ed] text-[#ea580c]'
    : 'bg-[#f3f4f6] text-[#6b7280]'

  const dbPhotos: string[] = [...(((complaint as any).photos && Array.isArray((complaint as any).photos) ? (complaint as any).photos : [])), ...extraPhotos, (complaint as any).photo].filter(Boolean)
  const photos = dbPhotos.length
    ? dbPhotos.map((src, i) => ({ id: i + 1, src, label: i === 0 ? 'ITPO Official (Before)' : 'Agency Evidence', filename: String(src).split('file=')[1] || `photo_${i + 1}`, uploadedBy: i === 0 ? 'ITPO Official' : 'Agency Staff', uploadedAt: complaint.date || '—', size: '—' }))
    : [{ id: 1, src: '', label: 'ITPO Official (Before)', filename: `complaint_${complaint.id}_before.jpg`, uploadedBy: 'Brij Lal (ITPO Official)', uploadedAt: complaint.date || '—', size: '—' }]

  const photo = photos[Math.min(selectedPhoto, photos.length - 1)]

  const uploadPhoto = (files: FileList | null) => {
    if (!files?.length) return
    const file = files[0]
    if (!file.type.startsWith('image/')) { toast('Please select an image file', 'error'); return }
    if (file.size > 5 * 1024 * 1024) { toast('Image too large — max 5MB', 'error'); return }
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = String(reader.result)
      setUploading(true)
      try {
        const res = await fetch('/api/complaints', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: complaint.id, addPhotos: [dataUrl], actor: 'Agency', role: 'Agency' }),
        })
        const d = await res.json().catch(() => ({}))
        if (!res.ok || !d.ok) { toast(d.error || 'Upload failed', 'error'); return }
        setExtraPhotos((prev) => [...prev, ...(d.photos || []).slice(-1)])
        setSelectedPhoto(photos.length)
        toast('Photo uploaded successfully', 'success')
      } catch { toast('Upload failed', 'error') } finally { setUploading(false) }
    }
    reader.readAsDataURL(file)
  }

  const markCompleted = () => {
    if (dbPhotos.length === 0) {
      toast('Photo is mandatory — upload site evidence before closing this complaint', 'error')
      fileRef.current?.click()
      return
    }
    onStatusChange?.('COMPLETED')
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0b3c4a] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold leading-tight">OPERATIONAL WORK DETAILS</h2>
              <p className="text-[11px] text-[#9ec3d0] mt-0.5">Complaint Register • BM360</p>
            </div>
            <span className="text-[13px] text-[#9ec3d0]">#{complaint.id}</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusColor}`}>{complaint.status}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_168px] gap-5">
            {/* Left column: operational details */}
            <div className="space-y-4">
              {/* Title + priority/SLA */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h3 className="text-[18px] font-semibold text-[#111827] leading-snug flex-1 min-w-0">{complaint.title}</h3>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[11.5px] font-semibold ${breached ? 'bg-[#fef2f2] border-[#fecaca] text-[#dc2626]' : 'bg-[#fff7ed] border-[#fed7aa] text-[#c2410c]'}`}>
                    {(complaint as any).priority === 'URGENT' ? 'Urgent' : (complaint as any).priority === 'HIGH' ? 'High' : 'Normal'} Priority · {(complaint as any).slaMinutes || 30} Min SLA
                  </span>
                  {hasDue && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-bold ${breached ? 'bg-[#dc2626] text-white animate-pulse' : remaining !== null && remaining < 15 * 60000 ? 'bg-[#fff7ed] border border-[#fed7aa] text-[#c2410c]' : 'bg-[#e6f7f4] border border-[#bfe8e2] text-[#0f766e]'}`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {breached ? 'SLA BREACHED' : remaining !== null && remaining > 0
                        ? `SLA: ${Math.floor(remaining / 3600000)}h ${Math.floor((remaining % 3600000) / 60000)}m ${Math.floor((remaining % 60000) / 1000)}s left`
                        : 'SLA: —'}
                    </span>
                  )}
                </div>
              </div>

              {/* Work instructions */}
              {(complaint as any).description && (
                <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl px-4 py-3">
                  <p className="text-[10.5px] font-semibold tracking-[0.06em] text-[#b45309] uppercase mb-1">WORK INSTRUCTIONS &amp; DETAILS</p>
                  <p className="text-[13px] text-[#78350f] leading-relaxed">{(complaint as any).description}</p>
                </div>
              )}

              {/* Status banner */}
              <div className={`rounded-xl border p-4 ${isCompleted ? 'bg-[#e8f8ef] border-[#b7e4c7]' : 'bg-[#fff7ed] border-[#fed7aa]'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-[#16a34a]' : 'bg-[#ea580c]'}`}></div>
                  <span className={`text-[15px] font-semibold ${isCompleted ? 'text-[#15803d]' : 'text-[#c2410c]'}`}>
                    {isCompleted ? 'Completed' : isPending ? 'Pending' : 'In Progress'}
                  </span>
                </div>
                <p className="text-[12.5px] text-[#6b7280] mt-2 ml-6">
                  Current Workflow State:{' '}
                  <span className={`font-medium ${isCompleted ? 'text-[#16a34a]' : 'text-[#ea580c]'}`}>
                    {isCompleted ? 'Completed' : complaint.status}
                  </span>
                </p>
                {complaint.completionTime && (
                  <p className="text-[12.5px] text-[#6b7280] mt-1 ml-6">{complaint.completionTime}</p>
                )}
              </div>

              {/* Details list */}
              <div className="space-y-3">
                {[
                  { label: 'ASSIGNED AGENCY', value: complaint.agency && complaint.agency !== '—' ? complaint.agency : 'Unassigned' },
                  { label: 'REPORTED / CREATED BY', value: (complaint as any).reportedBy || 'Brij Lal', sub: (complaint as any).reporterRole || 'ITPO Official' },
                  { label: 'SERVICE CLASSIFICATION', value: complaint.service || 'Housekeeping Operations' },
                  { label: 'FACILITY / CAMPUS', value: complaint.campus || 'Bharat Mandapam' },
                  { label: 'OPERATIONAL LOCATION', value: `${complaint.location}`, sub: (complaint as any).subArea ? `Sub Area: ${(complaint as any).subArea}` : (complaint.campus || 'Bharat Mandapam') },
                  { label: 'ACTIVITY CATALOG ITEM', value: complaint.service || 'Housekeeping Operations' },
                  { label: 'OPERATIONAL SCHEDULE & SLA TARGETS', isSection: true },
                  { label: 'CREATED AT', value: complaint.date || '—', indent: true },
                  { label: 'TARGET DUE TIME', value: complaint.dueDate || '—', indent: true },
                ].map((item) => (
                  item.isSection ? (
                    <div key={item.label} className="bg-[#f8fafc] border border-[#e8edf2] rounded-xl px-4 py-3">
                      <p className="text-[12px] font-semibold tracking-[0.05em] text-[#6b7280] uppercase">{item.label}</p>
                    </div>
                  ) : (
                    <div key={item.label} className={`bg-[#f8fafc] border border-[#e8edf2] rounded-xl px-4 py-3 ${item.indent ? 'ml-4' : ''}`}>
                      <p className="text-[10.5px] font-semibold tracking-[0.06em] text-[#9ca3af] uppercase">{item.label}</p>
                      <p className="text-[13.5px] font-semibold text-[#111827] mt-1">{item.value}</p>
                      {item.sub && <p className="text-[11.5px] text-[#9ca3af] mt-0.5">{item.sub}</p>}
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Right column: Site Evidence Photos */}
            <div className="bg-[#f8fafc] border border-[#e8edf2] rounded-xl p-4 lg:sticky lg:top-0">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[12px] font-semibold tracking-[0.05em] text-[#6b7280] uppercase">SITE EVIDENCE PHOTOS ({photos.length})</h4>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { uploadPhoto(e.target.files); e.target.value = '' }} />
                <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { uploadPhoto(e.target.files); e.target.value = '' }} />
                <button
                  onClick={() => camRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#b7e4d4] text-[#0f766e] hover:bg-[#e6f7f4] text-[12px] font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Take Photo
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0e4c5e] hover:bg-[#0b3c4a] text-white text-[12px] font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>

              <div className="grid grid-cols-[1fr_72px] gap-3">
                {/* Main viewer */}
                <div className="bg-white border border-[#e8edf2] rounded-xl p-3">
                  <div className="aspect-video bg-[#f3f4f6] rounded-lg flex items-center justify-center border border-[#e8edf2] overflow-hidden">
                    {photo.src ? (
                      <img src={photo.src} alt={photo.label} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-14 h-14 text-[#d1d5db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="mt-2.5 space-y-0.5">
                    <p className="text-[12.5px] font-semibold text-[#111827]">{photo.label} <span className="text-[#9ca3af] font-normal">· {selectedPhoto + 1}/{photos.length}</span></p>
                    <p className="text-[11px] text-[#9ca3af] truncate">{photo.filename} · {photo.uploadedBy} · {photo.uploadedAt}</p>
                  </div>
                  {photo.src && (
                    <a href={photo.src} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#0f766e] hover:underline">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      Open full size
                    </a>
                  )}
                </div>
                {/* Thumbnail strip — right side */}
                <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[240px]">
                  {photos.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPhoto(idx)}
                      className={`shrink-0 sm:w-full rounded-lg border-2 overflow-hidden text-left transition-colors ${
                        selectedPhoto === idx
                          ? 'border-[#1b8f84] bg-[#e6f7f4]'
                          : 'border-[#e5e7eb] bg-white hover:border-[#cbd5e1]'
                      }`}
                    >
                      <div className="w-full h-14 sm:h-16 bg-[#f3f4f6] flex items-center justify-center overflow-hidden">
                        {p.src ? (
                          <img src={p.src} alt={p.label} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-[#d1d5db]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        )}
                      </div>
                      <p className={`px-1.5 py-1 text-[10px] leading-tight truncate ${selectedPhoto === idx ? 'text-[#0f766e] font-semibold' : 'text-[#6b7280]'}`}>{p.label.split(' ')[0]}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#e8edf2]">
                <p className="text-[11px] font-semibold tracking-[0.05em] text-[#6b7280] uppercase mb-2">SELECT PHOTO PREVIEW ({photos.length})</p>
                <div className="flex gap-2 overflow-x-auto">
                  {photos.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPhoto(idx)}
                      className={`shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-colors ${
                        selectedPhoto === idx
                          ? 'border-[#1b8f84] bg-[#e6f7f4]'
                          : 'border-[#e5e7eb] bg-white hover:border-[#cbd5e1]'
                      }`}
                    >
                      <div className="w-full h-full bg-[#f3f4f6] flex items-center justify-center overflow-hidden">
                        {p.src ? (
                          <img src={p.src} alt={p.label} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-[#d1d5db]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f8fafc] border-t border-[#e8edf2] px-5 py-3.5 flex items-center justify-between shrink-0">
          <p className="text-[12px] text-[#9ca3af]">Tenant: Bharat Mandapam 360</p>
          <div className="flex items-center gap-2">
            {onStatusChange && !isCompleted && (
              <button
                onClick={markCompleted}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-lg text-[13px] font-semibold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Mark Completed
              </button>
            )}
            {onStatusChange && isCompleted && (
              <button
                onClick={() => onStatusChange('PENDING')}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] rounded-lg text-[13px] font-semibold hover:bg-[#ffedd5] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Reopen
              </button>
            )}
            <button
              onClick={() => { const p = (complaint as any).photo; if (p) { const a = document.createElement('a'); a.href = p; a.download = `complaint_${complaint.id}.jpg`; a.click() } else toast('No photo attached to this complaint') }}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#e5e7eb] bg-white text-[#374151] rounded-lg text-[13px] font-medium hover:bg-[#f3f5f8] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Download Photo
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#0e4c5e] hover:bg-[#0b3c4a] text-white rounded-lg text-[13px] font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
