'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { logActivity } from '@/lib/activity'
import { useToast } from '@/components/Toast'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  source?: 'itpo' | 'agency' | 'citizen' | 'admin'
  officialId?: number
  reporterName?: string
}

const ZONE_OPTIONS = [
  { label: 'Hall 1-5', value: 'hall1-5' },
  { label: 'Hall 6-10', value: 'hall6-10' },
  { label: 'Hall 11-14', value: 'hall11-14' },
  { label: 'Parking Area', value: 'parking' },
  { label: 'Admin Building', value: 'admin' },
]

const SERVICE_OPTIONS = ['housekeeping', 'electrical', 'plumbing', 'hvac']

function normalizeKey(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function parseScannedData(text: string) {
  const data: Record<string, string> = {}
  const trimmed = text.trim()
  try {
    const json = JSON.parse(trimmed)
    Object.entries(json).forEach(([k, v]) => { data[k.toLowerCase()] = String(v) })
  } catch {
    if (trimmed.includes('|')) {
      const parts = trimmed.split('|').map((p) => p.trim())
      // BM360|zone|area|service or zone|area|service
      const start = parts[0]?.toUpperCase() === 'BM360' ? 1 : 0
      if (parts[start]) data.zone = parts[start]
      if (parts[start + 1]) data.area = parts[start + 1]
      if (parts[start + 2]) data.location = parts[start + 2]
      if (parts[start + 3]) data.service = parts[start + 3]
    } else if (trimmed.includes('=')) {
      trimmed.split('&').forEach((pair) => {
        const [k, v] = pair.split('=')
        if (k && v) data[k.trim().toLowerCase()] = decodeURIComponent(v.trim())
      })
    } else {
      data.area = trimmed
    }
  }
  return data
}

export default function RegisterComplaintModal({ open, onClose, onSuccess, source = 'agency', officialId, reporterName }: Props) {
  const { toast } = useToast()
  const [photos, setPhotos] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [allZones, setAllZones] = useState(true)
  const [selectedZone, setSelectedZone] = useState('')
  const [subArea, setSubArea] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('urgent')
  const [complaintDetails, setComplaintDetails] = useState('')
  const [selectedService, setSelectedService] = useState('housekeeping')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerError, setScannerError] = useState('')
  const [scanMessage, setScanMessage] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const safeStop = (scanner: Html5Qrcode | null) => {
    if (!scanner) return
    try { scanner.stop().then(() => scanner.clear()).catch(() => {}) } catch {}
  }

  const applyScan = (decodedText: string) => {
    const data = parseScannedData(decodedText)
    const zoneRaw = data.zone || data.location_zone || data.sector || ''
    const areaRaw = data.area || data.subarea || data.sub_area || data.location || data.spot || ''
    const serviceRaw = data.service || data.category || data.catalog || ''

    let matched = false

    if (zoneRaw) {
      const norm = normalizeKey(zoneRaw)
      const match = ZONE_OPTIONS.find((z) => normalizeKey(z.label) === norm || normalizeKey(z.value) === norm)
      if (match) {
        setSelectedZone(match.value)
        setAllZones(false)
        matched = true
      } else if (/all\s*zone/i.test(zoneRaw)) {
        setAllZones(true)
        matched = true
      }
    }

    if (areaRaw) {
      setSubArea(areaRaw)
      matched = true
    }

    if (serviceRaw) {
      const norm = normalizeKey(serviceRaw)
      const svc = SERVICE_OPTIONS.find((s) => normalizeKey(s) === norm || normalizeKey(s).includes(norm) || norm.includes(normalizeKey(s)))
      if (svc) {
        setSelectedService(svc)
        matched = true
      }
    }

    setScanMessage(matched ? 'QR code applied — fields auto-filled' : 'QR scanned. No matching fields found.')
    setTimeout(() => setScanMessage(''), 4000)
  }

  const stopScanner = () => {
    const scanner = scannerRef.current
    scannerRef.current = null
    safeStop(scanner)
    setScannerOpen(false)
    setScannerError('')
  }

  useEffect(() => {
    if (!scannerOpen) return
    setScannerError('')
    const timer = setTimeout(() => {
      try {
        const scanner = new Html5Qrcode('qr-reader')
        scannerRef.current = scanner
        scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            applyScan(decodedText)
            stopScanner()
          },
          () => {}
        ).catch(() => {
          setScannerError('Camera unavailable. Please allow camera access or use a device with a camera.')
        })
      } catch {
        setScannerError('Scanner failed to initialize.')
      }
    }, 150)
    return () => {
      clearTimeout(timer)
      const scanner = scannerRef.current
      scannerRef.current = null
      safeStop(scanner)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerOpen])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintType: selectedService,
          zone: allZones ? 'All Zones' : selectedZone,
          subArea,
          description: complaintDetails,
          source,
          reportedBy: source === 'itpo' ? 'ITPO Official' : source === 'agency' ? 'Agency' : source === 'admin' ? 'Admin' : 'Citizen',
          name: reporterName || (source === 'itpo' ? 'ITPO Official' : source === 'agency' ? 'Agency Staff' : source === 'admin' ? 'System Admin' : 'Citizen'),
          mobile: '—',
          photos,
          assignedOfficialId: officialId || null,
        }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok || !d.ok) {
        toast(d.error || 'Failed to register complaint. Please try again.', 'error')
        return
      }
      toast(`Complaint ${d.id || ''} registered successfully!`, 'success')
      logActivity(reporterName || 'Portal User', source === 'itpo' ? 'ITPO Official' : source === 'agency' ? 'Agency' : 'Citizen', 'Complaint Registered', `${d.id || ''} · ${selectedService} · ${allZones ? 'All Zones' : selectedZone}`)
      onClose()
      onSuccess?.()
    } catch {
      toast('Network error — complaint not saved. Please try again.', 'error')
    }
  }

  const addPhotoFiles = (files: FileList | null) => {
    if (!files?.length) return
    Array.from(files).slice(0, 6 - photos.length).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = () => setPhotos((prev) => [...prev, String(reader.result)])
      reader.readAsDataURL(file)
    })
  }

  const handleAttachPhoto = () => fileInputRef.current?.click()
  const handleTakePhoto = () => cameraInputRef.current?.click()

  const inputCls = "w-full h-10 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/20 focus:border-[#1b8f84] transition-colors"
  const labelCls = "block text-[12.5px] font-semibold text-[#374151] mb-1.5"

  return (
    <>
      {/* Popup Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl shadow-gray-900/20 border border-[#e8edf2] overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="bg-[#0b3c4a] px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-[16px] font-semibold text-white leading-tight">Register Operational Complaint</h1>
                <p className="text-[11.5px] text-[#9ec3d0] mt-0.5">Complaint Register • BM360</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <form id="register-complaint-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto">
            {/* Scan feedback */}
            {scanMessage && (
              <div className="mb-4 p-3 bg-[#e6f7f4] border border-[#bfe8e0] rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4 text-[#0f766e] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[12.5px] text-[#0f766e] font-medium">{scanMessage}</p>
              </div>
            )}

            {/* Section 1: Operational Scope */}
            <div>
              <h2 className="text-[13px] font-semibold text-[#111827] mb-4 pb-2 border-b border-[#eef1f4] tracking-wide">
                1. OPERATIONAL SCOPE
              </h2>

              {/* Service Catalog */}
              <div className="mb-4">
                <label className={labelCls}>Service Catalog</label>
                <div className="relative">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className={`${inputCls} appearance-none pr-16`}
                  >
                    {SERVICE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}{s === 'housekeeping' ? ' Operations' : ''}</option>
                    ))}
                  </select>
                  <svg className="w-4 h-4 text-[#9ca3af] absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-[#e6f7f4] text-[#0f766e] text-[10px] font-semibold rounded">
                    FIXED
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelCls.replace('mb-1.5', '')}>Location</label>
                  <button
                    type="button"
                    onClick={() => setScannerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-semibold text-[#0f766e] bg-[#e6f7f4] border border-[#bfe8e0] rounded-md hover:bg-[#d9f0ec] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v1m0 14v1m8-8h-1M5 12H4m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Scan QR
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      disabled={allZones}
                      className={`${inputCls} appearance-none ${allZones ? 'bg-[#f8fafc] text-[#9ca3af] cursor-not-allowed' : ''}`}
                    >
                      <option value="">Choose Zone... (89)</option>
                      {ZONE_OPTIONS.map((z) => (
                        <option key={z.value} value={z.value}>{z.label}</option>
                      ))}
                    </select>
                    <svg className="w-4 h-4 text-[#9ca3af] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* All Zones Toggle */}
                  <div className="flex items-center justify-between p-3 bg-[#e6f7f4] border border-[#bfe8e0] rounded-lg">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAllZones(!allZones)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          allZones ? 'bg-[#1b8f84]' : 'bg-[#cbd5e1]'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            allZones ? 'translate-x-[18px]' : 'translate-x-[3px]'
                          }`}
                        />
                      </button>
                      <span className="text-[13px] font-medium text-[#111827]">All Zones</span>
                    </div>
                    {allZones && (
                      <span className="text-[11px] text-[#0f766e] font-medium">89 zones active</span>
                    )}
                  </div>

                  {allZones && (
                    <p className="text-[12px] text-[#6b7280]">
                      All campus zones active (89) - select any zone to create complaint.
                    </p>
                  )}

                  {/* Sub-Area / Specific Location */}
                  <div>
                    <label className={labelCls}>Sub-Area / Specific Location</label>
                    <input
                      type="text"
                      value={subArea}
                      onChange={(e) => setSubArea(e.target.value)}
                      disabled={allZones}
                      placeholder={allZones ? "Select a Target Location / Zone first.." : "Enter specific location"}
                      className={`${inputCls} ${allZones ? 'bg-[#f8fafc] text-[#9ca3af] cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>
              </div>

              {/* Attach Photo (Optional) */}
              <div className="mb-4">
                <label className={labelCls}>Attach Photo (Optional)</label>
                <div className="flex gap-2.5 flex-wrap">
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addPhotoFiles(e.target.files); e.target.value = '' }} />
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { addPhotoFiles(e.target.files); e.target.value = '' }} />
                  <button type="button" onClick={handleAttachPhoto} className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f8fafc] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Attach Photo
                  </button>
                  <button type="button" onClick={handleTakePhoto} className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Take Photo
                  </button>
                  {photos.length < 6 && (
                    <button type="button" onClick={handleAttachPhoto} title="Add another photo" className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-dashed border-[#1b8f84] text-[#0f766e] hover:bg-[#e6f7f4] transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  )}
                </div>
                {photos.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {photos.map((p, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#e8edf2] group">
                        <img src={p} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-semibold">{i + 1}</span>
                      </div>
                    ))}
                    <p className="text-[11px] text-[#9ca3af] self-center">{photos.length} photo{photos.length > 1 ? 's' : ''} attached</p>
                  </div>
                )}
              </div>

              {/* Location and Direction */}
              <div className="mb-4">
                <label className={labelCls}>
                  Location and Direction <span className="text-[#e11d48]">*</span>
                </label>
                <textarea
                  value={complaintDetails}
                  onChange={(e) => setComplaintDetails(e.target.value)}
                  placeholder="Enter complaint details or work instructions here...."
                  rows={4}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-[#e5e7eb] rounded-lg text-[13px] text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/20 focus:border-[#1b8f84] transition-colors resize-none"
                />
              </div>

              {/* Operational Priority */}
              <div className="mb-2">
                <label className={`${labelCls} mb-2.5`}>Operational Priority</label>
                <div className="space-y-2.5">
                  {/* High Priority */}
                  <div
                    onClick={() => setSelectedPriority('high')}
                    className={`p-3.5 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPriority === 'high'
                        ? 'border-[#f59e0b] bg-[#fffbeb]'
                        : 'border-[#e5e7eb] bg-white hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedPriority === 'high'
                            ? 'border-[#f59e0b] bg-[#f59e0b]'
                            : 'border-[#cbd5e1]'
                        }`}>
                          {selectedPriority === 'high' && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-[13.5px] font-semibold text-[#111827]">High Priority</p>
                          <p className="text-[11.5px] text-[#9ca3af]">P2-STANDARD</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] text-[#6b7280]">Standard Shift Complaint</p>
                        <p className="text-[16px] font-bold text-[#111827]">1 Hour</p>
                      </div>
                    </div>
                  </div>

                  {/* Urgent Priority */}
                  <div
                    onClick={() => setSelectedPriority('urgent')}
                    className={`p-3.5 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPriority === 'urgent'
                        ? 'border-[#f59e0b] bg-[#fffbeb]'
                        : 'border-[#e5e7eb] bg-white hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedPriority === 'urgent'
                            ? 'border-[#f59e0b] bg-[#f59e0b]'
                            : 'border-[#cbd5e1]'
                        }`}>
                          {selectedPriority === 'urgent' && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-[13.5px] font-semibold text-[#111827]">Urgent Priority</p>
                          <p className="text-[11.5px] text-[#9ca3af]">P1-IMMEDIATE</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] text-[#6b7280]">Critical Escalation</p>
                        <p className="text-[16px] font-bold text-[#111827]">30 Minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[11.5px] text-[#9ca3af] mt-2">Response window is set automatically</p>
              </div>
            </div>
          </form>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#eef1f4] flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f3f5f8] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="register-complaint-form"
              className="px-4 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] transition-colors shadow-sm"
            >
              Register Complaint
            </button>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {scannerOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={stopScanner} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-[#0b3c4a] px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v1m0 14v1m8-8h-1M5 12H4m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h2 className="text-[14px] font-semibold text-white">Scan Location QR Code</h2>
              </div>
              <button
                onClick={stopScanner}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              {!scannerError ? (
                <>
                  <div id="qr-reader" className="w-full rounded-xl overflow-hidden bg-black min-h-[280px]" />
                  <p className="text-[12px] text-[#6b7280] mt-3 text-center">
                    Point camera at the zone QR code to auto-fill location details
                  </p>
                </>
              ) : (
                <div className="py-10 text-center">
                  <svg className="w-10 h-10 text-[#9ca3af] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-[13px] text-[#374151] font-medium mb-1">Camera Unavailable</p>
                  <p className="text-[12px] text-[#6b7280]">{scannerError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
