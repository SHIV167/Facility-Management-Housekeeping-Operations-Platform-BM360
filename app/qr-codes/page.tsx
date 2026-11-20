'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { ZONE_NAMES } from '@/lib/zones'

export default function QrCodesPage() {
  const [origin, setOrigin] = useState('')
  const [search, setSearch] = useState('')
  const [qrMap, setQrMap] = useState<Record<string, string>>({})

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const zones = ZONE_NAMES.filter((z) => z.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    if (!origin) return
    let cancelled = false
    zones.forEach(async (z) => {
      const url = `${origin}/raise-complaint?zone=${encodeURIComponent(z)}`
      const dataUrl = await QRCode.toDataURL(url, { width: 220, margin: 1, color: { dark: '#0b3c4a', light: '#ffffff' } })
      if (!cancelled) setQrMap((prev) => ({ ...prev, [z]: dataUrl }))
    })
    return () => { cancelled = true }
  }, [origin, search])

  const download = (zone: string) => {
    const a = document.createElement('a')
    a.href = qrMap[zone]
    a.download = `qr-${zone.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`
    a.click()
  }

  return (
    <div className="min-h-screen bg-[#f3f5f8]">
      <header className="bg-[#0b3c4a] px-5 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[17px] font-semibold text-white">Zone QR Codes — BM360 Bharat Mandapam</h1>
            <p className="text-[11.5px] text-[#9ec3d0] mt-0.5">Print and place at each location. Citizens scan to raise a complaint — no login needed.</p>
          </div>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-2 text-[12.5px] font-semibold text-[#0b3c4a] bg-white rounded-lg hover:bg-[#e6f7f4]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print All
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-6">
        <div className="relative mb-5 max-w-sm">
          <svg className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search zones..." className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-[#e5e7eb] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/40" />
        </div>

        <p className="text-[12px] text-[#6b7280] mb-4">{zones.length} zones · Base URL: <span className="font-mono text-[#0f766e]">{origin || 'loading...'}/raise-complaint</span></p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {zones.map((z) => (
            <div key={z} className="bg-white rounded-xl border border-[#e8edf2] shadow-sm p-4 flex flex-col items-center text-center print:break-inside-avoid print:border print:shadow-none">
              {qrMap[z] ? (
                <img src={qrMap[z]} alt={`QR for ${z}`} className="w-[180px] h-[180px]" />
              ) : (
                <div className="w-[180px] h-[180px] rounded-lg bg-[#f3f5f8] animate-pulse" />
              )}
              <p className="text-[12.5px] font-semibold text-[#111827] mt-3 leading-tight">{z}</p>
              <p className="text-[10px] text-[#9ca3af] font-mono mt-1 break-all px-1">{origin}/raise-complaint?zone={encodeURIComponent(z)}</p>
              <button onClick={() => download(z)} className="mt-2.5 px-3 py-1.5 text-[11.5px] font-semibold text-[#0f766e] bg-[#e6f7f4] rounded-lg hover:bg-[#d7f0ea] print:hidden">
                Download PNG
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
