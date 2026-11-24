'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import RegisterComplaintModal from '@/components/RegisterComplaintModal'
import ComplaintDetailsModal from '@/components/ComplaintDetailsModal'
import ZoneSelectModal from '@/components/ZoneSelectModal'
import AttendanceModal, { AttendanceRecord, StaffOption } from '@/components/AttendanceModal'
import AddSupervisorModal, { SupervisorFormData } from '@/components/AddSupervisorModal'
import AddFieldStaffModal, { FieldStaffFormData } from '@/components/AddFieldStaffModal'
import { logActivity } from '@/lib/activity'
import DocumentTitle from '@/components/DocumentTitle'
import { useToast } from '@/components/Toast'

export default function AgencyDashboardPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('Last 7 Days')
  const [agencyFilter, setAgencyFilter] = useState('All Agencies')
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [headerSearch, setHeaderSearch] = useState('')
  const [operationalZone, setOperationalZone] = useState('All Campus')
  useEffect(() => {
    const z = localStorage.getItem('bm360_assigned_zone')
    if (z) setOperationalZone(z === 'All Campus Zones (Entire Complex)' ? 'All Campus' : z)
  }, [])
  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (d?.user?.role) setSessionRole(d.user.role)
      const uid = d?.user?.uid || ''
      const phone = localStorage.getItem('mobileNumber') || ''
      fetch('/api/staff').then((r) => r.json()).then((sd) => {
        if (sd.ok && sd.staff) {
          const s = sd.staff.find((x: any) => x.username === uid || x.phone === uid || x.phone === phone)
          if (s) {
            const roleLabel = s.designation === 'Agency Manager' ? 'Agency Manager' : s.role === 'Supervisor' ? 'Agency Supervisor' : 'Field Staff'
            setMe({ name: s.name, role: roleLabel, agency: s.agency_name || '', agencyId: s.agency_id ?? null })
          } else if (d?.user?.name) {
            setMe({ name: d.user.name, role: d.user.role || '', agency: '', agencyId: null })
          }
        }
      }).catch(() => {})
    }).catch(() => {})
  }, [])
  useEffect(() => {
    fetch('/api/complaints').then((r) => r.json()).then((d) => {
      if (d.ok && d.complaints && d.complaints.length) setComplaints(d.complaints.map((c) => ({ id: c.id, date: new Date(c.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }), title: c.title || (c.description || '').slice(0, 60) || 'Complaint', description: c.description || '', status: c.status === 'COMPLETED' || c.status === 'RESOLVED' ? 'COMPLETED' : 'PENDING', completionTime: c.resolved_at ? 'Resolved' : undefined, location: c.sub_area ? c.zone + ' - ' + c.sub_area : c.zone || '—', subArea: c.sub_area || '', campus: 'Bharat Mandapam', service: c.service || c.complaint_type || 'General', agency: c.agency_name || '—', dueDate: c.due_date || '—', photo: c.photo_url || null, priority: 'HIGH', reportedBy: c.reporter_name || 'Citizen', reporterRole: c.reported_by || 'ITPO Official', publicId: c.public_id, resolvedAt: c.resolved_at, zone: c.zone })))
    }).catch(() => {})
    fetch('/api/staff').then((r) => r.json()).then((d) => {
      if (d.ok && d.staff && d.staff.length) {
        const mapped = d.staff.map((m) => ({ id: m.employee_id || 'SFM-'+m.id, dbId: m.id, agencyDbId: m.agency_id ?? null, name: m.name, role: m.role, designation: m.designation || m.role, username: m.username || '', phone: m.phone || '', agency: m.agency_name || agencyName, zones: m.zones || [], shift: m.shift || 'No Shift', status: m.status === 'Active' ? 'Active' : 'Pending' }))
        setStaffMembers(mapped)
      }
    }).catch(() => {})
  }, [])
  const [zoneModalOpen, setZoneModalOpen] = useState(false)
  const [overviewTab, setOverviewTab] = useState<'all' | 'pending' | 'completed'>('all')
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  // selectedComplaintId declared below with complaint history state
const [attendanceOpen, setAttendanceOpen] = useState(false)
const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
const [activeView, setActiveView] = useState<'overview' | 'complaints' | 'staff' | 'reports'>('overview')
const [userRole, setUserRole] = useState<'manager' | 'supervisor'>('manager')
const [sessionRole, setSessionRole] = useState('')
const isAdminViewer = sessionRole === 'Admin'
const [me, setMe] = useState<{ name: string; role: string; agency: string; agencyId: number | null }>({ name: '', role: '', agency: '', agencyId: null })
const [staffSearch, setStaffSearch] = useState('')
const [staffRoleFilter, setStaffRoleFilter] = useState('All Roles')
const [staffStatusFilter, setStaffStatusFilter] = useState('All Status')
const [copiedStaffId, setCopiedStaffId] = useState<string | null>(null)
const [supervisorFormOpen, setSupervisorFormOpen] = useState(false)
const [fieldStaffFormOpen, setFieldStaffFormOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    router.push('/')
  }

  const [complaints, setComplaints] = useState<any[]>([])

  const [complaintHistory, setComplaintHistory] = useState<Record<number, { action: string; timestamp: string; by: string }[]>>({})
  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(null)

  const handleComplaintStatus = (id: number, status: 'PENDING' | 'COMPLETED') => {
    const now = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    const by = displayName + ' (' + displayRole + ')'
    const action = status === 'COMPLETED' ? 'Complaint Closed / Completed' : 'Complaint Reopened'
    fetch('/api/complaints', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, actor: by, role: displayRole }) }).catch(() => {})
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status, completionTime: status === 'COMPLETED' ? `Completed on ${now}` : undefined } : c)))
    setComplaintHistory((prev) => ({ ...prev, [id]: [...(prev[id] || []), { action, timestamp: now, by }] }))
    logActivity(displayName, displayRole, action, `Complaint #${id}`)
    toast(status === 'COMPLETED' ? `Complaint #${id} closed successfully` : `Complaint #${id} reopened`, status === 'COMPLETED' ? 'success' : 'info')
  }

  const activeComplaint = selectedComplaintId != null ? complaints.find((c) => c.id === selectedComplaintId) || null : null

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

  const staffOptions: StaffOption[] = [
    { id: 1, name: 'Ramesh Singh', zone: 'Hall 1-5' },
    { id: 2, name: 'Suresh Gupta', zone: 'Hall 6-10' },
    { id: 3, name: 'Mahesh Verma', zone: 'Hall 11-14' },
    { id: 4, name: 'Anil Sharma', zone: 'Parking Area' },
  ]

  const handleMarkAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => [record, ...prev.filter((r) => r.staffId !== record.staffId)])
    fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(() => {})
    logActivity(displayName, displayRole, 'Attendance Marked', record.staffName + ' · ' + record.timestamp)

    toast('Attendance marked', 'success')
  }
  const [staffMembers, setStaffMembers] = useState<any[]>([])

  const isManager = userRole === 'manager' || sessionRole === 'Admin'
  const displayName = me.name || 'User'
  const displayRole = me.role || (sessionRole === 'Admin' ? 'Admin' : 'Agency Manager')
  const agencyName = me.agency || 'Agency'

  const handleAddSupervisor = (data: SupervisorFormData) => {
    setStaffMembers((prev) => [{
      id: data.employeeId || `SFM-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.fullName,
      role: 'Supervisor',
      designation: data.designation,
      username: data.username,
      phone: data.mobile,
      agency: agencyName,
      zones: [data.zone],
      shift: 'No Shift',
      status: 'Pending',
    }, ...prev])
    logActivity(displayName, displayRole, 'Supervisor Added', `${data.fullName} · ${data.designation} · ${data.zone}`)

    toast('Supervisor added', 'success')
    fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.fullName, role: 'Supervisor', designation: data.designation, username: data.username, phone: data.mobile, employeeId: data.employeeId, zones: [data.zone], status: 'Pending', agencyId: me.agencyId ?? 1 }) }).catch(() => {})
  }

  const handleAddFieldStaff = (data: FieldStaffFormData) => {
    setStaffMembers((prev) => [{
      id: data.employeeId || `SFM-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.fullName,
      role: 'Field Staff',
      designation: data.designation,
      username: data.username,
      phone: data.mobile,
      agency: agencyName,
      zones: [data.zone],
      shift: 'No Shift',
      status: 'Pending',
    }, ...prev])
    logActivity(displayName, displayRole, 'Field Staff Added', `${data.fullName} · ${data.designation} · ${data.zone}`)

    toast('Field Staff added', 'success')
    fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.fullName, role: 'Field Staff', designation: data.designation, username: data.username, phone: data.mobile, employeeId: data.employeeId, zones: [data.zone], status: 'Pending', agencyId: 1 }) }).catch(() => {})
  }
  const agencyStaff = staffMembers.filter((m) => me.agencyId == null || m.agencyDbId == null || m.agencyDbId === me.agencyId)
  const filteredStaff = agencyStaff.filter((m) => {
    const q = staffSearch.trim().toLowerCase()
    const matchQ = !q || [m.name, m.id, m.username, m.designation, m.phone, m.zones.join(' ')].some((v) => v.toLowerCase().includes(q))
    const matchRole = staffRoleFilter === 'All Roles' || m.role === staffRoleFilter
    const matchStatus = staffStatusFilter === 'All Status' || (staffStatusFilter === 'Active' ? m.status === 'Active' : m.status === 'Pending')
    return matchQ && matchRole && matchStatus
  })
  const supCount = agencyStaff.filter((m) => m.role === 'Supervisor').length
  const fieldCount = agencyStaff.filter((m) => m.role === 'Field Staff').length
  const activeCount = agencyStaff.filter((m) => m.status === 'Active').length
  const pendingCount = agencyStaff.filter((m) => m.status === 'Pending').length
  return (
    
      <div className="admin-shell min-h-screen flex bg-[#f3f5f8]">
      <DocumentTitle title="Agency Portal" />
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
              <span className="block text-[13px] font-semibold leading-tight">{agencyName}</span>
              <span className="block text-[10px] text-[#9ec3d0] leading-tight mt-0.5">BM360 · Agency Portal</span>
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
          <p className="px-2 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#7f9eab]">COMPLAINTS</p>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const active = item.id === activeView
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as 'overview' | 'complaints' | 'staff' | 'reports')}
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
            <p className="text-[13px] font-semibold leading-tight truncate">{displayName}</p>
            <p className="text-[11px] text-[#9ec3d0] leading-tight">{displayRole}</p>
          </div>
          <button onClick={handleLogout} className="text-[#9ec3d0] hover:text-white transition-colors" title="Logout">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>

        <div className="relative mx-3 mb-3 rounded-xl border border-[#1b8f84] bg-[#0c4654] px-3 py-2">
          <p className="text-[9px] font-semibold tracking-[0.12em] text-[#8fb4c0]">OPERATIONAL ZONE</p>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="text-[12px] text-white truncate">{operationalZone}</p>
            <button onClick={() => setZoneModalOpen(true)} className="shrink-0 inline-flex items-center gap-0.5 text-[12px] font-medium text-[#5eead4]">
              Change
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
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
              <button
                onClick={() => setZoneModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#e6f7f4] border border-[#b7e4d4] text-[12.5px] font-semibold text-[#0f766e] hover:bg-[#d7f0ea] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Change Zone
              </button>
              <div className="w-8 h-8 rounded-full bg-[#e8eefc] text-[#1d4ed8] text-[11px] font-bold flex items-center justify-center">LL</div>
              <div className="leading-tight">
                <p className="text-[12.5px] font-semibold text-[#111827]">{displayName}</p>
                <p className="text-[11px] text-[#6b7280]">{displayRole}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-4">
          {activeView === 'staff' ? (
          <div>
            {/* Staff header */}
            <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-[20px] font-semibold text-[#1f2937] leading-tight">Agency Staff &amp; Supervisors</h1>
                <p className="text-[13px] text-[#6b7280] mt-1">{isManager ? 'Manage staff, supervisors, zones and shifts.' : 'View-only access — contact your manager for changes.'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setUserRole(isManager ? 'supervisor' : 'manager')} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-lg border transition-colors ${isManager ? 'bg-[#0e4c5e] text-white border-[#0e4c5e]' : 'bg-white text-[#374151] border-[#e5e7eb] hover:bg-[#f8fafc]'}">
                  {isManager ? 'Manager Access' : 'Supervisor Access'}
                </button>
                {isManager && (
                  <><button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f8fafc]"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Refresh</button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f8fafc]"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Export to Excel</button></>
                )}
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
              {([
                { label: 'TOTAL STAFF', value: staffMembers.length, color: 'text-[#111827]' },
                { label: 'SUPERVISORS', value: supCount, color: 'text-[#4f46e5]' },
                { label: 'FIELD STAFF', value: fieldCount, color: 'text-[#111827]' },
                { label: 'ACTIVE', value: activeCount, color: 'text-[#16a34a]' },
                { label: 'PENDING', value: pendingCount, color: 'text-[#ea580c]' },
              ]).map((c) => (
                <div key={c.label} className="bg-white rounded-xl border border-[#e8edf2] px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">{c.label}</p>
                  <p className={`text-[28px] font-semibold leading-none mt-1.5 ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <svg className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} placeholder="Search staff, ID, username, designation, zone..." className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-[#e5e7eb] text-[13px]" />
              </div>
              {[
                { val: staffRoleFilter, set: setStaffRoleFilter, opts: ['All Roles', 'Supervisor', 'Field Staff'] },
                { val: staffStatusFilter, set: setStaffStatusFilter, opts: ['All Status', 'Active', 'Pending'] },
              ].map((f, i) => (
                <select key={i} value={f.val} onChange={(e) => f.set(e.target.value)} className="h-9 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] text-[#374151]">
                  {f.opts.map((o) => <option key={o}>{o}</option>)}
                </select>
              ))}
              {isManager && (
                <>
                <button onClick={() => setFieldStaffFormOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Field Staff
                </button>
                <button onClick={() => setSupervisorFormOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-[#0f766e] bg-[#e6f7f4] border border-[#b7e4d4] rounded-lg hover:bg-[#d7f0ea]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Add Supervisor
                </button>
                </>
              )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#eef1f4]">
                      {['#', 'STAFF', 'ID', 'ROLE / DESIGNATION', 'USERNAME', 'PHONE', 'AGENCY', 'ZONES', 'SHIFT', 'STATUS', 'ACTIONS'].map((h) => (
                        <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((m, idx) => {
                      const ini = m.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                      return (
                        <tr key={m.id + idx} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafbfc]">
                          <td className="px-3 py-3 text-[12px] text-[#9ca3af]">{idx + 1}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#0e4c5e] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{ini}</div>
                              <div className="min-w-0"><p className="text-[13px] font-semibold text-[#111827] truncate max-w-[120px]">{m.name}</p><p className="text-[10.5px] text-[#9ca3af]">{m.role === 'Supervisor' ? '★ Direct (Agency Ops)' : 'Agency Staff'}</p></div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-[12px] font-medium text-[#374151] whitespace-nowrap">{m.id}</td>
                          <td className="px-3 py-3">
                            <p className="text-[12.5px] font-semibold text-[#111827]">{m.role}</p>
                            <p className="text-[11px] text-[#6b7280]">{m.designation}</p>
                          </td>
                          <td className="px-3 py-3 text-[12px] text-[#0f766e] whitespace-nowrap">{m.username}</td>
                          <td className="px-3 py-3 text-[12.5px] text-[#374151] whitespace-nowrap">{m.phone}</td>
                          <td className="px-3 py-3 text-[12.5px] text-[#374151] whitespace-nowrap">{m.agency}</td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {m.zones.slice(0, 2).map((z) => <span key={z} className="px-1.5 py-0.5 rounded bg-[#f3f4f6] text-[10px] font-medium text-[#4b5563] whitespace-nowrap">{z}</span>)}
                              {m.zones.length > 2 && <span className="px-1.5 py-0.5 rounded bg-[#f3f4f6] text-[10px] font-medium text-[#6b7280]">+{m.zones.length - 2} more</span>}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-[12px] text-[#6b7280] whitespace-nowrap">{m.shift}</td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${m.status === 'Active' ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#fff7ed] text-[#ea580c]'}`}>{m.status}</span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {isManager && (
                                <>
                                  <button title="Edit Staff Details" className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[#0f766e] hover:bg-[#e6f7f4] transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                  </button>
                                  <button title="Schedule / View Shifts by Date" className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[#d97706] hover:bg-[#fff7ed] transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  </button>
                                  <button title="Manage Zones" className="px-2 py-1 text-[11.5px] font-medium text-[#0f766e] bg-[#e6f7f4] rounded-md hover:bg-[#d7f0ea]">Zones</button>
                                </>
                              )}
                              <button
                                title="Copy Username"
                                onClick={() => { navigator.clipboard?.writeText(m.username); setCopiedStaffId(m.id); setTimeout(() => setCopiedStaffId(null), 1500) }}
                                className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f8fafc] transition-colors"
                              >
                                {copiedStaffId === m.id ? (
                                  <svg className="w-3.5 h-3.5 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                                )}
                              </button>
                              {isManager && m.status === 'Pending' && <button onClick={() => { fetch('/api/staff', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: m.dbId, name: m.name, role: m.role, designation: m.designation, username: m.username, phone: m.phone, employeeId: m.id, zones: m.zones, shift: m.shift, status: 'Active', agencyId: 1 }) }).then(() => { setStaffMembers((prev) => prev.map((x) => x.dbId === m.dbId ? { ...x, status: 'Active' } : x)); logActivity(m.username, displayRole, 'Staff Activated', m.name) }) }} className="px-2 py-1 text-[11.5px] font-medium text-[#16a34a] bg-[#e8f8ef] rounded-md hover:bg-[#d7f0ea]">Activate</button>}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredStaff.length === 0 && (
                      <tr><td colSpan={11} className="px-4 py-10 text-center text-[13px] text-[#9ca3af]">No staff match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!isManager && (
                <div className="px-5 py-3 border-t border-[#eef1f4] bg-[#f8fafc]">
                  <p className="text-[12px] text-[#9ca3af]">Supervisor view — read-only. Switch to Manager Access to add/edit staff.</p>
                </div>
              )}
            </div>
          </div>
          ) : (
          <>
          {/* Greeting Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 w-9 h-9 rounded-full bg-white border border-[#e6ebf0] flex items-center justify-center text-[#1f8f86] shrink-0">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                </div>
                <div>
                  <h1 className="text-[20px] font-semibold text-[#1f2937] leading-tight">Good Afternoon, {displayName}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#e6f7f4] text-[#0f766e]">Agency Manager</span>
                    <span className="text-[#9ca3af]">•</span>
                    <span className="text-[12.5px] text-[#6b7280]">{operationalZone}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end shrink-0">
                <button
                  onClick={() => setAttendanceOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-[#0f766e] bg-[#e6f7f4] border border-[#b7e4d4] rounded-lg hover:bg-[#d7f0ea] shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Daily Attendance
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${attendanceRecords.length ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#fff7ed] text-[#ea580c]'}`}>
                    {attendanceRecords.length ? `${attendanceRecords.length} Marked Today` : 'Pending'}
                  </span>
                </button>
                <button
                  onClick={() => setShowComplaintForm(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  New Complaint
                </button>
              </div>
            </div>
          </div>

          {attendanceRecords.length > 0 && (
            <div className="mb-4 bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="text-[13.5px] font-semibold text-[#111827]">Daily Attendance</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#e8f8ef] text-[#16a34a]">{attendanceRecords.length} Marked Today</span>
              </div>
              <div className="space-y-2">
                {attendanceRecords.slice(0, 5).map((r) => {
                  const ini = r.staffName.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                  return (
                    <div key={r.staffId} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#f8fafc] border border-[#e8edf2]">
                      <div className="w-8 h-8 rounded-full bg-[#0e4c5e] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{ini}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[12.5px] font-semibold text-[#111827]">{r.staffName}</p>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#e8f8ef] text-[#16a34a]">Marked Today</span>
                        </div>
                        <p className="text-[11px] text-[#6b7280] mt-0.5">{r.timestamp}{r.gps ? ` · ${r.gps}` : ''}</p>
                      </div>
                      {r.photo && <img src={r.photo} alt="Attendance" className="w-9 h-9 rounded-lg object-cover border border-[#e8edf2] shrink-0" />}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeView === 'overview' && (
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
                  <p className="text-[28px] font-semibold text-[#111827] leading-none mt-1.5">{complaints.length}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#eef2ff] text-[#4f46e5] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
              </div>
              <div onClick={() => setOverviewTab((prev) => (prev === 'pending' ? 'all' : 'pending'))} role="button" className={`bg-white rounded-xl border px-4 py-3.5 flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)] cursor-pointer transition-all ${overviewTab === 'pending' ? 'border-[#1b8f84] ring-2 ring-[#1b8f84]/30' : 'border-[#e8edf2] hover:shadow-md'}`}>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">PENDING COMPLAINTS</p>
                  <p className="text-[28px] font-semibold text-[#ea580c] leading-none mt-1.5">{complaints.filter((c) => c.status === 'PENDING').length}</p>
                  <p className="text-[11px] text-[#e11d48] mt-1">Past SLA</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#fff7ed] text-[#ea580c] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
              <div onClick={() => setOverviewTab((prev) => (prev === 'completed' ? 'all' : 'completed'))} role="button" className={`bg-white rounded-xl border px-4 py-3.5 flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)] cursor-pointer transition-all ${overviewTab === 'completed' ? 'border-[#1b8f84] ring-2 ring-[#1b8f84]/30' : 'border-[#e8edf2] hover:shadow-md'}`}>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">COMPLETED COMPLAINTS</p>
                  <p className="text-[28px] font-semibold text-[#16a34a] leading-none mt-1.5">{complaints.filter((c) => c.status === 'COMPLETED').length}</p>
                  <p className="text-[11px] text-[#9ca3af] mt-1">Resolved</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#e8f8ef] text-[#16a34a] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
            </div>
          </div>

          )}

          {(activeView === 'overview' || activeView === 'complaints') && (
          <>
          {activeView === 'complaints' && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'TOTAL COMPLAINTS', value: complaints.length, cls: 'text-[#111827]' },
                { label: 'PENDING', value: complaints.filter((c) => c.status === 'PENDING').length, cls: 'text-[#ea580c]' },
                { label: 'COMPLETED', value: complaints.filter((c) => c.status === 'COMPLETED').length, cls: 'text-[#16a34a]' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-[#e8edf2] px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">{s.label}</p>
                  <p className={`text-[26px] font-bold mt-1 ${s.cls}`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}
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
                  <option>{agencyName}</option>
                  <option>BLUSPRING ENTERPRISES LTD.</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#eef1f4]">
                    {['PHOTO', 'ID & DATE', 'COMPLAINT', 'LOCATION', 'SERVICE', 'STATUS', 'PRIORITY', 'ASSIGNED AGENCY', 'DUE DATE', 'ACTION'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafbfc] cursor-pointer"
                      onClick={() => setSelectedComplaintId(complaint.id)}
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
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${complaint.status === 'COMPLETED' ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#fff7ed] text-[#ea580c]'}`}>{complaint.status}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${complaint.priority === 'URGENT' ? 'bg-[#fef2f2] text-[#dc2626]' : complaint.priority === 'HIGH' ? 'bg-[#fff7ed] text-[#ea580c]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>{complaint.priority || 'HIGH'}</span>
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-[#374151]">{complaint.agency && complaint.agency && complaint.agency !== '—' ? complaint.agency : agencyName}</td>
                      <td className="px-4 py-3.5 text-[13px] text-[#374151]">{complaint.dueDate && complaint.dueDate !== '—' ? complaint.dueDate : '—'}</td>
                      <td className="px-4 py-3.5">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedComplaintId(complaint.id) }} className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-semibold text-white bg-[#0e4c5e] rounded-md hover:bg-[#0b3c4a]">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          Inspect
                        </button>
                      </td>
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
          </>
          )}

          {activeView === 'reports' && (
          <div>
            <div className="mb-4">
              <h1 className="text-[20px] font-semibold text-[#1f2937] leading-tight">Reports & Analytics</h1>
              <p className="text-[13px] text-[#6b7280] mt-1">Complaint and staff performance across your agency zones.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              {[{ l: 'TOTAL COMPLAINTS', v: '54', c: 'text-[#111827]' }, { l: 'RESOLVED', v: '51', c: 'text-[#16a34a]' }, { l: 'AVG RESOLUTION', v: '2.4h', c: 'text-[#111827]' }, { l: 'SLA COMPLIANCE', v: '94%', c: 'text-[#0f766e]' }].map((c) => (
                <div key={c.l} className="bg-white rounded-xl border border-[#e8edf2] px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">{c.l}</p>
                  <p className={`text-[28px] font-semibold leading-none mt-1.5 ${c.c}`}>{c.v}</p>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5">
                <h3 className="text-[14px] font-semibold text-[#111827] mb-4">Complaints by Zone</h3>
                {[['Hall 1-5', 14, '#0e4c5e'], ['Hall 6-10', 11, '#0f766e'], ['Hall 11-14', 9, '#1b8f84'], ['Admin Building', 8, '#12786f'], ['Parking & Open Areas', 7, '#0d9488'], ['Other Zones', 5, '#14b8a6']].map(([z, v, col]) => (
                  <div key={z as string} className="mb-3">
                    <div className="flex justify-between text-[12px] mb-1"><span className="text-[#374151] font-medium">{z}</span><span className="text-[#6b7280]">{v}</span></div>
                    <div className="h-2 rounded-full bg-[#f3f4f6]"><div className="h-2 rounded-full" style={{ width: `${(v as number) / 14 * 100}%`, background: col as string }} /></div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5">
                <h3 className="text-[14px] font-semibold text-[#111827] mb-4">Staff Summary</h3>
                {[['Active Supervisors', supCount, '#4f46e5'], ['Field Staff', fieldCount, '#0e4c5e'], ['Pending Activation', pendingCount, '#ea580c'], ['Zones Covered', new Set(staffMembers.flatMap((m) => m.zones)).size, '#16a34a']].map(([l, v, col]) => (
                  <div key={l as string} className="flex items-center justify-between py-2.5 border-b border-[#f3f4f6] last:border-0">
                    <span className="text-[13px] text-[#374151]">{l}</span>
                    <span className="text-[15px] font-semibold" style={{ color: col as string }}>{v}</span>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-[#eef1f4]">
                  <p className='text-[12px] text-[#9ca3af]'>Reports are generated from live portal data. Export options available for managers.</p>
                </div>
              </div>
            </div>
          </div>
          )}
          </>
          )}
        </main>
      </div>
      <RegisterComplaintModal open={showComplaintForm} onClose={() => setShowComplaintForm(false)} source="agency" />
      <ComplaintDetailsModal
        open={activeComplaint != null}
        complaint={activeComplaint}
        history={activeComplaint ? complaintHistory[activeComplaint.id] || [] : []}
        onStatusChange={activeComplaint ? (status) => handleComplaintStatus(activeComplaint.id, status) : undefined}
        onClose={() => setSelectedComplaintId(null)}
      />
      <ZoneSelectModal
        open={zoneModalOpen}
        onClose={() => setZoneModalOpen(false)}
        currentZone={operationalZone}
        onConfirm={(zone) => { const z = zone === 'All Campus Zones (Entire Complex)' ? 'All Campus' : zone; setOperationalZone(z); setZoneModalOpen(false); logActivity(displayName, displayRole, 'Zone Switched', z); toast('Zone switched to ' + z, 'info') }}
      />
      <AddSupervisorModal
        open={supervisorFormOpen}
        onClose={() => setSupervisorFormOpen(false)}
        agencyName={agencyName}
        onSubmit={handleAddSupervisor}
      />
      <AddFieldStaffModal
        open={fieldStaffFormOpen}
        onClose={() => setFieldStaffFormOpen(false)}
        agencyName={agencyName}
        supervisors={staffMembers.filter((m) => m.role === 'Supervisor').map((m) => ({ name: m.name, username: m.username }))}
        onSubmit={handleAddFieldStaff}
      />
      <AttendanceModal
        open={attendanceOpen}
        onClose={() => setAttendanceOpen(false)}
        staff={staffOptions}
        markedIds={attendanceRecords.map((r) => r.staffId)}
        onMark={handleMarkAttendance}
      />
    </div>
  )
}
