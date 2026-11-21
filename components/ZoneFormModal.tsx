'use client'

import { useState, useEffect } from 'react'
import type { ZoneRecord } from '@/lib/zones'

interface ZoneFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (zone: Omit<ZoneRecord, 'id'> & { id?: number }) => void
  zone: ZoneRecord | null
}

const inputCls = 'w-full h-10 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/20 focus:border-[#1b8f84]'
const labelCls = 'block text-[12.5px] font-semibold text-[#374151] mb-1.5'

export default function ZoneFormModal({ open, onClose, onSave, zone }: ZoneFormModalProps) {
  const [name, setName] = useState('')
  const [area, setArea] = useState('')
  const [manager, setManager] = useState('')
  const [accessMobile, setAccessMobile] = useState('')
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active')

  useEffect(() => {
    if (open) {
      setName(zone?.name ?? '')
      setArea(zone?.area ?? '')
      setManager(zone?.manager ?? '')
      setAccessMobile(zone?.accessMobile ?? '')
      setStatus(zone?.status ?? 'Active')
    }
  }, [open, zone])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ id: zone?.id, name: name.trim() || 'Unnamed Zone', area: area.trim() || '—', manager: manager.trim() || 'Unassigned', status, accessMobile: accessMobile.trim() || undefined })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0b3c4a] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <div>
              <h2 className="text-[15px] font-bold leading-tight">{zone ? 'Edit Zone' : 'Add New Zone'}</h2>
              <p className="text-[11px] text-[#9ec3d0] mt-0.5">Zones &amp; Areas • BM360</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className={labelCls}>Zone Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hall 14" className={inputCls} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Area (sq ft)</label>
              <input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. 12000 sq ft" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Manager</label>
              <input type="text" value={manager} onChange={(e) => setManager(e.target.value)} placeholder="e.g. Mrs. Sunita Sharma" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Authorized Mobile (Zone Access)</label>
            <input type="tel" value={accessMobile} onChange={(e) => setAccessMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="e.g. 9876543210 — maps this zone to a login mobile" className={inputCls} />
            <p className="text-[10.5px] text-[#9ca3af] mt-1">User logging in with this mobile sees only this zone's complaints &amp; data.</p>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <div className="flex gap-2">
              {(['Active', 'Inactive'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 h-10 rounded-lg border text-[13px] font-semibold transition-colors ${
                    status === s
                      ? s === 'Active'
                        ? 'bg-[#e8f8ef] border-[#16a34a] text-[#16a34a]'
                        : 'bg-[#f3f4f6] border-[#9ca3af] text-[#6b7280]'
                      : 'bg-white border-[#e5e7eb] text-[#6b7280] hover:bg-[#f8fafc]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="bg-[#f8fafc] border-t border-[#e8edf2] px-5 py-3.5 flex items-center justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 border border-[#e5e7eb] bg-white text-[#374151] rounded-lg text-[13px] font-medium hover:bg-[#f3f5f8] transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-[#0e4c5e] hover:bg-[#0b3c4a] text-white rounded-lg text-[13px] font-semibold transition-colors">
            {zone ? 'Save Changes' : 'Add Zone'}
          </button>
        </div>
      </div>
    </div>
  )
}
