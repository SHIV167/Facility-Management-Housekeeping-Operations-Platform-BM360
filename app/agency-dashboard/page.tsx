'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RegisterComplaintModal from '@/components/RegisterComplaintModal'

export default function AgencyDashboardPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('Last 7 Days')
  const [agencyFilter, setAgencyFilter] = useState('All Agencies')
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [headerSearch, setHeaderSearch] = useState('')
  const [operationalZone, setOperationalZone] = useState('All Campus')
  const [zoneMenuOpen, setZoneMenuOpen] = useState(false)
  const [overviewTab, setOverviewTab] = useState<'all' | 'pending' | 'completed'>('all')
  const [showComplaintForm, setShowComplaintForm] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    router.push('/')
  }

  const complaints = [
    {
      id: 54,
      date: 'Nov 17 10:42 AM',
      title: 'URGENT Housekeeping Work During Fair',
      status: 'COMPLETED',
      completionTime: 'Completed in 3 min - 27 min early',
      location: 'Hall 14 - Outside Hall 14',
      campus: 'Bharat Mandapam',
      service: 'Housekeeping Operations',
      agency: 'BLUSPRING ENTERPRISES LTD.',
      dueDate: '11:12 AM Nov 17',
      photo: null
    },
    {
      id: 53,
      date: 'Nov 17 09:30 AM',
      title: 'Please don\'t keep like this... premises should be clean',
      status: 'COMPLETED',
      completionTime: 'Completed in 11 hr 18 min - 10 hr 18 min late',
      location: 'Open Area, NTA (parking)',
      campus: 'Bharat Mandapam',
      service: 'Housekeeping Operations',
      agency: 'Soni Facility Management',
      dueDate: '11:12 PM Nov 16',
      photo: null
    },
    {
      id: 52,
      date: 'Nov 16 08:15 PM',
      title: 'test test',
      status: 'PENDING',
      completionTime: '3 min past SLA',
      location: 'GF H4',
      campus: 'Bharat Mandapam',
      service: 'Housekeeping Operations',
      agency: 'Soni Facility Management',
      dueDate: '08:12 PM Nov 16',
      photo: null
    },
    {
      id: 51,
      date: 'Nov 16 02:30 PM',
      title: 'Female washroom cleaning required',
      status: 'COMPLETED',
      completionTime: 'Completed in 45 min - on time',
      location: 'Female Washroom',
      campus: 'Bharat Mandapam',
      service: 'Housekeeping Operations',
      agency: 'BLUSPRING ENTERPRISES LTD.',
      dueDate: '03:15 PM Nov 16',
      photo: null
    },
    {
      id: 50,
      date: 'Nov 16 11:00 AM',
      title: 'Water spillage in corridor',
      status: 'COMPLETED',
      completionTime: 'Completed in 20 min - 10 min early',
      location: 'Corridor - Hall 5',
      campus: 'Bharat Mandapam',
      service: 'Housekeeping Operations',
      agency: 'Soni Facility Management',
      dueDate: '11:30 AM Nov 16',
      photo: null
    }
  ]

  const filteredComplaints = complaints.filter((c) =>
    overviewTab === 'all' ? true : overviewTab === 'pending' ? c.status === 'PENDING' : c.status === 'COMPLETED'
  )

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'complaints', label: 'All Complaints', icon: 'clipboard', badge: '3' },
    { id: 'staff', label: 'Field Staff', icon: 'users' },
    { id: 'reports', label: 'Reports', icon: 'chart' },
  ]

  const NavIcon = ({ name }: { name: string }) => {
    const common = 'w-[18px] h-[18px] shrink-0'
    if (name === 'grid') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 6h6v6H4V6zm10 0h6v6h-6V6zM4 16h6v4H4v-4zm10 0h6v4h-6v-4z" /></svg>
    if (name === 'clipboard') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    if (name === 'users') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  }

  return (
    <div className="admin-shell min-h-screen flex bg-[#f3f5f8]">
      {/* Sidebar - same theme as main dashboard */}
      <aside className="w-[248px] shrink-0 bg-[#0b3c4a] text-white flex flex-col">
        <div className="px-3.5 pt-3.5 pb-2">
          <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
            <div className="text-[22px] font-extrabold leading-none tracking-tight text-[#0b3c4a]">
              BM<span className="text-[#1d4ed8]">360</span>
            </div>
            <div className="text-[8px] font-bold tracking-[0.16em] text-[#64748b] mt-0.5">BHARAT MANDAPAM</div>
          </div>
        </div>

        <div className="px-3 pt-2">
          <div className="w-full flex items-center gap-2.5 rounded-xl bg-[#0e4c5e] px-2.5 py-2">
            <span className="w-8 h-8 rounded-lg bg-[#14586a] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-semibold leading-tight">Soni Facility Management</span>
              <span className="block text-[10px] text-[#9ec3d0] leading-tight mt-0.5">BM360 · Agency Portal</span>
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
          <p className="px-2 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#7f9eab]">COMPLAINTS</p>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const active = item.id === 'complaints'
              return (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] text-left ${
                    active ? 'bg-[#1b8f84] text-white font-medium shadow-sm' : 'text-[#d5e6ec] hover:bg-white/5'
                  }`}
                >
                  <NavIcon name={item.icon} />
                  <span className="flex-1 leading-tight">{item.label}</span>
                  {item.badge && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#e11d48] text-white text-[10px] font-bold flex items-center justify-center">{item.badge}</span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="px-3.5 py-2.5 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#b7d0d8]">Language / हिंदी</span>
            <div className="flex items-center rounded-full bg-[#082f3b] p-0.5">
              <button onClick={() => setLanguage('en')} className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${language === 'en' ? 'bg-[#22a35a] text-white' : 'text-[#b7d0d8]'}`}>EN</button>
              <button onClick={() => setLanguage('hi')} className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${language === 'hi' ? 'bg-[#22a35a] text-white' : 'text-[#b7d0d8]'}`}>हिंदी</button>
            </div>
          </div>
        </div>

        <div className="px-3.5 pb-2.5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#14586a] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold leading-tight truncate">Laxman Lal</p>
            <p className="text-[11px] text-[#9ec3d0] leading-tight">Agency Manager</p>
          </div>
          <button onClick={handleLogout} className="text-[#9ec3d0] hover:text-white transition-colors" title="Logout">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>

        <div className="relative mx-3 mb-3 rounded-xl border border-[#1b8f84] bg-[#0c4654] px-3 py-2">
          <p className="text-[9px] font-semibold tracking-[0.12em] text-[#8fb4c0]">OPERATIONAL ZONE</p>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="text-[12px] text-white truncate">{operationalZone}</p>
            <button onClick={() => setZoneMenuOpen((open) => !open)} className="shrink-0 inline-flex items-center gap-0.5 text-[12px] font-medium text-[#5eead4]">
              Change
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          {zoneMenuOpen && (
            <div className="absolute left-0 right-0 bottom-full mb-1 bg-white text-[#111827] rounded-lg shadow-lg border border-[#e5e7eb] overflow-hidden z-20">
              {['All Campus', 'Hall 1-5', 'Hall 6-10', 'Hall 11-14', 'Parking Area'].map((zone) => (
                <button
                  key={zone}
                  onClick={() => { setOperationalZone(zone); setZoneMenuOpen(false) }}
                  className="w-full text-left px-3 py-2 text-[12px] hover:bg-[#f3f5f8]"
                >
                  {zone}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-[#e8edf2] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[13px] text-[#6b7280]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span>BM360</span>
            <svg className="w-3.5 h-3.5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" /></svg>
            <span className="text-[#111827] font-semibold">Complaint Register</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-[#e5e7eb] p-0.5 bg-white">
              <button onClick={() => setLanguage('en')} className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${language === 'en' ? 'bg-[#22a35a] text-white' : 'text-[#6b7280]'}`}>EN</button>
              <button onClick={() => setLanguage('hi')} className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${language === 'hi' ? 'bg-[#22a35a] text-white' : 'text-[#6b7280]'}`}>हिंदी</button>
            </div>
            <div className="relative">
              <svg className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search complaints..."
                className="w-[230px] h-9 pl-9 pr-3 rounded-full bg-[#f8fafc] text-[13px]"
              />
            </div>
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-[#e8eefc] text-[#1d4ed8] text-[11px] font-bold flex items-center justify-center">LL</div>
              <div className="leading-tight">
                <p className="text-[12.5px] font-semibold text-[#111827]">Laxman Lal</p>
                <p className="text-[11px] text-[#6b7280]">Agency Manager</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-4">
          {/* Greeting Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 w-9 h-9 rounded-full bg-white border border-[#e6ebf0] flex items-center justify-center text-[#1f8f86] shrink-0">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                </div>
                <div>
                  <h1 className="text-[20px] font-semibold text-[#1f2937] leading-tight">Good Afternoon, Laxman Lal</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#e6f7f4] text-[#0f766e]">Agency Manager</span>
                    <span className="text-[#9ca3af]">•</span>
                    <span className="text-[12.5px] text-[#6b7280]">{operationalZone}</span>
                    <button onClick={() => setZoneMenuOpen(true)} className="text-[12px] font-medium text-[#2563eb] hover:underline">Change Zone</button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowComplaintForm(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#2563eb] rounded-lg hover:bg-[#1d4ed8] shadow-sm shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Complaint
              </button>
            </div>
          </div>

          {/* Complaint Overview Section */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-[#111827]">Complaint Overview</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 bg-white border border-[#e5e7eb] rounded-lg p-0.5">
                  {['Last 7 Days', 'Today', '30 Days', 'All Time'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDateFilter(filter)}
                      className={`px-2.5 py-1 text-[12px] font-medium rounded-md ${
                        dateFilter === filter
                          ? 'bg-[#0e4c5e] text-white'
                          : 'text-[#6b7280] hover:bg-[#f3f5f8]'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <button className="p-2 text-[#6b7280] hover:bg-white border border-[#e5e7eb] rounded-lg bg-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div onClick={() => setOverviewTab('all')} role="button" className={`bg-white rounded-xl border px-4 py-3.5 flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)] cursor-pointer transition-all ${overviewTab === 'all' ? 'border-[#1b8f84] ring-2 ring-[#1b8f84]/30' : 'border-[#e8edf2] hover:shadow-md'}`}>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">TOTAL COMPLAINTS</p>
                  <p className="text-[28px] font-semibold text-[#111827] leading-none mt-1.5">54</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#eef2ff] text-[#4f46e5] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
              </div>
              <div onClick={() => setOverviewTab((prev) => (prev === 'pending' ? 'all' : 'pending'))} role="button" className={`bg-white rounded-xl border px-4 py-3.5 flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)] cursor-pointer transition-all ${overviewTab === 'pending' ? 'border-[#1b8f84] ring-2 ring-[#1b8f84]/30' : 'border-[#e8edf2] hover:shadow-md'}`}>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">PENDING COMPLAINTS</p>
                  <p className="text-[28px] font-semibold text-[#ea580c] leading-none mt-1.5">3</p>
                  <p className="text-[11px] text-[#e11d48] mt-1">3 past SLA</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#fff7ed] text-[#ea580c] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
              <div onClick={() => setOverviewTab((prev) => (prev === 'completed' ? 'all' : 'completed'))} role="button" className={`bg-white rounded-xl border px-4 py-3.5 flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)] cursor-pointer transition-all ${overviewTab === 'completed' ? 'border-[#1b8f84] ring-2 ring-[#1b8f84]/30' : 'border-[#e8edf2] hover:shadow-md'}`}>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">COMPLETED COMPLAINTS</p>
                  <p className="text-[28px] font-semibold text-[#16a34a] leading-none mt-1.5">51</p>
                  <p className="text-[11px] text-[#9ca3af] mt-1">Resolved</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#e8f8ef] text-[#16a34a] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* All Complaints Section */}
          <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#eef1f4] flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-[#111827]">All Complaints</h3>
                <p className="text-[12px] text-[#9ca3af] mt-0.5">Showing {filteredComplaints.length} complaints</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <svg className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 h-9 pl-9 pr-3 rounded-lg bg-white border border-[#e5e7eb] text-[13px]"
                  />
                </div>
                <select
                  value={agencyFilter}
                  onChange={(e) => setAgencyFilter(e.target.value)}
                  className="h-9 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] text-[#374151]"
                >
                  <option>All Agencies</option>
                  <option>Soni Facility Management</option>
                  <option>BLUSPRING ENTERPRISES LTD.</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#eef1f4]">
                    {['PHOTO', 'ID & DATE', 'COMPLAINT', 'LOCATION', 'SERVICE', 'ASSIGNED AGENCY', 'DUE DATE'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafbfc] cursor-pointer"
                      onClick={() => window.location.href = `/agency-dashboard/complaint-details?id=${complaint.id}`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="w-11 h-11 bg-[#f3f4f6] rounded-lg flex items-center justify-center border border-[#e8edf2]">
                          <svg className="w-5 h-5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[13.5px] font-semibold text-[#111827]">#{complaint.id}</p>
                        <p className="text-[11.5px] text-[#9ca3af]">{complaint.date}</p>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-[13px] text-[#111827] mb-1.5">{complaint.title}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          complaint.status === 'COMPLETED' ? 'bg-[#e8f8ef] text-[#16a34a]' :
                          complaint.status === 'PENDING' ? 'bg-[#fff7ed] text-[#ea580c]' :
                          'bg-[#f3f4f6] text-[#6b7280]'
                        }`}>
                          {complaint.status}
                        </span>
                        {complaint.completionTime && (
                          <p className="text-[11px] text-[#9ca3af] mt-1">{complaint.completionTime}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[13px] text-[#374151]">{complaint.location}</p>
                        <p className="text-[11.5px] text-[#9ca3af]">{complaint.campus}</p>
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-[#374151]">{complaint.service}</td>
                      <td className="px-4 py-3.5 text-[13px] text-[#374151]">{complaint.agency}</td>
                      <td className="px-4 py-3.5 text-[13px] text-[#374151]">{complaint.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-[#eef1f4] flex items-center justify-between">
              <p className="text-[12.5px] text-[#9ca3af]">Showing 1 to {filteredComplaints.length} of {complaints.length} complaints</p>
              <div className="flex items-center gap-3">
                <select className="h-8 px-2 bg-white border border-[#e5e7eb] rounded-lg text-[12.5px] text-[#374151]">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span className="text-[12.5px] text-[#9ca3af]">complaints per page</span>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded hover:bg-[#f3f5f8] text-[#9ca3af]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      key={page}
                      className={`w-7 h-7 rounded-md text-[12.5px] font-medium ${
                        page === 1 ? 'bg-[#0e4c5e] text-white' : 'text-[#6b7280] hover:bg-[#f3f5f8]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button className="p-1.5 rounded hover:bg-[#f3f5f8] text-[#9ca3af]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <RegisterComplaintModal open={showComplaintForm} onClose={() => setShowComplaintForm(false)} />
    </div>
  )
}
