'use client'

import { Suspense, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ZONE_NAMES } from '@/lib/zones'

const COMPLAINT_TYPES = ['Housekeeping', 'Electrical', 'Plumbing', 'HVAC', 'Waste Management', 'Other']

function RaiseComplaintForm() {
  const params = useSearchParams()
  const [complaintType, setComplaintType] = useState(params.get('service') || 'Housekeeping')
  const [zone, setZone] = useState(params.get('zone') || '')
  const [subArea, setSubArea] = useState(params.get('area') || params.get('location') || '')
  const [description, setDescription] = useState('')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const camRef = useRef<HTMLInputElement>(null)
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null)
  const [error, setError] = useState('')

  const canSubmit = name.trim() && mobile.trim().length >= 10 && description.trim()

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintType, zone, subArea, description, reportedBy: 'Citizen', name, mobile, photos }),
      })
      const data = await res.json()
      if (data.ok) setSubmitted({ id: data.id })
      else setError(data.error || 'Failed to submit. Please try again.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f3f5f8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-[#e8edf2] shadow-lg max-w-sm w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#e8f8ef] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-[18px] font-semibold text-[#111827]">Complaint Registered</h1>
          <p className="text-[13px] text-[#6b7280] mt-2">Your complaint <span className="font-semibold text-[#0e4c5e]">{submitted.id}</span> has been submitted successfully.</p>
          <p className="text-[12px] text-[#9ca3af] mt-1">Our team will review and resolve it at the earliest.</p>
          <button onClick={() => { setSubmitted(null); setDescription('') }} className="mt-5 w-full py-2.5 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a]">
            Register Another Complaint
          </button>
        </div>
      </div>
    )
  }

  const inputCls = 'w-full h-11 px-3.5 rounded-xl border border-[#e5e7eb] text-[14px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/40 focus:border-[#1b8f84]'
  const labelCls = 'block text-[12.5px] font-semibold text-[#374151] mb-1.5'

  return (
    <div className="min-h-screen bg-[#f3f5f8]">
      {/* Header */}
      <header className="bg-[#0b3c4a] px-5 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#7fd4c1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div>
            <h1 className="text-[16px] font-semibold text-white">BM360 Bharat Mandapam</h1>
            <p className="text-[11.5px] text-[#9ec3d0]">Raise a Service Complaint</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5 pb-10">
        {zone && (
          <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#e6f7f4] border border-[#b7e4d4]">
            <svg className="w-4 h-4 text-[#0f766e] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <p className="text-[12.5px] text-[#0f766e] font-medium">Scanned location: <span className="font-semibold">{zone}{subArea ? ` — ${subArea}` : ''}</span></p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#e8edf2] shadow-sm p-5 space-y-4">
          <div>
            <label className={labelCls}>Complaint Type <span className="text-[#dc2626]">*</span></label>
            <div className="flex flex-wrap gap-2">
              {COMPLAINT_TYPES.map((t) => (
                <button key={t} onClick={() => setComplaintType(t)} className={`px-3 py-1.5 rounded-full text-[12.5px] font-medium border transition-colors ${complaintType === t ? 'bg-[#0e4c5e] text-white border-[#0e4c5e]' : 'bg-white text-[#374151] border-[#e5e7eb] hover:bg-[#f8fafc]'}`}>{t}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Zone</label>
              <select value={zone} onChange={(e) => setZone(e.target.value)} className={inputCls}>
                <option value="">Select zone...</option>
                {ZONE_NAMES.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Sub-area / Spot</label>
              <input value={subArea} onChange={(e) => setSubArea(e.target.value)} placeholder="e.g. Main Entrance" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Describe the Issue <span className="text-[#dc2626]">*</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the problem in detail..." className={`${inputCls} h-auto py-2.5 resize-none`} />
          </div>

          <div>
            <label className={labelCls}>Attach Photos (Optional)</label>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
              const files = Array.from(e.target.files || [])
              files.forEach((f) => {
                const reader = new FileReader()
                reader.onload = () => setPhotos((p) => [...p, String(reader.result)].slice(0, 6))
                reader.readAsDataURL(f)
              })
              e.target.value = ''
            }} />
            <div className="flex gap-2">
              <button type="button" onClick={() => camRef.current?.click()} className="flex-1 py-2.5 text-[13px] font-semibold text-[#0f766e] bg-[#e6f7f4] border border-[#b7e4d4] rounded-xl hover:bg-[#d7f0ea] flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Take Photo
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} className="flex-1 py-2.5 text-[13px] font-semibold text-[#374151] bg-white border border-[#e5e7eb] rounded-xl hover:bg-[#f8fafc] flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Upload
              </button>
            </div>
            <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) {
                const reader = new FileReader()
                reader.onload = () => setPhotos((p) => [...p, String(reader.result)].slice(0, 6))
                reader.readAsDataURL(f)
              }
              e.target.value = ''
            }} />
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p} alt={`Attachment ${i + 1}`} className="w-16 h-16 rounded-lg object-cover border border-[#e8edf2]" />
                    <button type="button" onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#dc2626] text-white text-[10px] font-bold flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Your Name <span className="text-[#dc2626]">*</span></label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Mobile Number <span className="text-[#dc2626]">*</span></label>
              <input value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile" inputMode="numeric" className={inputCls} />
            </div>
          </div>

          {error && <p className="text-[12.5px] text-[#dc2626] font-medium">{error}</p>}

          <button onClick={handleSubmit} disabled={!canSubmit || submitting} className="w-full py-3 text-[14px] font-semibold text-white bg-[#0e4c5e] rounded-xl hover:bg-[#0b3c4a] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
          <p className="text-[11px] text-[#9ca3af] text-center">BM360 Bharat Mandapam Operations · Your complaint is logged for the agency team</p>
        </div>
      </main>
    </div>
  )
}

export default function RaiseComplaintPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f5f8]" />}>
      <RaiseComplaintForm />
    </Suspense>
  )
}
