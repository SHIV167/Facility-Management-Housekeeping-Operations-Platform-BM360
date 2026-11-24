'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DocumentTitle from '@/components/DocumentTitle'
import RegisterComplaintModal from '@/components/RegisterComplaintModal'
import ComplaintDetailsModal from '@/components/ComplaintDetailsModal'
import { useToast } from '@/components/Toast'

const fallbackOfficials = [
  { id: 1, name: 'Mr. Premjit Lal', initials: 'MP', username: '@mrpremjitlal', employeeId: '9123', designation: 'ED', phone: '9868217057', email: 'editpo@itpo.gov.in', zones: 'All Zones (Entire Complex)', zonesList: ['All Zones (Entire Complex)'], status: 'Active' },
  { id: 2, name: 'Mrs. Sunita Sharma', initials: 'SS', username: '@sunitasharma', employeeId: '9124', designation: 'Manager', phone: '9868217058', email: 'sunita@itpo.gov.in', zones: 'Hall 1-5', zonesList: ['Hall 1-5'], status: 'Active' },
  { id: 3, name: 'Mr. Rajesh Kumar', initials: 'RK', username: '@rajeshkumar', employeeId: '9125', designation: 'Supervisor', phone: '9868217059', email: 'rajesh@itpo.gov.in', zones: 'Hall 6-10', zonesList: ['Hall 6-10'], status: 'Inactive' },
]

const fallbackComplaints: any[] = []

