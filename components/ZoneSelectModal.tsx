'use client'

import { useState, useMemo } from 'react'
import { ZONE_NAMES as ZONES, ALL_ZONES_LABEL as ALL_ZONES } from '@/lib/zones'


interface ZoneSelectModalProps {
  open: boolean
  onClose: () => void
  currentZone: string
  onConfirm: (zone: string) => void
}

export default function ZoneSelectModal({ open, onClose, currentZone, onConfirm }: ZoneSelectModalProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return ZONES
    return ZONES.filter((z) => z.toLowerCase().includes(q))
  }, [search])

  if (!open) return null

  const handleConfirm = () => {
    if (selected) {
      onConfirm(selected)
      setSelected(null)
      setSearch('')
    }
  }

  const handleClose = () => {
    setSelected(null)
    setSearch('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0b3c4a] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold leading-tight">Switch Operational Zone</h2>
              <p className="text-[11px] text-[#9ec3d0] mt-0.5">Select your deployed zone to focus complaints &amp; workflow</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Currently assigned */}
        <div className="px-5 pt-4 pb-2 shrink-0">
          <div className="bg-[#e6f7f4] border border-[#b7e4d4] rounded-xl px-4 py-2.5 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#0f766e] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[12.5px] text-[#0f766e]">
              Currently Assigned: <span className="font-semibold">{currentZone}</span>
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pb-3 shrink-0">
          <div className="relative">
            <svg className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search zones (e.g. Hall 14, Admin, Gate)..."
              className="w-full h-10 pl-9 pr-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/20 focus:border-[#1b8f84]"
            />
          </div>
          <p className="text-[11.5px] text-[#9ca3af] mt-1.5">{filtered.length + 1} of {ZONES.length + 1} zones</p>
        </div>

        {/* Zone list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0">
          {/* Campus-wide option */}
          <button
            onClick={() => setSelected(ALL_ZONES)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
              selected === ALL_ZONES ? 'bg-[#e6f7f4] border border-[#1b8f84]' : 'hover:bg-[#f3f5f8] border border-transparent'
            }`}
          >
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selected === ALL_ZONES ? 'border-[#1b8f84]' : 'border-[#cbd5e1]'}`}>
              {selected === ALL_ZONES && <span className="w-2 h-2 rounded-full bg-[#1b8f84]"></span>}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-[#111827]">{ALL_ZONES}</p>
              <p className="text-[11px] text-[#9ca3af]">Campus Wide</p>
            </div>
          </button>

          {filtered.map((zone) => (
            <button
              key={zone}
              onClick={() => setSelected(zone)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                selected === zone ? 'bg-[#e6f7f4] border border-[#1b8f84]' : 'hover:bg-[#f3f5f8] border border-transparent'
              }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selected === zone ? 'border-[#1b8f84]' : 'border-[#cbd5e1]'}`}>
                {selected === zone && <span className="w-2 h-2 rounded-full bg-[#1b8f84]"></span>}
              </span>
              <span className="flex-1 min-w-0 text-[13.5px] font-medium text-[#111827] truncate">{zone}</span>
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#4f46e5] text-[10px] font-semibold">Agency Zone</span>
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-[13px] text-[#9ca3af] py-8">No zones match your search</p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f8fafc] border-t border-[#e8edf2] px-5 py-3.5 flex items-center justify-between shrink-0">
          <p className="text-[12px] text-[#9ca3af]">BM360 • Bharat Mandapam</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-[#e5e7eb] bg-white text-[#374151] rounded-lg text-[13px] font-medium hover:bg-[#f3f5f8] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="px-4 py-2 bg-[#0e4c5e] hover:bg-[#0b3c4a] disabled:bg-[#9ca3af] disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-semibold transition-colors"
            >
              Confirm &amp; Switch Zone
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
