'use client'


import { translations, Language } from '@/lib/translations'
import ItpoOfficialFormModal from '@/components/ItpoOfficialFormModal'
import ZoneSelectModal from '@/components/ZoneSelectModal'
import ZoneFormModal from '@/components/ZoneFormModal'
import { defaultZones, ZoneRecord } from '@/lib/zones'
import AgencyFormModal from '@/components/AgencyFormModal'
import AttendanceModal, { AttendanceRecord, StaffOption } from '@/components/AttendanceModal'
import { defaultAgencies, AgencyRecord, defaultEmployees, EmployeeRecord } from '@/lib/agencies'
import ImportEmployeesModal, { ImportedEmployee } from '@/components/ImportEmployeesModal'
import DocumentTitle from '@/components/DocumentTitle'
import QrCodeModal from '@/components/QrCodeModal'
import QRCode from 'qrcode'
import { QrRecord, buildQrPayload, loadQrRecords, saveQrRecords } from '@/lib/qrcodes'
import { useEffect, useState } from 'react'

type ViewType = 'overview' | 'complaint-register' | 'housekeeping-ranking' | 'itpo-performance' | 'master-data-hub' | 'zones-areas' | 'agencies' | 'itpo-officials' | 'field-staff' | 'escalation-settings' | 'all-complaints' | 'resolved' | 'pending' | 'qr-manager'

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<ViewType>('itpo-officials')
  const [language, setLanguage] = useState<Language>('en')
  const [searchQuery, setSearchQuery] = useState('Mr. Premjit Lal')
  const [filterZone, setFilterZone] = useState('All Zone Tagging Scopes')
  const [statusFilter, setStatusFilter] = useState('Active Only')
  const [opsOpen, setOpsOpen] = useState(true)
  const [headerSearch, setHeaderSearch] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [zoneModalOpen, setZoneModalOpen] = useState(false)