function OfficialDashboard() {
  const router = useRouter()
  const params = useSearchParams()
  const officialId = Number(params.get('id') ?? '1')
  const [officials, setOfficials] = useState(fallbackOfficials)
  const [allComplaints, setAllComplaints] = useState<any[]>(fallbackComplaints)
  const official = officials.find((o) => o.id === officialId) ?? officials[0]

  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [activeView, setActiveView] = useState<'overview' | 'complaints' | 'zones' | 'reports'>('overview')
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  const [inspectComplaint, setInspectComplaint] = useState<any>(null)
  const { toast } = useToast()

  const updateComplaintStatus = (id: number, status: string) => {
    fetch('/api/complaints', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, actor: official.name, role: 'ITPO Official' }),
    }).then((r) => r.json()).then((d) => {
      if (d.ok) { toast(status === 'COMPLETED' ? 'Complaint marked completed' : 'Complaint reopened', 'success'); loadComplaints() }
      else toast(d.error || 'Update failed', 'error')
    }).catch(() => toast('Update failed', 'error'))
  }

  const deleteComplaint = (id: number) => {
    if (!window.confirm('Delete this complaint permanently?')) return
    fetch('/api/complaints', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).then((r) => r.json()).then((d) => {
      if (d.ok) { toast('Complaint deleted', 'success'); loadComplaints() }
      else toast('Delete failed', 'error')
    }).catch(() => toast('Delete failed', 'error'))
  }

  useEffect(() => {
    fetch('/api/officials').then((r) => r.json()).then((d) => {
      if (d.ok && d.officials?.length) {
        setOfficials(d.officials.map((o: any) => ({
          id: o.id, name: o.name,
          initials: o.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
          username: o.username || '', employeeId: o.employee_id || '', designation: o.designation || '',
          phone: o.phone || '', email: o.email || '',
          zones: Array.isArray(o.zones) && o.zones.length ? o.zones.join(', ') : 'All Zones (Entire Complex)',
          zonesList: Array.isArray(o.zones) ? o.zones : [],
          status: o.status || 'Active',
        })))
      }
    }).catch(() => {})
    loadComplaints()
  }, [])

  const loadComplaints = () => {
    fetch('/api/complaints').then((r) => r.json()).then((d) => {
      if (d.ok && d.complaints) {
        setAllComplaints(d.complaints.map((c: any) => ({
          id: c.id, publicId: c.public_id,
          date: new Date(c.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
          title: c.title || (c.description || '').slice(0, 60) || 'Complaint',
          status: c.status === 'COMPLETED' || c.status === 'RESOLVED' ? 'COMPLETED' : c.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'PENDING',
          location: c.sub_area ? `${c.zone} - ${c.sub_area}` : c.zone || '—',
          service: c.service || c.complaint_type || 'General',
          dueDate: c.due_date || '—',
          assignedTo: c.official_name || '',
          assignedOfficialId: c.assigned_official_id,
          zone: c.zone,
        })))
      }
    }).catch(() => {})
  }

  const isAllZones = official.zonesList?.includes('All Zones (Entire Complex)') || official.zones.includes('All Zones')
  const myComplaints = allComplaints.filter((c) =>
    c.assignedOfficialId === official.id || c.assignedTo === official.name || (isAllZones && c.zone) || (!isAllZones && official.zonesList?.some((z: string) => c.zone === z || c.zone?.includes(z)))
  )
  const resolved = myComplaints.filter((c) => c.status === 'COMPLETED' || c.status === 'RESOLVED').length
  const pending = myComplaints.filter((c) => c.status === 'PENDING').length
  const zoneList = official.zones === 'All Zones (Entire Complex)' ? ['All Campus Zones (Entire Complex)'] : official.zones.split(',').map((z) => z.trim())

  const statusPill = (st: string) =>
    st === 'COMPLETED' || st === 'RESOLVED'
      ? 'bg-[#e8f8ef] text-[#16a34a]'
      : st === 'PENDING'
      ? 'bg-[#fff7ed] text-[#ea580c]'
      : 'bg-[#eef2ff] text-[#4f46e5]'

  const navItems = [
    { id: 'overview', label: 'My Overview', icon: 'grid' },
    { id: 'complaints', label: 'My Complaints', icon: 'clipboard', badge: String(myComplaints.length) },
    { id: 'zones', label: 'My Zones', icon: 'pin' },
    { id: 'reports', label: 'My Reports', icon: 'chart' },
  ]

  const NavIcon = ({ name }: { name: string }) => {
    const common = 'w-[18px] h-[18px] shrink-0'
    if (name === 'grid') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 6h6v6H4V6zm10 0h6v6h-6V6zM4 16h6v4H4v-4zm10 0h6v4h-6v-4z" /></svg>
    if (name === 'clipboard') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    if (name === 'pin') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  }

  return (
    <div className="admin-shell min-h-screen flex bg-[#f3f5f8]">
      <DocumentTitle title={`${official.name} • ITPO Official`} />

      {/* Sidebar */}
      <aside className="w-[248px] shrink-0 bg-[#0b3c4a] text-white flex flex-col">
        <div className="px-3.5 pt-3.5 pb-2">
          <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
            <div className="text-[22px] font-extrabold leading-none tracking-tight text-[#0b3c4a]">BM<span className="text-[#1d4ed8]">360</span></div>
            <div className="text-[8px] font-bold tracking-[0.16em] text-[#64748b] mt-0.5">BHARAT MANDAPAM</div>
          </div>
        </div>

        <div className="px-3 pt-2">
          <div className="w-full flex items-center gap-2.5 rounded-xl bg-[#0e4c5e] px-2.5 py-2">
            <span className="w-8 h-8 rounded-lg bg-[#14586a] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-semibold leading-tight">{official.name}</span>
              <span className="block text-[10px] text-[#9ec3d0] leading-tight mt-0.5">ITPO Official • BM360</span>
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
          <p className="px-2 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#7f9eab]">MY WORKSPACE</p>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const active = item.id === activeView
              return (
                <button key={item.id} onClick={() => setActiveView(item.id as typeof activeView)} className={`w-full flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] text-left ${active ? 'bg-[#1b8f84] text-white font-medium shadow-sm' : 'text-[#d5e6ec] hover:bg-white/5'}`}>
                  <NavIcon name={item.icon} />
                  <span className="flex-1 leading-tight">{item.label}</span>
                  {item.badge && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#e11d48] text-white text-[10px] font-bold flex items-center justify-center">{item.badge}</span>}
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
            <p className="text-[13px] font-semibold leading-tight truncate">{official.name}</p>
            <p className="text-[11px] text-[#9ec3d0] leading-tight">{official.designation} • ITPO</p>
          </div>
          <button onClick={() => router.push('/admin')} className="text-[#9ec3d0] hover:text-white transition-colors" title="Back to Admin">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>

        <div className="relative mx-3 mb-3 rounded-xl border border-[#1b8f84] bg-[#0c4654] px-3 py-2">
          <p className="text-[9px] font-semibold tracking-[0.12em] text-[#8fb4c0]">TAGGED ZONES</p>
          <p className="text-[12px] text-white truncate mt-0.5">{official.zones}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-[#e8edf2] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[13px] text-[#6b7280]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span>BM360</span>
            <svg className="w-3.5 h-3.5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" /></svg>
            <span className="text-[#111827] font-semibold">ITPO Official Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowComplaintForm(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" /></svg>
              New Complaint
            </button>
            <div className="flex items-center rounded-full border border-[#e5e7eb] p-0.5 bg-white">
              <button onClick={() => setLanguage('en')} className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${language === 'en' ? 'bg-[#22a35a] text-white' : 'text-[#6b7280]'}`}>EN</button>
              <button onClick={() => setLanguage('hi')} className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${language === 'hi' ? 'bg-[#22a35a] text-white' : 'text-[#6b7280]'}`}>हिंदी</button>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-[#0e4c5e] text-white text-[11px] font-bold flex items-center justify-center">{official.initials}</div>
              <div className="leading-tight">
                <p className="text-[12.5px] font-semibold text-[#111827]">{official.name}</p>
                <p className="text-[11px] text-[#6b7280]">{official.designation}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-4">
          {/* Profile header */}
          <div className="mb-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-[#0e4c5e] text-white text-[15px] font-bold flex items-center justify-center shrink-0">{official.initials}</div>
              <div>
                <h1 className="text-[20px] font-semibold text-[#1f2937] leading-tight">{official.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#e6f7f4] text-[#0f766e]">{official.designation}</span>
                  <span className="text-[#9ca3af]">•</span>
                  <span className="text-[12.5px] text-[#6b7280]">{official.username}</span>
                  <span className="text-[#9ca3af]">•</span>
                  <span className="text-[12.5px] text-[#6b7280]">Emp ID: {official.employeeId}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${official.status === 'Active' ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>{official.status}</span>
                </div>
              </div>
            </div>
          </div>

          {activeView === 'overview' && (
          <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'TOTAL ASSIGNED', value: String(myComplaints.length), iconBg: 'bg-[#eef2ff]', iconColor: 'text-[#4f46e5]', icon: 'clipboard' },
              { label: 'RESOLVED', value: String(resolved), iconBg: 'bg-[#e8f8ef]', iconColor: 'text-[#16a34a]', icon: 'check' },
              { label: 'PENDING', value: String(pending), iconBg: 'bg-[#fff7ed]', iconColor: 'text-[#ea580c]', icon: 'clock' },
              { label: 'TAGGED ZONES', value: String(zoneList.length), iconBg: 'bg-[#e6f7f4]', iconColor: 'text-[#0f766e]', icon: 'pin' },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-[#e8edf2] px-4 py-3.5 flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">{card.label}</p>
                  <p className="text-[28px] font-semibold text-[#111827] leading-none mt-1.5">{card.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-full ${card.iconBg} ${card.iconColor} flex items-center justify-center`}>
                  <NavIcon name={card.icon} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Zones card */}
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5">
              <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Tagged Operational Zones</h3>
              <div className="flex flex-wrap gap-2">
                {zoneList.map((z) => (
                  <span key={z} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f8fafc] border border-[#e8edf2] text-[12.5px] font-medium text-[#374151]">
                    <svg className="w-3.5 h-3.5 text-[#0f766e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {z}
                  </span>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#eef1f4] space-y-2 text-[12.5px]">
                <p className="text-[#6b7280]"><span className="font-semibold text-[#374151]">Phone:</span> {official.phone}</p>
                <p className="text-[#6b7280]"><span className="font-semibold text-[#374151]">Email:</span> {official.email}</p>
              </div>
            </div>

            {/* Complaints table */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#eef1f4]">
                <h3 className="text-[15px] font-semibold text-[#111827]">My Complaints</h3>
                <p className="text-[12px] text-[#9ca3af] mt-0.5">{myComplaints.length} complaints assigned to you</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#eef1f4]">
                      {['ID & DATE', 'COMPLAINT', 'LOCATION', 'SERVICE', 'DUE DATE', 'STATUS', 'ACTION'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {myComplaints.map((c) => (
                      <tr key={c.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafbfc]">
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-semibold text-[#111827]">#{c.id}</p>
                          <p className="text-[11px] text-[#9ca3af]">{c.date}</p>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#111827] max-w-[220px] truncate">{c.title}</td>
                        <td className="px-4 py-3 text-[13px] text-[#374151]">{c.location}</td>
                        <td className="px-4 py-3 text-[13px] text-[#374151]">{c.service}</td>
                        <td className="px-4 py-3 text-[13px] text-[#374151]">{c.dueDate}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusPill(c.status)}`}>{c.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setInspectComplaint(c)} className="px-2.5 py-1 text-[11.5px] font-semibold text-white bg-[#0e4c5e] rounded-md hover:bg-[#0b3c4a]">Inspect</button>
                        </td>
                      </tr>
                    ))}
                    {myComplaints.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#9ca3af]">No complaints assigned to this official yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </>
          )}

          {activeView === 'complaints' && (
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#eef1f4] flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827]">My Complaints</h3>
                  <p className="text-[12px] text-[#9ca3af] mt-0.5">{myComplaints.length} complaints assigned to you</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#eef1f4]">
                      {['ID & DATE', 'COMPLAINT', 'LOCATION', 'SERVICE', 'DUE DATE', 'STATUS', 'ACTION'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {myComplaints.map((c) => (
                      <tr key={c.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafbfc]">
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-semibold text-[#111827]">#{c.publicId || c.id}</p>
                          <p className="text-[11px] text-[#9ca3af]">{c.date}</p>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#111827] max-w-[260px] truncate">{c.title}</td>
                        <td className="px-4 py-3 text-[13px] text-[#374151]">{c.location}</td>
                        <td className="px-4 py-3 text-[13px] text-[#374151]">{c.service}</td>
                        <td className="px-4 py-3 text-[13px] text-[#374151]">{c.dueDate}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusPill(c.status)}`}>{c.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setInspectComplaint(c)} className="px-2.5 py-1 text-[11.5px] font-semibold text-white bg-[#0e4c5e] rounded-md hover:bg-[#0b3c4a]">Inspect</button>
                            <button onClick={() => updateComplaintStatus(c.id, c.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')} className={`px-2.5 py-1 text-[11.5px] font-semibold rounded-md ${c.status === 'COMPLETED' ? 'border border-[#fed7aa] text-[#c2410c] bg-[#fff7ed] hover:bg-[#ffedd5]' : 'bg-[#16a34a] text-white hover:bg-[#15803d]'}`}>
                              {c.status === 'COMPLETED' ? 'Reopen' : 'Complete'}
                            </button>
                            <button onClick={() => deleteComplaint(c.id)} className="p-1.5 text-[#dc2626] hover:bg-[#fef2f2] rounded-md" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {myComplaints.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#9ca3af]">No complaints assigned to this official yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'zones' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {zoneList.map((z) => {
                const zoneComplaints = isAllZones ? myComplaints.filter((c) => c.zone === z || c.location?.includes(z)) : myComplaints.filter((c) => c.zone === z || c.location?.includes(z))
                const zResolved = zoneComplaints.filter((c) => c.status === 'COMPLETED' || c.status === 'RESOLVED').length
                return (
                  <div key={z} className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#e6f7f4] flex items-center justify-center">
                        <svg className="w-4.5 h-4.5 w-5 h-5 text-[#0f766e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-[#111827] truncate">{z}</p>
                        <p className="text-[11px] text-[#9ca3af]">{zoneComplaints.length} complaints</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-[#f8fafc] py-2"><p className="text-[16px] font-bold text-[#111827]">{zoneComplaints.length}</p><p className="text-[10px] text-[#6b7280]">Total</p></div>
                      <div className="rounded-lg bg-[#fff7ed] py-2"><p className="text-[16px] font-bold text-[#ea580c]">{zoneComplaints.length - zResolved}</p><p className="text-[10px] text-[#6b7280]">Pending</p></div>
                      <div className="rounded-lg bg-[#e8f8ef] py-2"><p className="text-[16px] font-bold text-[#16a34a]">{zResolved}</p><p className="text-[10px] text-[#6b7280]">Resolved</p></div>
                    </div>
                  </div>
                )
              })}
              {zoneList.length === 0 && (
                <div className="col-span-full bg-white rounded-xl border border-[#e8edf2] p-10 text-center text-[13px] text-[#9ca3af]">No zones tagged to this official.</div>
              )}
            </div>
          )}

          {activeView === 'reports' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'TOTAL COMPLAINTS', value: myComplaints.length, cls: 'text-[#4f46e5] bg-[#eef2ff]' },
                  { label: 'RESOLVED', value: resolved, cls: 'text-[#16a34a] bg-[#e8f8ef]' },
                  { label: 'PENDING', value: pending, cls: 'text-[#ea580c] bg-[#fff7ed]' },
                  { label: 'RESOLUTION RATE', value: myComplaints.length ? Math.round((resolved / myComplaints.length) * 100) + '%' : '—', cls: 'text-[#0f766e] bg-[#e6f7f4]' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl border border-[#e8edf2] px-4 py-4">
                    <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">{s.label}</p>
                    <p className={`text-[26px] font-bold mt-1.5 inline-block px-3 py-1 rounded-lg ${s.cls}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#eef1f4]">
                  <h3 className="text-[15px] font-semibold text-[#111827]">Complaint Status Breakdown</h3>
                </div>
                <div className="p-5 space-y-3">
                  {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => {
                    const count = myComplaints.filter((c) => c.status === st).length
                    const pct = myComplaints.length ? Math.round((count / myComplaints.length) * 100) : 0
                    return (
                      <div key={st}>
                        <div className="flex justify-between text-[12.5px] mb-1">
                          <span className="font-medium text-[#374151]">{st.replace('_', ' ')}</span>
                          <span className="text-[#6b7280]">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#f3f4f6] overflow-hidden">
                          <div className={`h-full rounded-full ${st === 'COMPLETED' ? 'bg-[#16a34a]' : st === 'PENDING' ? 'bg-[#ea580c]' : 'bg-[#4f46e5]'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                  {myComplaints.length === 0 && <p className="text-[13px] text-[#9ca3af] text-center py-6">No complaint data for reports yet.</p>}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <RegisterComplaintModal open={showComplaintForm} onClose={() => setShowComplaintForm(false)} onSuccess={loadComplaints} source="itpo" />
      <ComplaintDetailsModal
        open={inspectComplaint != null}
        onClose={() => setInspectComplaint(null)}
        complaint={inspectComplaint}
        onStatusChange={(status) => { if (inspectComplaint) { updateComplaintStatus(inspectComplaint.id, status); setInspectComplaint(null) } }}
      />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f5f8]" />}>
      <OfficialDashboard />
    </Suspense>
  )
}
