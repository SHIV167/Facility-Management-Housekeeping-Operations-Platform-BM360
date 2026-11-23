'use client'

import { useState } from 'react'
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

  if (!open || !complaint) return null

  const isCompleted = complaint.status === 'COMPLETED' || complaint.status === 'RESOLVED'
  const isPending = complaint.status === 'PENDING'

  const statusColor = isCompleted
    ? 'bg-[#e8f8ef] text-[#16a34a]'
    : isPending
    ? 'bg-[#fff7ed] text-[#ea580c]'
    : 'bg-[#f3f4f6] text-[#6b7280]'

  const photos = [
    { id: 1, label: 'ITPO Official (Before)', filename: `complaint_${complaint.id}_before.jpg`, uploadedBy: 'Brij Lal (ITPO Official)', uploadedAt: complaint.date || '—', size: '24.7 KB' },
    { id: 2, label: 'Agency (After)', filename: `complaint_${complaint.id}_after.jpg`, uploadedBy: 'Field Staff', uploadedAt: complaint.completionTime || complaint.date || '—', size: '28.3 KB' },
  ]

  const photo = photos[selectedPhoto]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
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
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title + priority/SLA */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h3 className="text-[18px] font-semibold text-[#111827] leading-snug flex-1 min-w-0">{complaint.title}</h3>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#fff7ed] border border-[#fed7aa] text-[#c2410c] text-[11.5px] font-semibold shrink-0">
              {(complaint as any).priority === 'URGENT' ? 'Urgent' : (complaint as any).priority === 'HIGH' ? 'High' : 'Normal'} Priority · 30 Min SLA
            </span>
          </div>

          {/* Work instructions */}
          {(complaint as any).description && (
            <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl px-4 py-3">
              <p className="text-[10.5px] font-semibold tracking-[0.06em] text-[#b45309] uppercase mb-1">Work Instructions &amp; Details</p>
              <p className="text-[13px] text-[#78350f] leading-relaxed">{(complaint as any).description}</p>
            </div>
          )}

          {/* Status banner */}
          <div className={`rounded-xl border p-4 ${isCompleted ? 'bg-[#e8f8ef] border-[#b7e4c7]' : 'bg-[#fff7ed] border-[#fed7aa]'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-[#16a34a]' : 'bg-[#ea580c]'}`}></div>
              <span className={`text-[15px] font-semibold ${isCompleted ? 'text-[#15803d]' : 'text-[#c2410c]'}`}>
                {isCompleted ? 'WORK FULLY COMPLETED' : isPending ? 'WORK PENDING' : 'IN PROGRESS'}
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

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: 'SERVICE CLASSIFICATION', value: complaint.service || 'Housekeeping Operations' },
              { label: 'FACILITY / CAMPUS', value: complaint.campus || 'Bharat Mandapam' },
              { label: 'OPERATIONAL LOCATION', value: `${complaint.location}`, sub: complaint.campus || 'Bharat Mandapam' },
              { label: 'ASSIGNED AGENCY', value: complaint.agency || 'Soni Facility Management' },
              { label: 'REPORTED / CREATED BY', value: (complaint as any).reportedBy || 'Brij Lal', sub: (complaint as any).reporterRole || 'ITPO Official' },
              { label: 'ACTIVITY CATALOG ITEM', value: complaint.service || 'Housekeeping Operations' },
              { label: 'OPERATIONAL LOCATION', value: `${complaint.location}`, sub: (complaint as any).subArea ? `Sub Area: ${(complaint as any).subArea}` : (complaint.campus || 'Bharat Mandapam') },
              { label: 'DUE DATE', value: complaint.dueDate || '—' },
              { label: 'CREATED AT', value: complaint.date || '—' },
              { label: 'RESOLVED AT', value: isCompleted ? ((complaint as any).resolvedAt ? new Date((complaint as any).resolvedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : (complaint.date || '—')) : '—' },
            ].map((item) => (
              <div key={item.label} className="bg-[#f8fafc] border border-[#e8edf2] rounded-xl px-4 py-3">
                <p className="text-[10.5px] font-semibold tracking-[0.06em] text-[#9ca3af] uppercase">{item.label}</p>
                <p className="text-[13.5px] font-semibold text-[#111827] mt-1">{item.value}</p>
                {item.sub && <p className="text-[11.5px] text-[#9ca3af] mt-0.5">{item.sub}</p>}
              </div>
            ))}
          </div>

          {/* Evidence Photos */}
          <div className="bg-[#f8fafc] border border-[#e8edf2] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[12px] font-semibold tracking-[0.05em] text-[#6b7280] uppercase">Site Evidence Photos ({photos.length})</h4>
              <button
                onClick={() => toast('Photo upload functionality')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0e4c5e] hover:bg-[#0b3c4a] text-white text-[12px] font-semibold rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Photo
              </button>
            </div>

            <div className="bg-white border border-[#e8edf2] rounded-xl p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#374151]">{photo.label}</span>
                  <span className="text-[12px] text-[#9ca3af]">{selectedPhoto + 1}/{photos.length}</span>
                </div>
              </div>
              <div className="aspect-video bg-[#f3f4f6] rounded-lg flex items-center justify-center border border-[#e8edf2] overflow-hidden">
                {(complaint as any).photo ? (
                  <img src={(complaint as any).photo} alt="Evidence" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-14 h-14 text-[#d1d5db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="border-t border-[#eef1f4] pt-3 mt-3 space-y-1">
                <p className="text-[11.5px] text-[#9ca3af]">Filename: {photo.filename}</p>
                <p className="text-[11.5px] text-[#9ca3af]">Uploaded by {photo.uploadedBy} · {photo.uploadedAt}</p>
                <p className="text-[11.5px] text-[#9ca3af]">Size: {photo.size}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {photos.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPhoto(idx)}
                  className={`px-4 py-2 rounded-lg border-2 text-[12.5px] font-medium transition-colors ${
                    selectedPhoto === idx
                      ? 'border-[#1b8f84] bg-[#e6f7f4] text-[#0f766e]'
                      : 'border-[#e5e7eb] bg-white text-[#374151] hover:border-[#cbd5e1]'
                  }`}
                >
                  {p.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Trail */}
          <div className="bg-[#f8fafc] border border-[#e8edf2] rounded-xl p-4">
            <h4 className="text-[12px] font-semibold tracking-[0.05em] text-[#6b7280] uppercase mb-3">Execution History & Audit Trail</h4>
            <div className="space-y-3">
              {history.length > 0 ? (
                history.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${item.action.includes('Closed') || item.action.includes('Completed') ? 'bg-[#16a34a]' : 'bg-[#ea580c]'}`}></div>
                    <div>
                      <p className="text-[13px] text-[#111827]">
                        <span className="font-semibold">{item.action}</span>
                        {item.by && <span className="text-[#6b7280]"> — by {item.by}</span>}
                      </p>
                      <p className="text-[11.5px] text-[#9ca3af]">{item.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                [
                  { action: 'Complaint Created', timestamp: complaint.date || '—', by: 'Brij Lal (ITPO)' },
                  ...(isCompleted
                    ? [{ action: 'Work Completed', timestamp: complaint.date || '—', by: complaint.agency || 'Field Staff' }]
                    : [{ action: 'Assigned to Agency', timestamp: complaint.date || '—', by: 'System' }]),
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full mt-1 bg-[#16a34a]"></div>
                    <div>
                      <p className="text-[13px] text-[#111827]">
                        <span className="font-semibold">{item.action}</span>
                        {item.by && <span className="text-[#6b7280]"> — by {item.by}</span>}
                      </p>
                      <p className="text-[11.5px] text-[#9ca3af]">{item.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f8fafc] border-t border-[#e8edf2] px-5 py-3.5 flex items-center justify-between shrink-0">
          <p className="text-[12px] text-[#9ca3af]">Tenant: Bharat Mandapam 360</p>
          <div className="flex items-center gap-2">
            {onStatusChange && !isCompleted && (
              <button
                onClick={() => onStatusChange('COMPLETED')}
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