const [zones, setZones] = useState<ZoneRecord[]>(defaultZones)
const [zoneFormOpen, setZoneFormOpen] = useState(false)
const [editingZone, setEditingZone] = useState<ZoneRecord | null>(null)
const [zoneSearch, setZoneSearch] = useState('')
const [qrRecords, setQrRecords] = useState<QrRecord[]>([])
const [qrFormOpen, setQrFormOpen] = useState(false)
const [editingQr, setEditingQr] = useState<QrRecord | null>(null)
const [qrSearch, setQrSearch] = useState('')
const [qrStatusFilter, setQrStatusFilter] = useState('All Status')
const [qrThumbs, setQrThumbs] = useState<Record<string, string>>({})
const [qrOrigin, setQrOrigin] = useState('')
const [agencies, setAgencies] = useState<AgencyRecord[]>(defaultAgencies)
const [agencyFormOpen, setAgencyFormOpen] = useState(false)
const [editingAgency, setEditingAgency] = useState<AgencyRecord | null>(null)
const [agencySearch, setAgencySearch] = useState('')
const [employees, setEmployees] = useState<EmployeeRecord[]>(defaultEmployees)
const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null)
const [importOpen, setImportOpen] = useState(false)
const [employeeSearch, setEmployeeSearch] = useState('')
const [attendanceOpen, setAttendanceOpen] = useState(false)
const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [operationalZone, setOperationalZone] = useState('Unassigned (Set Zone)')
  const [showItpoForm, setShowItpoForm] = useState(false)

  const t = translations[language]

  const officials = [
    {
      id: 1,
      name: 'Mr. Premjit Lal',
      initials: 'MP',
      username: '@mrpremjitlal',
      employeeId: '9123',
      designation: 'ED',
      phone: '9868217057',
      email: 'editpo@itpo.gov.in',
      zones: 'All Zones (Entire Complex)',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Mrs. Sunita Sharma',
      initials: 'SS',
      username: '@sunitasharma',
      employeeId: '9124',
      designation: 'Manager',
      phone: '9868217058',
      email: 'sunita@itpo.gov.in',
      zones: 'Hall 1-5',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Mr. Rajesh Kumar',
      initials: 'RK',
      username: '@rajeshkumar',
      employeeId: '9125',
      designation: 'Supervisor',
      phone: '9868217059',
      email: 'rajesh@itpo.gov.in',
      zones: 'Hall 6-10',
      status: 'Inactive'
    }
  ]

  const complaints = [
    {
      id: 54,
      date: 'Nov 17 10:42 AM',
      title: 'URGENT Housekeeping Work During Fair',
      status: 'COMPLETED',
      priority: 'HIGH',
      location: 'Hall 14 - Outside Hall 14',
      campus: 'Bharat Mandapam',
      service: 'Housekeeping Operations',
      agency: 'BLUSPRING ENTERPRISES LTD.',
      dueDate: '11:12 AM Nov 17',
      assignedTo: 'Mr. Premjit Lal'
    },
    {
      id: 53,
      date: 'Nov 17 09:30 AM',
      title: 'Please don\'t keep like this... premises should be clean',
      status: 'PENDING',
      priority: 'URGENT',
      location: 'Open Area, NTA (parking)',
      campus: 'Bharat Mandapam',
      service: 'Housekeeping Operations',
      agency: 'Soni Facility Management',
      dueDate: '11:12 PM Nov 16',
      assignedTo: 'Mrs. Sunita Sharma'
    },
    {
      id: 52,
      date: 'Nov 16 08:15 PM',
      title: 'Female washroom cleaning required',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      location: 'GF H4',
      campus: 'Bharat Mandapam',
      service: 'Housekeeping Operations',
      agency: 'Soni Facility Management',
      dueDate: '08:12 PM Nov 16',
      assignedTo: 'Mr. Rajesh Kumar'
    }
  ]


  const areas = [
    { id: 1, name: 'Main Entrance', zone: 'Hall 1-5', type: 'Common Area', status: 'Active' },
    { id: 2, name: 'Conference Room A', zone: 'Hall 6-10', type: 'Meeting Space', status: 'Active' },
    { id: 3, name: 'Exhibition Hall', zone: 'Hall 11-14', type: 'Event Space', status: 'Active' },
    { id: 4, name: 'Food Court', zone: 'Hall 1-5', type: 'Dining Area', status: 'Active' }
  ]

  const categories = [
    { id: 1, name: 'Housekeeping', description: 'Cleaning and maintenance services', complaints: 45, status: 'Active' },
    { id: 2, name: 'Electrical', description: 'Electrical repairs and maintenance', complaints: 12, status: 'Active' },
    { id: 3, name: 'Plumbing', description: 'Plumbing and water-related issues', complaints: 8, status: 'Active' },
    { id: 4, name: 'HVAC', description: 'Air conditioning and ventilation', complaints: 5, status: 'Active' }
  ]

  const filteredOfficials = officials.filter((official) => {
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch = !query || [official.name, official.username, official.email, official.phone, official.employeeId]
      .some((value) => value.toLowerCase().includes(query))
    const matchesZone = filterZone === 'All Zone Tagging Scopes'
      || (filterZone === 'All Zones (Entire Complex)' ? official.zones.includes('All Zones') : !official.zones.includes('All Zones'))
    const matchesStatus = statusFilter === 'All Status'
      || (statusFilter === 'Active Only' ? official.status === 'Active' : official.status === 'Inactive')
    return matchesSearch && matchesZone && matchesStatus
  })

  const visibleOfficials = filteredOfficials.slice(0, rowsPerPage)

  const filteredZones = zones.filter((z) => z.name.toLowerCase().includes(zoneSearch.trim().toLowerCase()))

  const handleSaveZone = (data: Omit<ZoneRecord, 'id'> & { id?: number }) => {
    if (data.id) {
      setZones(zones.map((z) => (z.id === data.id ? { ...z, ...data } : z)))
    } else {
      setZones([...zones, { ...data, id: Math.max(...zones.map((z) => z.id), 0) + 1 }])
    }
  }

  const handleDeleteZone = (id: number) => {
    if (window.confirm('Are you sure you want to delete this zone?')) {
      setZones(zones.filter((z) => z.id !== id))
    }
  }

  const filteredAgencies = agencies.filter((a) =>
    [a.name, a.contactPerson, a.phone, a.email].some((v) => v.toLowerCase().includes(agencySearch.trim().toLowerCase()))
  )

  const handleSaveAgency = (data: Omit<AgencyRecord, 'id'> & { id?: number }) => {
    if (data.id) {
      setAgencies(agencies.map((a) => (a.id === data.id ? { ...a, ...data } : a)))
    } else {
      setAgencies([...agencies, { ...data, id: Math.max(...agencies.map((a) => a.id), 0) + 1 }])
    }
  }

  const handleDeleteAgency = (id: number) => {
    if (window.confirm('Are you sure you want to delete this agency?')) {
      setAgencies(agencies.filter((a) => a.id !== id))
    }
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
  }

  const handleImportEmployees = (items: ImportedEmployee[]) => {
    if (!selectedAgencyId) return
    const base = Math.max(...employees.map((e) => e.id), 0)
    setEmployees([...employees, ...items.map((it, i) => ({ ...it, id: base + i + 1, agencyId: selectedAgencyId, status: 'Active' as const }))])
    setAgencies(agencies.map((a) => (a.id === selectedAgencyId ? { ...a, employeeCount: a.employeeCount + items.length } : a)))
  }

  const handleDeleteEmployee = (id: number) => {
    const emp = employees.find((e) => e.id === id)
    if (emp && window.confirm(`Delete ${emp.name}?`)) {
      setEmployees(employees.filter((e) => e.id !== id))
      setAgencies(agencies.map((a) => (a.id === emp.agencyId ? { ...a, employeeCount: Math.max(a.employeeCount - 1, 0) } : a)))
    }
  }

  const renderContent = () => {
    if (selectedAgencyId) {
      const agency = agencies.find((a) => a.id === selectedAgencyId)
      if (agency) {
        const agencyEmployees = employees.filter((e) => e.agencyId === agency.id)
        const activeEmp = agencyEmployees.filter((e) => e.status === 'Active').length
        const agencyComplaints = complaints.filter((c) => c.agency === agency.name)
        const resolvedC = agencyComplaints.filter((c) => c.status === 'COMPLETED' || c.status === 'RESOLVED').length
        const initials = agency.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
        const filteredEmp = agencyEmployees.filter((e) => e.name.toLowerCase().includes(employeeSearch.trim().toLowerCase()) || e.role.toLowerCase().includes(employeeSearch.trim().toLowerCase()) || e.zone.toLowerCase().includes(employeeSearch.trim().toLowerCase()))
        return (
          <div>
            <button onClick={() => { setSelectedAgencyId(null); setEmployeeSearch('') }} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0f766e] hover:text-[#0b3c4a] mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" /></svg>
              Back to Agencies
            </button>

            {/* Agency header card */}
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 mb-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#0e4c5e] text-white text-[18px] font-bold flex items-center justify-center shrink-0">{initials}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-[20px] font-semibold text-[#1f2937]">{agency.name}</h1>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${agency.status === 'Active' ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>{agency.status}</span>
                    </div>
                    <p className="text-[12px] text-[#9ca3af] mt-0.5">ID: AG-{String(agency.id).padStart(3, '0')} • Partner since {agency.joinedDate}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {agency.services.map((svc) => <span key={svc} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#eef2ff] text-[#4f46e5]">{svc}</span>)}
                    </div>
                  </div>
                </div>
                <div className="text-[12.5px] text-[#6b7280] space-y-1">
                  <p><span className="font-semibold text-[#374151]">Contact:</span> {agency.contactPerson}</p>
                  <p><span className="font-semibold text-[#374151]">Phone:</span> {agency.phone}</p>
                  <p><span className="font-semibold text-[#374151]">Email:</span> {agency.email}</p>
                  <p><span className="font-semibold text-[#374151]">Address:</span> {agency.address}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#eef1f4]">
                <p className="text-[11px] font-semibold tracking-[0.05em] text-[#9ca3af] uppercase mb-2">Operational Zones ({agency.zones.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {agency.zones.length ? agency.zones.map((z) => (
                    <span key={z} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f8fafc] border border-[#e8edf2] text-[12px] font-medium text-[#374151]">
                      <svg className="w-3 h-3 text-[#0f766e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {z}
                    </span>
                  )) : <span className="text-[12.5px] text-[#9ca3af]">No zones assigned</span>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {([
                { label: 'TOTAL EMPLOYEES', value: String(agency.employeeCount), iconBg: 'bg-[#eef2ff]', iconColor: 'text-[#4f46e5]' },
                { label: 'ACTIVE STAFF', value: String(activeEmp), iconBg: 'bg-[#e8f8ef]', iconColor: 'text-[#16a34a]' },
                { label: 'ZONES COVERED', value: String(agency.zones.length), iconBg: 'bg-[#e6f7f4]', iconColor: 'text-[#0f766e]' },
                { label: 'COMPLAINTS HANDLED', value: String(agencyComplaints.length), iconBg: 'bg-[#fff7ed]', iconColor: 'text-[#ea580c]' },
              ]).map((c) => (
                <div key={c.label} className="bg-white rounded-xl border border-[#e8edf2] px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">{c.label}</p>
                  <p className="text-[28px] font-semibold text-[#111827] leading-none mt-1.5">{c.value}</p>
                </div>
              ))}
            </div>

            {/* Employees section */}
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#eef1f4] flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827]">Employees</h3>
                  <p className="text-[12px] text-[#9ca3af] mt-0.5">{filteredEmp.length} of {agencyEmployees.length} imported employees</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <svg className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)} placeholder="Search employees..." className="w-52 h-9 pl-9 pr-3 rounded-lg bg-white border border-[#e5e7eb] text-[13px]" />
                  </div>
                  <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Import Employees
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#eef1f4]">
                      {['EMPLOYEE', 'ROLE', 'PHONE', 'ZONE', 'SHIFT', 'STATUS', ''].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmp.map((emp) => {
                      const ini = emp.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                      return (
                        <tr key={emp.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafbfc]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#e6f7f4] text-[#0f766e] text-[11px] font-bold flex items-center justify-center">{ini}</div>
                              <p className="text-[13.5px] font-semibold text-[#111827]">{emp.name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#374151]">{emp.role}</td>
                          <td className="px-4 py-3 text-[13px] text-[#374151]">{emp.phone}</td>
                          <td className="px-4 py-3 text-[13px] text-[#374151]">{emp.zone}</td>
                          <td className="px-4 py-3 text-[13px] text-[#374151]">{emp.shift}</td>
                          <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${emp.status === 'Active' ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>{emp.status}</span></td>
                          <td className="px-4 py-3"><button onClick={() => handleDeleteEmployee(emp.id)} className="px-2.5 py-1 text-[12px] font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2]">Delete</button></td>
                        </tr>
                      )
                    })}
                    {filteredEmp.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#9ca3af]">No employees found — use Import Employees to add staff.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      }
    }
    switch (currentView) {
      case 'overview':
        return (
          
      <div>
            <div className="mb-6">
              <h1 className="text-[20px] font-semibold text-[#1f2937] mb-2">{t.dashboardOverview}</h1>
              <p className="text-[13px] text-[#6b7280]">{t.welcomeMessage}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div onClick={() => setCurrentView('all-complaints')} role="button" className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 cursor-pointer hover:border-[#1b8f84] hover:shadow-md transition-all">
                <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280] mb-1">{t.totalComplaints}</p>
                <p className="text-[28px] font-semibold text-[#111827]">156</p>
              </div>
              <div onClick={() => setCurrentView('pending')} role="button" className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 cursor-pointer hover:border-[#1b8f84] hover:shadow-md transition-all">
                <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280] mb-1">{t.pendingComplaints}</p>
                <p className="text-3xl font-bold text-orange-600">23</p>
              </div>
              <div onClick={() => setCurrentView('resolved')} role="button" className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 cursor-pointer hover:border-[#1b8f84] hover:shadow-md transition-all">
                <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280] mb-1">{t.resolvedComplaints}</p>
                <p className="text-3xl font-bold text-green-600">128</p>
              </div>
              <div onClick={() => setCurrentView('pending')} role="button" className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 cursor-pointer hover:border-[#1b8f84] hover:shadow-md transition-all">
                <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280] mb-1">{t.overdueComplaints}</p>
                <p className="text-3xl font-bold text-red-600">5</p>
              </div>
            </div>
          </div>
        )

      case 'complaint-register':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-[20px] font-semibold text-[#1f2937] mb-2">Complaint Register</h1>
              <p className="text-[13px] text-[#6b7280]">View and manage all complaints across Bharat Mandapam</p>
            </div>
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-[#eef1f4]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Agency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-[#fafbfc]">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{complaint.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.title}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          complaint.status === 'COMPLETED' ? 'bg-[#e8f8ef] text-[#16a34a]' :
                          complaint.status === 'PENDING' ? 'bg-[#fff7ed] text-[#ea580c]' :
                          'bg-[#eef2ff] text-[#4f46e5]'
                        }`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          complaint.priority === 'URGENT' ? 'bg-[#fef2f2] text-[#dc2626]' :
                          complaint.priority === 'HIGH' ? 'bg-[#fff7ed] text-[#ea580c]' :
                          'bg-[#f3f4f6] text-[#6b7280]'
                        }`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.agency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'itpo-officials':
        return (
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 w-9 h-9 rounded-full bg-white border border-[#e6ebf0] flex items-center justify-center text-[#1f8f86] shrink-0">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-[20px] font-semibold text-[#1f2937] leading-tight">ITPO Officials Directory</h1>
                  <p className="text-[13px] text-[#6b7280] mt-0.5">Manage authorized ITPO Officials and their operational zone tagging across Bharat Mandapam.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#374151] hover:bg-white rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#fafbfc]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export to Excel
                </button>
                <button onClick={() => setShowItpoForm(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#2563eb] rounded-lg hover:bg-[#1d4ed8] shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add ITPO Official
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-3">
              {[
                { label: 'TOTAL ITPO OFFICIALS', value: '124', iconBg: 'bg-[#eef2ff]', iconColor: 'text-[#4f46e5]', icon: 'shield' },
                { label: 'CAMPUS-WIDE (ALL ZONES)', value: '72', iconBg: 'bg-[#f3e8ff]', iconColor: 'text-[#7c3aed]', icon: 'globe' },
                { label: 'ZONE-SPECIFIC TAGGED', value: '52', iconBg: 'bg-[#e6f7f4]', iconColor: 'text-[#0f766e]', icon: 'pin' },
                { label: 'ACTIVE ACCOUNTS', value: '122', iconBg: 'bg-[#e8f8ef]', iconColor: 'text-[#16a34a]', icon: 'check' },
              ].map((card) => (
                <div key={card.label} className="bg-white rounded-xl border border-[#e8edf2] px-4 py-3.5 flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">{card.label}</p>
                    <p className="text-[28px] font-semibold text-[#111827] leading-none mt-1.5">{card.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${card.iconBg} ${card.iconColor} flex items-center justify-center`}>
                    {card.icon === 'shield' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    )}
                    {card.icon === 'globe' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    {card.icon === 'pin' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                    {card.icon === 'check' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex-1">
                <svg className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, phone, or employee ID"
                  className="w-full h-10 pl-9 pr-9 bg-white border border-[#e5e7eb] rounded-lg text-[13px]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#4b5563]" aria-label="Clear search">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
              <select value={filterZone} onChange={(e) => setFilterZone(e.target.value)} className="h-10 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] text-[#374151] min-w-[190px]">
                <option>All Zone Tagging Scopes</option>
                <option>All Zones (Entire Complex)</option>
                <option>Zone-Specific</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] text-[#374151] min-w-[130px]">
                <option>Active Only</option>
                <option>Inactive Only</option>
                <option>All Status</option>
              </select>
            </div>

            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#eef1f4]">
                    {['OFFICIAL NAME & LOGIN', 'DESIGNATION', 'CONTACT', 'TAGGED OPERATIONAL ZONES', 'STATUS', 'ACTIONS'].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af]">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleOfficials.map((official) => (
                    <tr key={official.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafbfc]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#12786f] text-white text-[12px] font-semibold flex items-center justify-center shrink-0">{official.initials}</div>
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-semibold text-[#111827] leading-tight">{official.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[12px] text-[#0f766e]">{official.username}</span>
                              <span className="text-[11px] text-[#6b7280] bg-[#f3f4f6] rounded px-1.5 py-[1px]">{official.employeeId}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#374151]">{official.designation}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-[12.5px] text-[#374151]">
                          <svg className="w-3.5 h-3.5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          {official.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] text-[#6b7280] mt-0.5">
                          <svg className="w-3.5 h-3.5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          {official.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#eef4ff] text-[#2563eb] text-[12px] font-medium">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {official.zones}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium ${official.status === 'Active' ? 'text-[#16a34a]' : 'text-[#6b7280]'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${official.status === 'Active' ? 'bg-[#22c55e]' : 'bg-[#9ca3af]'}`} />
                          {official.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-md hover:bg-[#fafbfc]">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit
                          </button>
                          <button className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-md hover:bg-[#fafbfc]">Edit Zones</button>
                          <button onClick={() => window.location.href = `/official-dashboard?id=${official.id}`} className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-[#0f766e] bg-[#e6f7f4] border border-[#b7e4d4] rounded-md hover:bg-[#d7f0ea]">Dashboard</button>
                          <button className="px-2 py-1 text-[12px] font-medium text-[#ef4444] hover:bg-red-50 rounded-md">Disable</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visibleOfficials.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#6b7280]">No officials match this search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="px-4 py-2.5 border-t border-[#eef1f4] flex items-center justify-between">
                <p className="text-[12.5px] text-[#6b7280]">
                  Showing {visibleOfficials.length === 0 ? 0 : 1} to {visibleOfficials.length} of {filteredOfficials.length} officials
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-[12.5px] text-[#6b7280]">Rows per page</span>
                  <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} className="h-8 px-2 bg-white border border-[#e5e7eb] rounded-md text-[12.5px]">
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 rounded-md text-[#9ca3af] hover:bg-[#f3f5f8] flex items-center justify-center" aria-label="Previous page">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button className="w-7 h-7 rounded-md bg-[#16a34a] text-white text-[12px] font-semibold">1</button>
                    <button className="w-7 h-7 rounded-md text-[#9ca3af] hover:bg-[#f3f5f8] flex items-center justify-center" aria-label="Next page">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'housekeeping-ranking':
        return (
          <div>
            <h1 className="text-[20px] font-semibold text-[#1f2937] mb-1">Housekeeping Worker Ranking</h1>
            <p className="text-[13px] text-[#6b7280] mb-4">Ranked field performance across Bharat Mandapam housekeeping teams.</p>
            <div className="bg-white rounded-xl border border-[#e8edf2] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#eef1f4]">
                    {['RANK', 'WORKER', 'AGENCY', 'TASKS CLOSED', 'SCORE'].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af]">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['1', 'Ramesh Yadav', 'Soni Facility Management', '186', '98'],
                    ['2', 'Kavita Devi', 'BLUSPRING ENTERPRISES LTD.', '164', '95'],
                    ['3', 'Imran Khan', 'Soni Facility Management', '151', '93'],
                  ].map((row) => (
                    <tr key={row[0]} className="border-b border-[#f3f4f6] last:border-0">
                      {row.map((cell) => <td key={cell} className="px-4 py-3 text-[13px] text-[#374151]">{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'itpo-performance':
        return (
          <div>
            <h1 className="text-[20px] font-semibold text-[#1f2937] mb-1">ITPO Official Performance</h1>
            <p className="text-[13px] text-[#6b7280] mb-4">Resolution rate and response time for authorized ITPO officials.</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                ['AVG. RESPONSE TIME', '8.5 min'],
                ['RESOLUTION RATE', '94.2%'],
                ['COMPLAINTS ASSIGNED', '1,247'],
              ].map(([label, value]) => (
                <div key={label} className="bg-white rounded-xl border border-[#e8edf2] px-4 py-3.5">
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">{label}</p>
                  <p className="text-[28px] font-semibold text-[#111827] leading-none mt-1.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-[#e8edf2] overflow-hidden">
              {officials.map((official, index) => (
                <div key={official.id} className="flex items-center justify-between px-4 py-3 border-b border-[#f3f4f6] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-7 text-[13px] font-semibold text-[#6b7280]">{index + 1}</span>
                    <div className="w-9 h-9 rounded-full bg-[#12786f] text-white text-[12px] font-semibold flex items-center justify-center">{official.initials}</div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-[#111827]">{official.name}</p>
                      <p className="text-[12px] text-[#6b7280]">{official.designation}</p>
                    </div>
                  </div>
                  <p className="text-[13px] font-medium text-[#16a34a]">{index === 0 ? '98%' : index === 1 ? '95%' : '92%'} resolution</p>
                </div>
              ))}
            </div>
          </div>
        )
      case 'all-complaints':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-[20px] font-semibold text-[#1f2937] mb-2">All Complaints</h1>
              <p className="text-[13px] text-[#6b7280]">View all complaints across the system</p>
            </div>
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-[#eef1f4]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-[#fafbfc]">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{complaint.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.title}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          complaint.status === 'COMPLETED' ? 'bg-[#e8f8ef] text-[#16a34a]' :
                          complaint.status === 'PENDING' ? 'bg-[#fff7ed] text-[#ea580c]' :
                          'bg-[#eef2ff] text-[#4f46e5]'
                        }`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          complaint.priority === 'URGENT' ? 'bg-[#fef2f2] text-[#dc2626]' :
                          complaint.priority === 'HIGH' ? 'bg-[#fff7ed] text-[#ea580c]' :
                          'bg-[#f3f4f6] text-[#6b7280]'
                        }`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.assignedTo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'resolved':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-[20px] font-semibold text-[#1f2937] mb-2">Resolved Complaints</h1>
              <p className="text-[13px] text-[#6b7280]">View all resolved complaints</p>
            </div>
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-[#eef1f4]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Resolved Date</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Agency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {complaints.filter(c => c.status === 'RESOLVED' || c.status === 'COMPLETED').map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-[#fafbfc]">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{complaint.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.agency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'pending':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-[20px] font-semibold text-[#1f2937] mb-2">Pending Complaints</h1>
              <p className="text-[13px] text-[#6b7280]">View all pending complaints</p>
            </div>
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-[#eef1f4]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {complaints.filter(c => c.status === 'PENDING').map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-[#fafbfc]">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{complaint.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.dueDate}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          complaint.priority === 'URGENT' ? 'bg-[#fef2f2] text-[#dc2626]' :
                          complaint.priority === 'HIGH' ? 'bg-[#fff7ed] text-[#ea580c]' :
                          'bg-[#f3f4f6] text-[#6b7280]'
                        }`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.assignedTo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'zones':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-[20px] font-semibold text-[#1f2937] mb-2">{t.zonesManagement}</h1>
              <p className="text-[13px] text-[#6b7280]">{t.zonesDescription}</p>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => window.location.href = '/dashboard/zones/form'} className="flex items-center gap-2 px-4 py-2 bg-[#0e4c5e] text-white rounded-lg text-[13px] font-semibold hover:bg-[#0b3c4a]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t.addZone}
              </button>
            </div>
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-[#eef1f4]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Zone Name</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Area</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Manager</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {zones.map((zone) => (
                    <tr key={zone.id} className="hover:bg-[#fafbfc]">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{zone.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{zone.area}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{zone.manager}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          zone.status === 'Active' ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#6b7280]'
                        }`}>
                          {zone.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="text-[#0f766e] hover:text-[#0b3c4a] text-[12px] font-semibold">Edit</button>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'areas':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-[20px] font-semibold text-[#1f2937] mb-2">{t.areasManagement}</h1>
              <p className="text-[13px] text-[#6b7280]">{t.areasDescription}</p>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => window.location.href = '/dashboard/areas/form'} className="flex items-center gap-2 px-4 py-2 bg-[#0e4c5e] text-white rounded-lg text-[13px] font-semibold hover:bg-[#0b3c4a]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t.addArea}
              </button>
            </div>
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-[#eef1f4]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Area Name</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Zone</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {areas.map((area) => (
                    <tr key={area.id} className="hover:bg-[#fafbfc]">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{area.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{area.zone}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{area.type}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e8f8ef] text-[#16a34a]">
                          {area.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="text-[#0f766e] hover:text-[#0b3c4a] text-[12px] font-semibold">Edit</button>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'categories':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-[20px] font-semibold text-[#1f2937] mb-2">{t.categoriesManagement}</h1>
              <p className="text-[13px] text-[#6b7280]">{t.categoriesDescription}</p>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => window.location.href = '/dashboard/categories/form'} className="flex items-center gap-2 px-4 py-2 bg-[#0e4c5e] text-white rounded-lg text-[13px] font-semibold hover:bg-[#0b3c4a]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t.addCategory}
              </button>
            </div>
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-[#eef1f4]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Category Name</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Complaints</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-[#fafbfc]">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{category.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{category.complaints}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e8f8ef] text-[#16a34a]">
                          {category.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="text-[#0f766e] hover:text-[#0b3c4a] text-[12px] font-semibold">Edit</button>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'master-data-hub':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-[20px] font-semibold text-[#1f2937] mb-2">Master Data Hub</h1>
              <p className="text-[13px] text-[#6b7280]">Centralized management of all master data for Bharat Mandapam operations.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('zones-areas')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#e6f7f4] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#0f766e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Zones and Areas</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Manage operational zones and specific areas within Bharat Mandapam.</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#0f766e]">12</span>
                  <span className="text-sm text-[#6b7280]">Zones</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('agencies')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Agencies</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Manage housekeeping and facility management agencies.</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">8</span>
                  <span className="text-sm text-[#6b7280]">Agencies</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('itpo-officials')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">ITPO Officials</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Manage ITPO officials and their operational jurisdictions.</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-600">124</span>
                  <span className="text-sm text-[#6b7280]">Officials</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('field-staff')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Field Staff</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Manage field staff and their assignments.</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-600">256</span>
                  <span className="text-sm text-[#6b7280]">Staff</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('escalation-settings')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Escalation Settings</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Configure complaint escalation rules and timelines.</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-600">5</span>
                  <span className="text-sm text-[#6b7280]">Rules</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'zones-areas':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-[20px] font-semibold text-[#1f2937] mb-2">Zones and Areas</h1>
              <p className="text-[13px] text-[#6b7280]">Manage operational zones and specific areas within Bharat Mandapam.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#eef1f4] flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#111827]">Zones</h3>
                    <p className="text-[12px] text-[#9ca3af] mt-0.5">{filteredZones.length} of {zones.length} zones</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <svg className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      <input type="text" value={zoneSearch} onChange={(e) => setZoneSearch(e.target.value)} placeholder="Search zones..." className="w-56 h-9 pl-9 pr-3 rounded-lg bg-white border border-[#e5e7eb] text-[13px]" />
                    </div>
                    <button onClick={() => { setEditingZone(null); setZoneFormOpen(true) }} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Add Zone
                    </button>
                  </div>
                </div>
                <div className="max-h-[480px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-[#eef1f4]">
                        {['ZONE NAME', 'AREA', 'MANAGER', 'STATUS', 'ACTIONS'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredZones.map((zone) => (
                        <tr key={zone.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafbfc]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#e6f7f4] text-[#0f766e] flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              </div>
                              <p className="text-[13.5px] font-semibold text-[#111827]">{zone.name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#374151]">{zone.area}</td>
                          <td className="px-4 py-3 text-[13px] text-[#374151]">{zone.manager}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${zone.status === 'Active' ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>{zone.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setEditingZone(zone); setZoneFormOpen(true) }} className="px-2.5 py-1 text-[12px] font-medium text-[#0f766e] bg-[#e6f7f4] rounded-md hover:bg-[#d7f0ea]">Edit</button>
                              <button onClick={() => handleDeleteZone(zone.id)} className="px-2.5 py-1 text-[12px] font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2]">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredZones.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-10 text-center text-[13px] text-[#9ca3af]">No zones match your search</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Areas</h3>
                  <button onClick={() => window.location.href = '/dashboard/areas/form'} className="text-[#0f766e] hover:text-[#0b3c4a] text-[12px] font-semibold">+ Add Area</button>
                </div>
                <div className="space-y-3">
                  {areas.map((area) => (
                    <div key={area.id} className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{area.name}</p>
                        <p className="text-sm text-[#6b7280]">{area.zone} • {area.type}</p>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-[#e8f8ef] text-[#16a34a]">
                        {area.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'agencies':
        return (
          <div>
            <div className="mb-4">
              <h1 className="text-[20px] font-semibold text-[#1f2937] leading-tight">Agencies</h1>
              <p className="text-[13px] text-[#6b7280] mt-1">Manage housekeeping and facility management agencies across Bharat Mandapam.</p>
            </div>
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#eef1f4] flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827]">Agency Directory</h3>
                  <p className="text-[12px] text-[#9ca3af] mt-0.5">{filteredAgencies.length} of {agencies.length} agencies</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <svg className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" value={agencySearch} onChange={(e) => setAgencySearch(e.target.value)} placeholder="Search agencies..." className="w-56 h-9 pl-9 pr-3 rounded-lg bg-white border border-[#e5e7eb] text-[13px]" />
                  </div>
                  <button onClick={() => { setEditingAgency(null); setAgencyFormOpen(true) }} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Agency
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#eef1f4]">
                      {['AGENCY', 'CONTACT PERSON', 'PHONE', 'EMAIL', 'SERVICES', 'STATUS', 'ACTIONS'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgencies.map((agency) => {
                      const initials = agency.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                      return (
                        <tr key={agency.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafbfc]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#0e4c5e] text-white text-[11px] font-bold flex items-center justify-center shrink-0">{initials}</div>
                              <div className="min-w-0">
                                <p className="text-[13.5px] font-semibold text-[#111827] leading-tight">{agency.name}</p>
                                <p className="text-[11px] text-[#9ca3af] mt-0.5">ID: AG-{String(agency.id).padStart(3, '0')}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#374151]">{agency.contactPerson}</td>
                          <td className="px-4 py-3 text-[13px] text-[#374151]">{agency.phone}</td>
                          <td className="px-4 py-3 text-[13px] text-[#374151]">{agency.email}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {agency.services.slice(0, 2).map((svc) => (
                                <span key={svc} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#eef2ff] text-[#4f46e5]">{svc}</span>
                              ))}
                              {agency.services.length > 2 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#f3f4f6] text-[#6b7280]">+{agency.services.length - 2}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${agency.status === 'Active' ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>{agency.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => setSelectedAgencyId(agency.id)} className="px-2.5 py-1 text-[12px] font-medium text-[#1d4ed8] bg-[#e8eefc] rounded-md hover:bg-[#dbe4fb]">Details</button>
                              <button onClick={() => { setEditingAgency(agency); setAgencyFormOpen(true) }} className="px-2.5 py-1 text-[12px] font-medium text-[#0f766e] bg-[#e6f7f4] rounded-md hover:bg-[#d7f0ea]">{t.edit}</button>
                              <button onClick={() => handleDeleteAgency(agency.id)} className="px-2.5 py-1 text-[12px] font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2]">{t.delete}</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredAgencies.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#9ca3af]">No agencies match your search</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      case 'field-staff':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-[20px] font-semibold text-[#1f2937] mb-2">Field Staff</h1>
              <p className="text-[13px] text-[#6b7280]">Manage field staff and their assignments across zones.</p>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#0e4c5e] text-white rounded-lg text-[13px] font-semibold hover:bg-[#0b3c4a]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Staff
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6">
                <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280] mb-1">TOTAL STAFF</p>
                <p className="text-[28px] font-semibold text-[#111827]">256</p>
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6">
                <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280] mb-1">ACTIVE ON DUTY</p>
                <p className="text-3xl font-bold text-green-600">198</p>
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6">
                <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280] mb-1">ON LEAVE</p>
                <p className="text-3xl font-bold text-orange-600">58</p>
              </div>
            </div>
                        {/* Daily Attendance */}
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 mb-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e6f7f4] text-[#0f766e] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-semibold text-[#111827]">Daily Attendance</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${attendanceRecords.length ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#fff7ed] text-[#ea580c]'}`}>
                        {attendanceRecords.length ? 'Marked Today' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-[#6b7280] mt-0.5">Capture front-camera photo with automatic date &amp; time (GPS optional).</p>
                  </div>
                </div>
                <button onClick={() => setAttendanceOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] shadow-sm shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Mark Daily Attendance
                </button>
              </div>
              {attendanceRecords.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#eef1f4] space-y-2">
                  {attendanceRecords.slice(0, 6).map((r) => {
                    const ini = r.staffName.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                    return (
                      <div key={r.staffId} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e8edf2]">
                        <div className="w-8 h-8 rounded-full bg-[#0e4c5e] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{ini}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[13px] font-semibold text-[#111827]">{r.staffName}</p>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#e8f8ef] text-[#16a34a]">Marked Today</span>
                          </div>
                          <p className="text-[11.5px] text-[#6b7280] mt-0.5">{r.timestamp}{r.gps ? ` · ${r.gps}` : ''}</p>
                        </div>
                        {r.photo && <img src={r.photo} alt="Attendance" className="w-9 h-9 rounded-lg object-cover border border-[#e8edf2] shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
<div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-[#eef1f4]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">STAFF NAME</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">AGENCY</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">ASSIGNED ZONE</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">SHIFT</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">STATUS</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  <tr className="hover:bg-[#fafbfc]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#e6f7f4] rounded-full flex items-center justify-center">
                          <span className="text-[#0f766e] font-semibold text-sm">RS</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Ramesh Singh</p>
                          <p className="text-xs text-[#6b7280]">ID: ST-001</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">Soni Facility Management</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Hall 1-5</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Morning (6AM - 2PM)</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e8f8ef] text-[#16a34a]">
                        On Duty
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-[#0f766e] hover:text-[#0b3c4a] text-[12px] font-semibold">{t.edit}</button>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">{t.delete}</button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#fafbfc]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold text-sm">SG</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Suresh Gupta</p>
                          <p className="text-xs text-[#6b7280]">ID: ST-002</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">BLUSPRING ENTERPRISES LTD.</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Hall 6-10</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Evening (2PM - 10PM)</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fff7ed] text-[#ea580c]">
                        On Leave
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-[#0f766e] hover:text-[#0b3c4a] text-[12px] font-semibold">{t.edit}</button>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">{t.delete}</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'escalation-settings':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-[20px] font-semibold text-[#1f2937] mb-2">Escalation Settings</h1>
              <p className="text-[13px] text-[#6b7280]">Configure complaint escalation rules and timelines for efficient resolution.</p>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#0e4c5e] text-white rounded-lg text-[13px] font-semibold hover:bg-[#0b3c4a]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Rule
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Level 1 Escalation</h3>
                    <p className="text-sm text-[#6b7280]">Auto-escalate after 30 minutes</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#e8f8ef] text-[#16a34a]">Active</span>
                    <button className="text-[#0f766e] hover:text-[#0b3c4a] text-[12px] font-semibold">{t.edit}</button>
                  </div>
                </div>
                <div className="bg-[#f8fafc] rounded-lg p-4">
                  <p className="text-sm text-gray-600"><strong>Escalate to:</strong> Zone Supervisor</p>
                  <p className="text-sm text-gray-600"><strong>Priority:</strong> Medium</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Level 2 Escalation</h3>
                    <p className="text-sm text-[#6b7280]">Auto-escalate after 1 hour</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#e8f8ef] text-[#16a34a]">Active</span>
                    <button className="text-[#0f766e] hover:text-[#0b3c4a] text-[12px] font-semibold">{t.edit}</button>
                  </div>
                </div>
                <div className="bg-[#f8fafc] rounded-lg p-4">
                  <p className="text-sm text-gray-600"><strong>Escalate to:</strong> ITPO Manager</p>
                  <p className="text-sm text-gray-600"><strong>Priority:</strong> High</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Level 3 Escalation</h3>
                    <p className="text-sm text-[#6b7280]">Auto-escalate after 2 hours</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#e8f8ef] text-[#16a34a]">Active</span>
                    <button className="text-[#0f766e] hover:text-[#0b3c4a] text-[12px] font-semibold">{t.edit}</button>
                  </div>
                </div>
                <div className="bg-[#f8fafc] rounded-lg p-4">
                  <p className="text-sm text-gray-600"><strong>Escalate to:</strong> ITPO Director</p>
                  <p className="text-sm text-gray-600"><strong>Priority:</strong> Urgent</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'qr-manager': {
        const qrItems = [
          ...defaultZones.map((z) => ({ id: `zone:${z.name}`, title: z.name, type: 'complaint' as const, zone: z.name, fgColor: '#0b3c4a', bgColor: '#ffffff', size: 220, status: 'Active' as const, createdAt: 'Auto', system: true })),
          ...qrRecords.map((r) => ({ ...r, system: false })),
        ]
        const q = qrSearch.trim().toLowerCase()
        const filtered = qrItems.filter((item) => {
          const matchQ = !q || [item.title, item.zone || '', item.url || '', item.type].some((v) => String(v).toLowerCase().includes(q))
          const matchS = qrStatusFilter === 'All Status' || item.status === qrStatusFilter
          return matchQ && matchS
        })
        return (
          <div>
            <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-[20px] font-semibold text-[#1f2937]">QR Manager</h1>
                <p className="text-[13px] text-[#6b7280] mt-1">Generate, customize and print QR codes for zones, gates and links. Citizens scan to open the complaint form — no login needed.</p>
              </div>
              <button onClick={() => { setEditingQr(null); setQrFormOpen(true) }} className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Generate QR Code
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {([
                { l: 'TOTAL QRS', v: qrItems.length, c: 'text-[#111827]' },
                { l: 'ZONE-LINKED', v: qrItems.filter((i) => i.type === 'complaint').length, c: 'text-[#0f766e]' },
                { l: 'CUSTOM URLS', v: qrRecords.length, c: 'text-[#4f46e5]' },
                { l: 'ACTIVE', v: qrItems.filter((i) => i.status === 'Active').length, c: 'text-[#16a34a]' },
              ]).map((c) => (
                <div key={c.l} className="bg-white rounded-xl border border-[#e8edf2] px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">{c.l}</p>
                  <p className={`text-[26px] font-semibold leading-none mt-1.5 ${c.c}`}>{c.v}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <svg className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" value={qrSearch} onChange={(e) => setQrSearch(e.target.value)} placeholder="Search QR codes by title, zone or URL..." className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-[#e5e7eb] text-[13px]" />
              </div>
              <select value={qrStatusFilter} onChange={(e) => setQrStatusFilter(e.target.value)} className="h-9 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] text-[#374151]">
                {['All Status', 'Active', 'Inactive'].map((o) => <option key={o}>{o}</option>)}
              </select>
              <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f8fafc]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print Sheet
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-3.5 flex flex-col items-center text-center print:break-inside-avoid">
                  {qrThumbs[item.id] ? <img src={qrThumbs[item.id]} alt={item.title} className="w-[110px] h-[110px]" /> : <div className="w-[110px] h-[110px] rounded bg-[#f3f4f6] animate-pulse" />}
                  <p className="text-[12px] font-semibold text-[#111827] mt-2.5 leading-tight">{item.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wide ${item.type === 'complaint' ? 'bg-[#e6f7f4] text-[#0f766e]' : 'bg-[#eef2ff] text-[#4f46e5]'}`}>{item.type === 'complaint' ? 'Complaint' : 'Custom'}</span>
                    {item.system && <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wide bg-[#f3f4f6] text-[#6b7280]">Auto</span>}
                    <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wide ${item.status === 'Active' ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#9ca3af]'}`}>{item.status}</span>
                  </div>
                  <p className="text-[9.5px] text-[#9ca3af] font-mono mt-1.5 break-all px-1 leading-tight">{buildQrPayload(item, qrOrigin || 'http://localhost:3000')}</p>
                  <div className="flex items-center gap-1 mt-2.5 w-full">
                    <button onClick={() => downloadQr(item.id, item.title)} title="Download PNG" className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-semibold text-[#0f766e] bg-[#e6f7f4] rounded-md hover:bg-[#d7f0ea]">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      PNG
                    </button>
                    {!item.system && (
                      <>
                        <button onClick={() => { setEditingQr(item); setQrFormOpen(true) }} title="Edit" className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[#0f766e] hover:bg-[#e6f7f4]">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleToggleQr(item.id)} title={item.status === 'Active' ? 'Deactivate' : 'Activate'} className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[#d97706] hover:bg-[#fff7ed]">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={() => handleDeleteQr(item.id)} title="Delete" className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-[#fecaca] bg-white text-[#dc2626] hover:bg-[#fef2f2]">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p className="col-span-full text-center text-[13px] text-[#9ca3af] py-10">No QR codes match your filters.</p>}
            </div>
            <p className="text-[11px] text-[#9ca3af] mt-4">Zone QR codes are auto-generated from the Zones master list. Custom QR codes are saved in this browser until a database is connected.</p>
          </div>
        )
      }
      default:
        return <div>Page not found</div>
    }
  }

  useEffect(() => {
    setQrRecords(loadQrRecords())
    setQrOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (!qrOrigin) return
    const items = [
      ...defaultZones.map((z) => ({ id: `zone:${z.name}`, title: z.name, type: 'complaint' as const, zone: z.name, fgColor: '#0b3c4a', bgColor: '#ffffff', size: 220, status: 'Active' as const, createdAt: 'Auto' })),
      ...qrRecords,
    ]
    let cancelled = false
    items.forEach(async (item) => {
      try {
        const url = buildQrPayload(item, qrOrigin)
        const dataUrl = await QRCode.toDataURL(url, { width: 140, margin: 1, color: { dark: item.fgColor, light: item.bgColor } })
        if (!cancelled) setQrThumbs((prev) => ({ ...prev, [item.id]: dataUrl }))
      } catch {}
    })
    return () => { cancelled = true }
  }, [qrOrigin, qrRecords])

  const persistQr = (records: QrRecord[]) => { setQrRecords(records); saveQrRecords(records) }

  const handleSaveQr = (record: QrRecord) => {
    persistQr(editingQr ? qrRecords.map((r) => (r.id === record.id ? record : r)) : [...qrRecords, record])
    setEditingQr(null)
  }

  const handleDeleteQr = (id: string) => {
    if (window.confirm('Delete this QR code?')) persistQr(qrRecords.filter((r) => r.id !== id))
  }

  const handleToggleQr = (id: string) => {
    persistQr(qrRecords.map((r) => (r.id === id ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r)))
  }

  const downloadQr = (id: string, title: string) => {
    const src = qrThumbs[id]
    if (!src) return
    const a = document.createElement('a')
    a.href = src
    a.download = `qr-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`
    a.click()
  }
  const breadcrumbs: Record<ViewType, string> = {
    overview: 'Overview',
    'complaint-register': 'Complaint Register',
    'housekeeping-ranking': 'Housekeeping Worker Ranking',
    'itpo-performance': 'ITPO Official Performance',
    'master-data-hub': 'Master Data Hub',
    'zones-areas': 'Zones & Areas',
    agencies: 'Agencies',
    'itpo-officials': 'ITPO Officials',
    'field-staff': 'Field Staff',
    'qr-manager': 'QR Manager',
    'escalation-settings': 'Escalation Settings',
    'all-complaints': 'All Complaints',
    resolved: 'Resolved',
    pending: 'Pending',
  }

  const complaintItems: { id: ViewType; label: string; icon: string; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'complaint-register', label: 'Complaint Register', icon: 'clipboard', badge: '1' },
    { id: 'housekeeping-ranking', label: 'Housekeeping Worker Ranking', icon: 'users' },
    { id: 'itpo-performance', label: 'ITPO Official Performance', icon: 'chart' },
    { id: 'all-complaints', label: 'All Complaints', icon: 'clipboard' },
    { id: 'resolved', label: 'Resolved', icon: 'check' },
    { id: 'pending', label: 'Pending', icon: 'clock' },
  ]

  const masterItems: { id: ViewType; label: string; icon: string }[] = [
    { id: 'master-data-hub', label: 'Master Data Hub', icon: 'database' },
    { id: 'zones-areas', label: 'Zones & Areas', icon: 'pin' },
    { id: 'agencies', label: 'Agencies', icon: 'building' },
    { id: 'itpo-officials', label: 'ITPO Officials', icon: 'badge' },
    { id: 'field-staff', label: 'Field Staff', icon: 'users' },
    { id: 'qr-manager', label: 'QR Manager', icon: 'qr' },
    { id: 'escalation-settings', label: 'Escalation Settings', icon: 'gear' },
  ]

  const NavIcon = ({ name }: { name: string }) => {
    const common = 'w-[18px] h-[18px] shrink-0'
    if (name === 'grid') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 6h6v6H4V6zm10 0h6v6h-6V6zM4 16h6v4H4v-4zm10 0h6v4h-6v-4z" /></svg>
    if (name === 'clipboard') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    if (name === 'users') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    if (name === 'chart') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    if (name === 'database') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 7c0 1.657 3.582 3 8 3s8-1.343 8-3-3.582-3-8-3-8 1.343-8 3zm0 5c0 1.657 3.582 3 8 3s8-1.343 8-3M4 7v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7" /></svg>
    if (name === 'pin') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    if (name === 'building') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    if (name === 'badge') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 11-4 0 2 2 0 014 0zm6 0h4" /></svg>
    if (name === 'check') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    if (name === 'clock') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    if (name === 'qr') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M14 14h3v3h-3zM21 14v3M14 21h3M18 18h3v3" /></svg>
    return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  }

  const navButton = (item: { id: ViewType; label: string; icon: string; badge?: string }) => {
    const active = currentView === item.id
    return (
      <button
        key={item.id}
        onClick={() => setCurrentView(item.id)}
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
  }

  return (
    <div className="admin-shell min-h-screen flex bg-[#f3f5f8]">
      <DocumentTitle title="BM360 Admin Dashboard" />
      <aside className="w-[248px] shrink-0 bg-[#0b3c4a] text-white flex flex-col">
        <div className="px-3.5 pt-3.5 pb-2">
          <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
            <div className="text-[22px] font-extrabold leading-none tracking-tight text-[#0b3c4a]">
              BM<span className="text-[#1d4ed8]">360</span>
            </div>
            <div className="text-[8px] font-bold tracking-[0.16em] text-[#64748b] mt-0.5">BHARAT MANDAPAM</div>
          </div>
        </div>

        <div className="px-3">
          <button
            onClick={() => setOpsOpen((open) => !open)}
            className="w-full flex items-center gap-2.5 rounded-xl bg-[#0e4c5e] px-2.5 py-2 text-left"
          >
            <span className="w-8 h-8 rounded-lg bg-[#14586a] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 6h6v6H4V6zm10 0h6v6h-6V6zM4 16h6v4H4v-4zm10 0h6v4h-6v-4z" /></svg>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-semibold leading-tight">ITPO Operations</span>
              <span className="block text-[10px] text-[#9ec3d0] leading-tight mt-0.5">BM360 · Operations</span>
            </span>
            <svg className={`w-4 h-4 text-[#9ec3d0] transition-transform ${opsOpen ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
          {opsOpen && (
            <>
              <p className="px-2 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#7f9eab]">COMPLAINTS</p>
              <nav className="space-y-0.5">{complaintItems.map(navButton)}</nav>
            </>
          )}
          <p className="px-2 pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#7f9eab]">MASTER DATA ENTRY</p>
          <nav className="space-y-0.5">{masterItems.map(navButton)}</nav>
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
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-tight truncate">ITPO Administrator</p>
            <p className="text-[11px] text-[#9ec3d0] leading-tight">ITPO Official</p>
          </div>
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-[#e8edf2] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[13px] text-[#6b7280]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span>BM360</span>
            <svg className="w-3.5 h-3.5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" /></svg>
            <span className="text-[#111827] font-semibold">{breadcrumbs[currentView]}</span>
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

              <div className="w-8 h-8 rounded-full bg-[#e8eefc] text-[#1d4ed8] text-[11px] font-bold flex items-center justify-center">IA</div>
              <div className="leading-tight">
                <p className="text-[12.5px] font-semibold text-[#111827]">ITPO Administrator</p>
                <p className="text-[11px] text-[#6b7280]">ITPO Official</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-4">
          {renderContent()}
        </main>
      </div>
      <ItpoOfficialFormModal open={showItpoForm} onClose={() => setShowItpoForm(false)} />
      <ZoneFormModal
        open={zoneFormOpen}
        onClose={() => setZoneFormOpen(false)}
        zone={editingZone}
        onSave={handleSaveZone}
      />
      <QrCodeModal
        open={qrFormOpen}
        onClose={() => { setQrFormOpen(false); setEditingQr(null) }}
        editing={editingQr}
        onSave={handleSaveQr}
      />
      <AgencyFormModal
        open={agencyFormOpen}
        onClose={() => setAgencyFormOpen(false)}
        agency={editingAgency}
        onSave={handleSaveAgency}
      />
      <ImportEmployeesModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImportEmployees}
      />
      <AttendanceModal
        open={attendanceOpen}
        onClose={() => setAttendanceOpen(false)}
        staff={staffOptions}
        markedIds={attendanceRecords.map((r) => r.staffId)}
        onMark={handleMarkAttendance}
      />
      <ZoneSelectModal
        open={zoneModalOpen}
        onClose={() => setZoneModalOpen(false)}
        currentZone={operationalZone}
        onConfirm={(zone) => { setOperationalZone(zone === 'All Campus Zones (Entire Complex)' ? 'All Zones (Entire Complex)' : zone); setZoneModalOpen(false) }}
      />
    </div>
  )
}
