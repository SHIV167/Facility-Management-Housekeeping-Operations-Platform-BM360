'use client'

import { useState, useEffect, useRef } from 'react'

export interface StaffOption {
  id: number
  name: string
  zone: string
  phone?: string
  agency?: string
}

export interface AttendanceRecord {
  staffId: number
  staffName: string
  zone: string
  timestamp: string
  gps: string | null
  photo: string | null
  mobile?: string
  agency?: string
  accuracy?: string
  remarks?: string
}

interface AttendanceModalProps {
  open: boolean
  onClose: () => void
  staff: StaffOption[]
  markedIds?: number[]
  onMark: (record: AttendanceRecord) => void
}

const inputCls = 'w-full h-10 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/20 focus:border-[#1b8f84]'

export default function AttendanceModal({ open, onClose, staff, markedIds = [], onMark }: AttendanceModalProps) {
  const [photo, setPhoto] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState('')
  const [gps, setGps] = useState<string | null>(null)
  const [gpsAcc, setGpsAcc] = useState<string | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsDenied, setGpsDenied] = useState(false)
  const [now, setNow] = useState(new Date())
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // live clock
  useEffect(() => {
    if (!open) return
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [open])

  // camera lifecycle
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setCameraError('')
    setPhoto(null)
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      })
      .catch(() => {
        if (!cancelled) setCameraError('Camera unavailable — check permission or use a device with a front camera.')
      })
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [open])

  // auto-capture GPS with high accuracy when modal opens
  useEffect(() => {
    if (!open || !navigator.geolocation) return
    setGpsLoading(true)
    setGpsDenied(false)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps(`${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`)
        setGpsAcc(String(Math.round(pos.coords.accuracy)))
        setGpsLoading(false)
      },
      () => { setGpsDenied(true); setGpsLoading(false) },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }, [open])

  // reset on close
  useEffect(() => {
    if (!open) {
      setPhoto(null)
      setGps(null)
      setGpsAcc(null)
      setGpsDenied(false)
      setCameraError('')
    }
  }, [open])

  if (!open) return null

  const capture = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    setPhoto(canvas.toDataURL('image/jpeg', 0.8))
  }

  const retake = () => setPhoto(null)

  const captureGps = () => {
    if (!navigator.geolocation) {
      setGps('GPS not supported')
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps(`${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`)
        setGpsAcc(String(Math.round(pos.coords.accuracy)))
        setGpsDenied(false)
        setGpsLoading(false)
      },
      () => {
        setGps('GPS unavailable')
        setGpsDenied(true)
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  const availableStaff = staff.filter((s) => !markedIds.includes(s.id))
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null)
  const detectedStaff = availableStaff.find((s) => s.id === selectedStaffId) ?? availableStaff[0] ?? null

  const handleMark = () => {
    if (!detectedStaff) return
    onMark({
      staffId: detectedStaff.id,
      staffName: detectedStaff.name,
      zone: detectedStaff.zone,
      timestamp: now.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      gps,
      photo,
      mobile: detectedStaff.phone || '',
      agency: detectedStaff.agency || '',
      accuracy: gpsAcc || '',
      remarks: 'Daily attendance check-in',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0b3c4a] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <h2 className="text-[15px] font-bold leading-tight">Mark Daily Attendance</h2>
              <p className="text-[11px] text-[#9ec3d0] mt-0.5">Field Staff • BM360</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Staff selector */}
          <div className="bg-[#f8fafc] border border-[#e8edf2] rounded-xl px-4 py-3">
            <p className="text-[10.5px] font-semibold tracking-[0.06em] text-[#9ca3af] uppercase mb-2">Attendance For</p>
            <select
              value={detectedStaff?.id ?? ''}
              onChange={(e) => setSelectedStaffId(Number(e.target.value))}
              className="w-full h-10 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/20 focus:border-[#1b8f84]"
            >
              {availableStaff.length === 0 && <option value="">All staff marked today</option>}
              {availableStaff.map((s) => (
                <option key={s.id} value={s.id}>{s.name} · {s.zone}{s.agency ? ` · ${s.agency}` : ''}</option>
              ))}
            </select>
            {detectedStaff && (
              <p className="text-[11.5px] text-[#6b7280] mt-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {detectedStaff.name} · {detectedStaff.zone}
              </p>
            )}
          </div>
          {markedIds.length > 0 && availableStaff.length > 0 && (
            <p className="text-[11px] text-[#9ca3af] -mt-2">{markedIds.length} staff already marked today — auto-skipped.</p>
          )}

          {/* Camera */}
          <div>
            <label className="block text-[12.5px] font-semibold text-[#374151] mb-1.5">Front-Camera Photo</label>
            <div className="bg-[#0b3c4a] rounded-xl overflow-hidden relative">
              {photo ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="Captured attendance" className="w-full aspect-[4/3] object-cover" />
                  <button
                    onClick={retake}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/90 hover:bg-white text-[#0b3c4a] text-[12px] font-semibold rounded-lg transition-colors"
                  >
                    Retake Photo
                  </button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-[4/3] object-cover" />
                  {cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0b3c4a]/90 px-4">
                      <p className="text-[12.5px] text-[#fca5a5] text-center">{cameraError}</p>
                    </div>
                  )}
                  <button
                    onClick={capture}
                    disabled={!!cameraError}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-white bg-[#1b8f84] hover:bg-[#157f74] disabled:bg-[#6b7280] flex items-center justify-center transition-colors"
                    title="Capture photo"
                  >
                    <span className="w-8 h-8 rounded-full bg-white/90"></span>
                  </button>
                </>
              )}
            </div>
            <p className="text-[11px] text-[#9ca3af] mt-1.5">Capture front-camera photo with automatic date &amp; time (GPS optional).</p>
          </div>

          {/* Date/time + GPS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#f8fafc] border border-[#e8edf2] rounded-xl px-4 py-3">
              <p className="text-[10.5px] font-semibold tracking-[0.06em] text-[#9ca3af] uppercase">Date &amp; Time</p>
              <p className="text-[13px] font-semibold text-[#111827] mt-1">{now.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            </div>
            <div className="bg-[#f8fafc] border border-[#e8edf2] rounded-xl px-4 py-3">
              <p className="text-[10.5px] font-semibold tracking-[0.06em] text-[#9ca3af] uppercase">GPS Location</p>
              <div className="flex items-center justify-between mt-1">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium text-[#374151] truncate">{gps ?? (gpsLoading ? 'Acquiring GPS…' : gpsDenied ? 'GPS denied — tap Enable' : 'Auto-capturing…')}</p>
                  {gpsAcc && <p className="text-[10.5px] text-[#16a34a] font-medium">±{gpsAcc} m accuracy</p>}
                </div>
                <button
                  onClick={captureGps}
                  disabled={gpsLoading}
                  className={`shrink-0 ml-2 px-2.5 py-1 text-[11.5px] font-semibold rounded-md disabled:opacity-50 ${gps ? 'text-[#0f766e] bg-[#e6f7f4] hover:bg-[#d7f0ea]' : 'text-white bg-[#0e4c5e] hover:bg-[#0b3c4a]'}`}
                >
                  {gpsLoading ? 'Locating…' : gps ? 'Refresh' : 'Enable GPS'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f8fafc] border-t border-[#e8edf2] px-5 py-3.5 flex items-center justify-between shrink-0">
          <p className="text-[12px] text-[#9ca3af]">BM360 • Bharat Mandapam</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-[#e5e7eb] bg-white text-[#374151] rounded-lg text-[13px] font-medium hover:bg-[#f3f5f8] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleMark}
              disabled={!detectedStaff}
              className="px-4 py-2 bg-[#0e4c5e] hover:bg-[#0b3c4a] disabled:bg-[#9ca3af] disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-semibold transition-colors"
            >
              Mark Attendance
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
