'use client'


import { translations, Language } from '@/lib/translations'
import ItpoOfficialFormModal from '@/components/ItpoOfficialFormModal'
import ComplaintDetailsModal from '@/components/ComplaintDetailsModal'
import ComplaintEditModal from '@/components/ComplaintEditModal'
import RegisterComplaintModal from '@/components/RegisterComplaintModal'
import ZoneSelectModal from '@/components/ZoneSelectModal'
import ZoneFormModal from '@/components/ZoneFormModal'
import { defaultZones, ZoneRecord } from '@/lib/zones'
import AgencyFormModal from '@/components/AgencyFormModal'
import AttendanceModal, { AttendanceRecord, StaffOption } from '@/components/AttendanceModal'
import AttendanceEditModal, { AttendanceRow } from '@/components/AttendanceEditModal'
import { defaultAgencies, AgencyRecord, defaultEmployees, EmployeeRecord } from '@/lib/agencies'
import ImportEmployeesModal, { ImportedEmployee } from '@/components/ImportEmployeesModal'
import DocumentTitle from '@/components/DocumentTitle'
import QrCodeModal from '@/components/QrCodeModal'
import QRCode from 'qrcode'
import { QrRecord, buildQrPayload, loadQrRecords, saveQrRecords } from '@/lib/qrcodes'
import { logActivity, ActivityRecord } from '@/lib/activity'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/Toast'

type ViewType = 'overview' | 'complaint-register' | 'housekeeping-ranking' | 'itpo-performance' | 'master-data-hub' | 'zones-areas' | 'agencies' | 'itpo-officials' | 'field-staff' | 'escalation-settings' | 'all-complaints' | 'resolved' | 'pending' | 'qr-manager' | 'activity-logs' | 'zones' | 'areas' | 'categories' | 'reports' | 'attendance'

export default function DashboardPage() {
  const { toast } = useToast()
  const [currentView, setCurrentView] = useState<ViewType>('itpo-officials')
  const [language, setLanguage] = useState<Language>('en')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterZone, setFilterZone] = useState('All Zone Tagging Scopes')
  const [statusFilter, setStatusFilter] = useState('Active Only')
  const [opsOpen, setOpsOpen] = useState(true)
  const [headerSearch, setHeaderSearch] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [zoneModalOpen, setZoneModalOpen] = useState(false)
  const [inspectComplaint, setInspectComplaint] = useState<any>(null)
  const [editComplaint, setEditComplaint] = useState<any>(null)
  const [complaintPage, setComplaintPage] = useState(1)
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  const [navOpen, setNavOpen] = useState(false)

  const deleteComplaint = (id: number) => {
    if (!window.confirm('Delete this complaint permanently?')) return
    fetch('/api/complaints', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).then((r) => r.json()).then((d) => {
      if (d.ok) { logActivity('System Admin', 'Admin', 'Complaint Deleted', `Complaint #${id} removed`); loadComplaints() }
    }).catch(() => {})
  }
const [zones, setZones] = useState<ZoneRecord[]>(defaultZones)
  useEffect(() => {
    try { const raw = localStorage.getItem('bm360_zones'); if (raw) setZones(JSON.parse(raw)) } catch {}
  }, [])
  useEffect(() => { try { localStorage.setItem('bm360_zones', JSON.stringify(zones)) } catch {} }, [zones])
  useEffect(() => {
    fetch('/api/zones').then((r) => r.json()).then((d) => {
      if (d.ok && d.zones && d.zones.length) setZones(d.zones.map((z) => ({ id: z.id, name: z.name, area: z.area || '—', manager: z.manager || 'Unassigned', status: z.status || 'Active', accessMobile: z.access_mobiles || undefined })))
    }).catch(() => {})
    fetch('/api/agencies').then((r) => r.json()).then((d) => {
      if (d.ok && d.agencies && d.agencies.length) setAgencies(d.agencies.map((a) => ({ id: a.id, name: a.name, contactPerson: a.contact_person || '', phone: a.phone || '', email: a.email || '', address: a.address || '', services: a.services || [], zones: a.zones || [], status: a.status || 'Active', employeeCount: a.employee_count || 0, joinedDate: a.joined_date || '' })))
    }).catch(() => {})
    fetch('/api/staff').then((r) => r.json()).then((d) => {
      if (d.ok && d.staff && d.staff.length) {
        setEmployees(d.staff.map((s: any) => ({
          id: s.id, agencyId: s.agency_id, agency: s.agency_name || '',
          name: s.name, role: s.role || 'Field Staff', phone: s.phone || '',
          zone: Array.isArray(s.zones) && s.zones.length ? s.zones[0] : '—',
          shift: s.shift || 'No Shift',
          status: s.status === 'Active' ? 'Active' : 'Inactive',
        })))
      }
    }).catch(() => {})
    fetch('/api/officials').then((r) => r.json()).then((d) => {
      if (d.ok && d.officials && d.officials.length) {
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
      if (d.ok && d.complaints && d.complaints.length) {
        setComplaints(d.complaints.map((c: any) => ({
          id: c.id,
          date: new Date(c.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
          title: c.title || (c.description || '').slice(0, 60) || 'Complaint',
          description: c.description || '',
          status: c.status === 'COMPLETED' || c.status === 'RESOLVED' ? 'COMPLETED' : c.status === 'PENDING' ? 'PENDING' : c.status,
          priority: c.priority || 'HIGH',
          location: c.sub_area ? `${c.zone} - ${c.sub_area}` : c.zone || '—',
          subArea: c.sub_area || '',
          campus: 'Bharat Mandapam',
          service: c.service || c.complaint_type || 'General',
          agency: c.agency_name || 'Unassigned',
          dueDate: c.due_date || '—',
          assignedTo: c.official_name || c.reporter_name || '—',
          reportedBy: c.reporter_name || 'Citizen',
          reporterRole: c.reported_by || 'ITPO Official',
          publicId: c.public_id,
          photo: c.photo_url || null,
          createdAt: c.created_at,
          resolvedAt: c.resolved_at,
        })))
      }
    }).catch(() => {})
  }
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
const [activityLogs, setActivityLogs] = useState<ActivityRecord[]>([])
const [logPage, setLogPage] = useState(1)
const [logPageSize, setLogPageSize] = useState(10)
const [attRecords, setAttRecords] = useState<AttendanceRow[]>([])
const [attSearch, setAttSearch] = useState('')
const [editingAtt, setEditingAtt] = useState<AttendanceRow | null>(null)
const [logSearch, setLogSearch] = useState('')
const [logActorFilter, setLogActorFilter] = useState('All Users')
const [agencies, setAgencies] = useState<AgencyRecord[]>(defaultAgencies)
const [agencyFormOpen, setAgencyFormOpen] = useState(false)
const [editingAgency, setEditingAgency] = useState<AgencyRecord | null>(null)
const [agencySearch, setAgencySearch] = useState('')
const [employees, setEmployees] = useState<EmployeeRecord[]>([])
const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null)
const [importOpen, setImportOpen] = useState(false)
const [employeeSearch, setEmployeeSearch] = useState('')
const [attendanceOpen, setAttendanceOpen] = useState(false)
const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [operationalZone, setOperationalZone] = useState('Unassigned (Set Zone)')
  useEffect(() => {
    const z = localStorage.getItem('bm360_assigned_zone')
    if (z) setOperationalZone(z === 'All Campus Zones (Entire Complex)' ? 'All Zones (Entire Complex)' : z)
  }, [])
  const [showItpoForm, setShowItpoForm] = useState(false)

  const t = translations[language]

  const [officials, setOfficials] = useState([
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
  ])
  const [editingOfficial, setEditingOfficial] = useState<any>(null)

  const [complaints, setComplaints] = useState<any[]>([])


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
      fetch('/api/zones', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).catch(() => {})
      setZones(zones.map((z) => (z.id === data.id ? { ...z, ...data } : z)))
      logActivity('System Admin', 'Admin', 'Zone Updated', data.name)
      toast('Zone updated', 'success')
    } else {
      fetch('/api/zones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()).then((d) => { if (d.ok) setZones((prev) => [...prev, { ...data, id: d.zone.id, accessMobile: d.zone.access_mobiles || data.accessMobile }]) }).catch(() => setZones([...zones, { ...data, id: Math.max(...zones.map((z) => z.id), 0) + 1 }]))
      logActivity('System Admin', 'Admin', 'Zone Created', data.name)
      toast('Zone created', 'success')
    }
  }

  const handleDeleteZone = (id: number) => {
    if (window.confirm('Are you sure you want to delete this zone?')) {
      fetch('/api/zones', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {})
      setZones(zones.filter((z) => z.id !== id))
      logActivity('System Admin', 'Admin', 'Zone Deleted', 'Zone ID ' + id)
      toast('Zone deleted', 'success')
    }
  }

  const filteredAgencies = agencies.filter((a) =>
    [a.name, a.contactPerson, a.phone, a.email].some((v) => v.toLowerCase().includes(agencySearch.trim().toLowerCase()))
  )

  const handleSaveAgency = (data: Omit<AgencyRecord, 'id'> & { id?: number; staff?: { name: string; role: string; designation: string; phone: string }[] }) => {
    const postStaff = (agencyId: number) => {
      ;(data.staff || []).forEach((s) => {
        fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agencyId, name: s.name, role: s.role, designation: s.designation, phone: s.phone, zones: data.zones || [], shift: 'No Shift', status: 'Active' }),
        }).catch(() => {})
      })
      if ((data.staff || []).length) logActivity('System Admin', 'Admin', 'Staff Created', `${data.staff!.length} staff added for ${data.name}`)
    }
    if (data.id) {
      fetch('/api/agencies', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).catch(() => {})
      setAgencies(agencies.map((a) => (a.id === data.id ? { ...a, ...data } : a)))
      postStaff(data.id)
      logActivity('System Admin', 'Admin', 'Agency Updated', data.name)
      toast('Agency updated', 'success')
    } else {
      fetch('/api/agencies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()).then((d) => {
        if (d.ok) {
          const newId = d.agency.id
          setAgencies((prev) => [...prev, { ...data, id: newId }])
          postStaff(newId)
        } else {
          setAgencies([...agencies, { ...data, id: Math.max(...agencies.map((a) => a.id), 0) + 1 }])
        }
      }).catch(() => setAgencies([...agencies, { ...data, id: Math.max(...agencies.map((a) => a.id), 0) + 1 }]))
      logActivity('System Admin', 'Admin', 'Agency Created', data.name)
      toast('Agency created', 'success')
    }
  }

  const handleDeleteAgency = (id: number) => {
    if (window.confirm('Are you sure you want to delete this agency?')) {
      fetch('/api/agencies', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {})
      setAgencies(agencies.filter((a) => a.id !== id))
      logActivity('System Admin', 'Admin', 'Agency Deleted', 'Agency ID ' + id)
      toast('Agency deleted', 'success')
    }
  }

  const mapOfficial = (o: any) => ({
    id: o.id, name: o.name,
    initials: o.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
    username: o.username || '', employeeId: o.employee_id || '', designation: o.designation || '',
    phone: o.phone || '', email: o.email || '',
    zones: Array.isArray(o.zones) && o.zones.length ? o.zones.join(', ') : 'All Zones (Entire Complex)',
    zonesList: Array.isArray(o.zones) ? o.zones : [],
    status: o.status || 'Active',
  })

  const handleSaveOfficial = (data: any) => {
    const isEdit = !!editingOfficial
    const zonesArr = (data.zonesList && data.zonesList.length ? data.zonesList : String(data.zones || '').split(',').map((z: string) => z.trim()).filter(Boolean))
    fetch('/api/officials', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingOfficial?.id, name: data.name, username: data.username, employeeId: data.employeeId, designation: data.designation, phone: data.phone, email: data.email, password: data.password || undefined, zones: zonesArr, status: data.status || 'Active' }),
    }).then((r) => r.json()).then((d) => {
      if (d.ok && d.official) {
        const mapped = mapOfficial(d.official)
        setOfficials((prev) => isEdit ? prev.map((x) => (x.id === mapped.id ? mapped : x)) : [...prev, mapped])
        toast(isEdit ? 'ITPO official updated' : 'ITPO official created', 'success')
        logActivity('System Admin', 'Admin', isEdit ? 'ITPO Official Updated' : 'ITPO Official Created', data.name)
      }
    }).catch(() => toast('Failed to save official', 'error'))
    setEditingOfficial(null)
  }

  const handleToggleOfficial = (official: any) => {
    const newStatus = official.status === 'Active' ? 'Inactive' : 'Active'
    fetch('/api/officials', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: official.id, name: official.name, username: official.username, employeeId: official.employeeId, designation: official.designation, phone: official.phone, email: official.email, zones: official.zonesList || [], status: newStatus }),
    }).then((r) => r.json()).then((d) => {
      if (d.ok) {
        setOfficials((prev) => prev.map((x) => (x.id === official.id ? { ...x, status: newStatus } : x)))
        toast(`Official ${newStatus === 'Active' ? 'activated' : 'disabled'}`, newStatus === 'Active' ? 'success' : 'warning')
        logActivity('System Admin', 'Admin', newStatus === 'Active' ? 'ITPO Official Activated' : 'ITPO Official Disabled', official.name)
      }
    }).catch(() => toast('Failed to update official', 'error'))
  }

  const handleDeleteOfficial = (official: any) => {
    if (!window.confirm(`Delete ${official.name}? This cannot be undone.`)) return
    fetch('/api/officials', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: official.id }) })
      .then((r) => r.json()).then((d) => {
        if (d.ok) {
          setOfficials((prev) => prev.filter((x) => x.id !== official.id))
          toast('ITPO official deleted', 'success')
          logActivity('System Admin', 'Admin', 'ITPO Official Deleted', official.name)
        }
      }).catch(() => toast('Failed to delete official', 'error'))
  }

  const staffOptions: StaffOption[] = employees.length
    ? employees.map((e, i) => ({ id: i + 1, name: e.name, zone: e.zone !== '—' ? e.zone : 'All Zones', phone: e.phone, agency: (e as any).agency || '' }))
    : [
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
    logActivity('System Admin', 'Admin', 'Attendance Marked', record.staffName + ' · ' + record.timestamp)
    toast('Attendance marked', 'success')
  }

  const handleImportEmployees = (items: ImportedEmployee[]) => {
    if (!selectedAgencyId) return
    const base = Math.max(...employees.map((e) => e.id), 0)
    setEmployees([...employees, ...items.map((it, i) => ({ ...it, id: base + i + 1, agencyId: selectedAgencyId, status: 'Active' as const }))])
    setAgencies(agencies.map((a) => (a.id === selectedAgencyId ? { ...a, employeeCount: a.employeeCount + items.length } : a)))
    logActivity('System Admin', 'Admin', 'Employees Imported', items.length + ' employee(s) added')
    toast('Employees imported', 'success')
    items.forEach((it) => {
      fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId: selectedAgencyId, name: it.name, role: 'Field Staff', designation: it.role || 'Field Staff', phone: it.phone || '', zones: it.zone ? [it.zone] : [], shift: it.shift || 'No Shift', status: 'Active' }),
      }).catch(() => {})
    })
  }

  const handleDeleteEmployee = (id: number) => {
    const emp = employees.find((e) => e.id === id)
    if (emp && window.confirm(`Delete ${emp.name}?`)) {
      setEmployees(employees.filter((e) => e.id !== id))
      logActivity('System Admin', 'Admin', 'Employee Deleted', emp.name)
      toast('Employee deleted', 'success')
      fetch('/api/staff', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {})
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
                { label: 'TOTAL EMPLOYEES', value: String(agencyEmployees.length), iconBg: 'bg-[#eef2ff]', iconColor: 'text-[#4f46e5]' },
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

      case 'complaint-register': {
        const total = complaints.length
        const pendingCount = complaints.filter((c) => c.status === 'PENDING').length
        const completedCount = complaints.filter((c) => c.status === 'COMPLETED' || c.status === 'RESOLVED').length
        const PAGE_SIZE = 10
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
        const safePage = Math.min(Math.max(complaintPage, 1), totalPages)
        const pagedComplaints = complaints.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
        return (
          <div>
            <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
              <div>
                <h1 className="text-[20px] font-semibold text-[#1f2937]">Complaint Register</h1>
                <p className="text-[13px] text-[#6b7280] mt-0.5">{total} complaints · Bharat Mandapam operations</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowComplaintForm(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  New Complaint
                </button>
                <button onClick={() => setCurrentView('complaint-register')} className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#fafbfc]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Refresh
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#fafbfc]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Total', value: total, cls: 'text-[#111827]' },
                { label: 'Pending', value: pendingCount, cls: 'text-[#ea580c]' },
                { label: 'Completed', value: completedCount, cls: 'text-[#16a34a]' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-[#e8edf2] px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">{s.label.toUpperCase()}</p>
                  <p className={`text-[24px] font-bold mt-1 ${s.cls}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {pagedComplaints.map((c) => {
                const done = c.status === 'COMPLETED' || c.status === 'RESOLVED'
                return (
                  <div key={c.id} className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
                    <div className="flex items-start gap-4 p-4">
                      {c.photo && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#e8edf2] shrink-0 hidden sm:block">
                          <img src={c.photo} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-[13px] font-bold text-[#111827]">#{c.publicId || c.id}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${c.priority === 'URGENT' ? 'bg-[#fef2f2] text-[#dc2626]' : c.priority === 'HIGH' ? 'bg-[#fff7ed] text-[#ea580c]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>{c.priority || 'MEDIUM'}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${done ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#fff7ed] text-[#ea580c]'}`}>{done ? 'Completed' : c.status}</span>
                        </div>
                        <p className="text-[14px] font-semibold text-[#111827] leading-snug">{c.title}</p>
                        {c.description && <p className="text-[12px] text-[#6b7280] mt-1 line-clamp-2">{c.description}</p>}
                        <p className="text-[12px] text-[#6b7280] mt-1">{c.location}{c.subArea ? ` · Sub Area: ${c.subArea}` : ''} · {c.service}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f3f4f6] text-[11px] font-semibold text-[#374151]">
                            <span className="w-4 h-4 rounded-full bg-[#0e4c5e] text-white text-[8px] font-bold flex items-center justify-center">{(c.agency || 'A').trim().charAt(0)}</span>
                            {c.agency}
                          </span>
                          {done && <span className="text-[11px] text-[#16a34a] font-medium">{c.completionTime || 'Completed'} {c.dueDate && c.dueDate !== '—' ? `· Due ${c.dueDate}` : ''}</span>}
                          {!done && <span className="text-[11px] text-[#9ca3af]">Due: {c.dueDate}</span>}
                        </div>
                        <p className="text-[11px] text-[#9ca3af] mt-1.5">{c.date} · Reported by {c.reportedBy || c.assignedTo} ({c.reporterRole || 'ITPO Official'})</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setEditComplaint(c)} className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-semibold text-[#0e4c5e] bg-[#e6f7f4] border border-[#bfe8e2] rounded-lg hover:bg-[#d9f2ee]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          Edit
                        </button>
                        <button onClick={() => setInspectComplaint(c)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          Inspect
                        </button>
                        <button onClick={() => deleteComplaint(c.id)} title="Delete complaint" className="p-2 text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg hover:bg-[#fee2e2]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                    {/* Workflow strip */}
                    <div className="flex items-center gap-0 border-t border-[#eef1f4] bg-[#fafbfc] px-4 py-2.5">
                      {[
                        { label: 'ITPO', sub: 'Before', cls: 'bg-[#eef2ff] text-[#4f46e5]' },
                        { label: 'Agency', sub: 'After', cls: 'bg-[#e6f7f4] text-[#0f766e]' },
                      ].map((w, i) => (
                        <div key={w.label} className="flex items-center">
                          {i > 0 && <svg className="w-4 h-4 text-[#cbd5e1] mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-semibold ${w.cls}`}>
                            {w.label} · {w.sub}
                          </span>
                        </div>
                      ))}
                      <span className="ml-auto text-[11px] text-[#9ca3af]">{done ? `Completed · ${c.dueDate}` : `Due: ${c.dueDate}`}</span>
                    </div>
                  </div>
                )
              })}
              {complaints.length === 0 && (
                <div className="bg-white rounded-xl border border-[#e8edf2] p-12 text-center text-[13px] text-[#9ca3af]">No complaints found.</div>
              )}
            </div>

            {total > PAGE_SIZE && (
              <div className="mt-4 flex items-center justify-between gap-3 flex-wrap bg-white rounded-xl border border-[#e8edf2] px-4 py-3">
                <p className="text-[12.5px] text-[#6b7280]">Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, total)} of {total} complaints</p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setComplaintPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="px-3 py-1.5 text-[12.5px] font-medium rounded-lg border border-[#e5e7eb] bg-white text-[#374151] hover:bg-[#f8fafc] disabled:opacity-40">← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button key={pg} onClick={() => setComplaintPage(pg)} className={`w-8 h-8 text-[12.5px] font-semibold rounded-lg ${pg === safePage ? 'bg-[#0e4c5e] text-white' : 'border border-[#e5e7eb] bg-white text-[#374151] hover:bg-[#f8fafc]'}`}>{pg}</button>
                  ))}
                  <button onClick={() => setComplaintPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="px-3 py-1.5 text-[12.5px] font-medium rounded-lg border border-[#e5e7eb] bg-white text-[#374151] hover:bg-[#f8fafc] disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </div>
        )
      }

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
                <button onClick={() => { setEditingOfficial(null); setShowItpoForm(true) }} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#2563eb] rounded-lg hover:bg-[#1d4ed8] shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add ITPO Official
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              {[
                { label: 'TOTAL ITPO OFFICIALS', value: String(officials.length), iconBg: 'bg-[#eef2ff]', iconColor: 'text-[#4f46e5]', icon: 'shield' },
                { label: 'CAMPUS-WIDE (ALL ZONES)', value: String(officials.filter((o) => o.zones.includes('All Zones')).length), iconBg: 'bg-[#f3e8ff]', iconColor: 'text-[#7c3aed]', icon: 'globe' },
                { label: 'ZONE-SPECIFIC TAGGED', value: String(officials.filter((o) => !o.zones.includes('All Zones')).length), iconBg: 'bg-[#e6f7f4]', iconColor: 'text-[#0f766e]', icon: 'pin' },
                { label: 'ACTIVE ACCOUNTS', value: String(officials.filter((o) => o.status === 'Active').length), iconBg: 'bg-[#e8f8ef]', iconColor: 'text-[#16a34a]', icon: 'check' },
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
                          <button onClick={() => { setEditingOfficial(official); setShowItpoForm(true) }} className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-md hover:bg-[#fafbfc]">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit
                          </button>
                          <button onClick={() => { setEditingOfficial(official); setShowItpoForm(true) }} className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-md hover:bg-[#fafbfc]">Edit Zones</button>
                          <button onClick={() => handleToggleOfficial(official)} className="px-2 py-1 text-[12px] font-medium text-[#ef4444] hover:bg-red-50 rounded-md">{official.status === 'Active' ? 'Disable' : 'Enable'}</button>
                          <button onClick={() => handleDeleteOfficial(official)} title="Delete" className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-[#fecaca] bg-white text-[#dc2626] hover:bg-[#fef2f2]">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
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
              <button onClick={() => window.location.href = '/admin/zones/form'} className="flex items-center gap-2 px-4 py-2 bg-[#0e4c5e] text-white rounded-lg text-[13px] font-semibold hover:bg-[#0b3c4a]">
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
              <button onClick={() => window.location.href = '/admin/areas/form'} className="flex items-center gap-2 px-4 py-2 bg-[#0e4c5e] text-white rounded-lg text-[13px] font-semibold hover:bg-[#0b3c4a]">
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
              <button onClick={() => window.location.href = '/admin/categories/form'} className="flex items-center gap-2 px-4 py-2 bg-[#0e4c5e] text-white rounded-lg text-[13px] font-semibold hover:bg-[#0b3c4a]">
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
                  <span className="text-2xl font-bold text-[#0f766e]">{zones.length}</span>
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
                  <span className="text-2xl font-bold text-green-600">{agencies.length}</span>
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
                  <span className="text-2xl font-bold text-purple-600">{officials.length}</span>
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
                  <span className="text-2xl font-bold text-orange-600">{employees.length}</span>
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
                        {['ZONE NAME', 'AREA', 'MANAGER', 'ZONE ACCESS', 'STATUS', 'ACTIONS'].map((h) => (
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
                          <td className="px-4 py-3"><span className="text-[12px] font-mono text-[#0f766e]">{zone.accessMobile || '—'}</span></td>
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
                  <button onClick={() => window.location.href = '/admin/areas/form'} className="text-[#0f766e] hover:text-[#0b3c4a] text-[12px] font-semibold">+ Add Area</button>
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
                <p className="text-[28px] font-semibold text-[#111827]">{employees.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6">
                <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280] mb-1">ACTIVE ON DUTY</p>
                <p className="text-3xl font-bold text-green-600">{employees.filter((e) => e.status === 'Active').length}</p>
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6">
                <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280] mb-1">ON LEAVE</p>
                <p className="text-3xl font-bold text-orange-600">{employees.filter((e) => e.status !== 'Active').length}</p>
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
                    <p className="text-[12.5px] text-[#6b7280] mt-0.5">
                      {attendanceRecords.length ? `${attendanceRecords.length} marked today · ${attendanceRecords[0]?.timestamp || ''}` : 'Capture front-camera photo with automatic date & time (GPS auto-enabled).'}
                    </p>
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
            {/* Attendance Records */}
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden mb-6">
              <div className="px-5 py-3.5 border-b border-[#eef1f4] flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827]">Attendance Records</h3>
                  <p className="text-[12px] text-[#9ca3af] mt-0.5">{attRecords.length} saved record{attRecords.length === 1 ? '' : 's'} · persisted to attendance.csv</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <svg className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" value={attSearch} onChange={(e) => setAttSearch(e.target.value)} placeholder="Search records..." className="h-9 pl-9 pr-3 w-56 rounded-lg bg-white border border-[#e5e7eb] text-[13px]" />
                  </div>
                  <button onClick={refreshAttRecords} className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f8fafc]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Refresh
                  </button>
                  <a href="/api/attendance" className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-semibold text-[#0f766e] bg-[#e6f7f4] border border-[#b7e4d4] rounded-lg hover:bg-[#d7f0ea]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export CSV
                  </a>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f8fafc] border-b border-[#eef1f4]">
                    <tr>
                      {['STAFF', 'ZONE', 'DATE & TIME', 'GPS', 'PHOTO', 'ACTIONS'].map((h) => <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase whitespace-nowrap">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f3f4f6]">
                    {attRecords.filter((r) => !attSearch || [r.staffName, r.zone, r.dateTime, r.gps].some((v) => v.toLowerCase().includes(attSearch.toLowerCase()))).map((r) => {
                      const ini = r.staffName.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                      return (
                        <tr key={r.id} className="hover:bg-[#fafbfc]">
                          <td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-[#0e4c5e] text-white text-[10px] font-bold flex items-center justify-center">{ini}</div><div><p className="text-[13px] font-semibold text-[#111827]">{r.staffName}</p><p className="text-[10.5px] text-[#9ca3af]">ID {r.staffId}</p></div></div></td>
                          <td className="px-4 py-3 text-[12.5px] text-[#374151] whitespace-nowrap">{r.zone || '—'}</td>
                          <td className="px-4 py-3 text-[12.5px] text-[#374151] whitespace-nowrap">{r.dateTime}</td>
                          <td className="px-4 py-3 text-[11.5px] text-[#6b7280] font-mono whitespace-nowrap">{r.gps || '—'}</td>
                          <td className="px-4 py-3">{r.photoFile ? <img src={`/api/photo?f=${encodeURIComponent(r.photoFile)}`} alt="" className="w-9 h-9 rounded-lg object-cover border border-[#e8edf2]" /> : <span className="text-[11px] text-[#9ca3af]">—</span>}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingAtt(r)} title="Edit record" className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[#0f766e] hover:bg-[#e6f7f4]"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                              <button onClick={() => handleDeleteAtt(r.id)} title="Delete record" className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-[#fecaca] bg-white text-[#dc2626] hover:bg-[#fef2f2]"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {attRecords.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#9ca3af]">No attendance records yet. Mark attendance to save records here.</td></tr>}
                    {attRecords.length > 0 && attRecords.filter((r) => !attSearch || [r.staffName, r.zone, r.dateTime, r.gps].some((v) => v.toLowerCase().includes(attSearch.toLowerCase()))).length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#9ca3af]">No records match your search.</td></tr>}
                  </tbody>
                </table>
              </div>
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
                  {employees.map((emp) => {
                    const ag = agencies.find((a) => a.id === emp.agencyId)
                    const onDuty = emp.status === 'Active'
                    const initials = emp.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                    return (
                      <tr key={emp.id} className="hover:bg-[#fafbfc]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${onDuty ? 'bg-[#e6f7f4]' : 'bg-[#fff7ed]'}`}>
                              <span className={`${onDuty ? 'text-[#0f766e]' : 'text-[#ea580c]'} font-semibold text-sm`}>{initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                              <p className="text-xs text-[#6b7280]">ID: ST-{String(emp.id).padStart(3, '0')} • {emp.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{ag?.name || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{emp.zone}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{emp.shift}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${onDuty ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#fff7ed] text-[#ea580c]'}`}>
                            {onDuty ? 'On Duty' : 'On Leave'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleDeleteEmployee(emp.id)} className="text-red-600 hover:text-red-700 text-sm font-medium">{t.delete}</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {employees.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-[13px] text-[#9ca3af]">No staff records in database yet.</td></tr>}
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
          ...zones.filter((z) => z.status !== 'Inactive').map((z) => ({ id: `zone:${z.name}`, title: z.name, type: 'complaint' as const, zone: z.name, fgColor: '#0b3c4a', bgColor: '#ffffff', size: 220, status: 'Active' as const, createdAt: 'Auto', system: true })),
          ...qrRecords.map((r) => ({ ...r, system: false })),
        ]
        const q = qrSearch.trim().toLowerCase()
        const filtered = qrItems.filter((item) => {
          const matchQ = !q || [item.title, item.zone || '', (item as any).url || '', item.type].some((v) => String(v).toLowerCase().includes(q))
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
                    {item.system && (() => {
                      const zone = zones.find((z) => z.name === item.zone || z.name === item.title)
                      const zoneInactive = zone?.status === 'Inactive'
                      return (
                        <>
                          <button
                            onClick={() => {
                              if (!zone) return
                              const next = zoneInactive ? 'Active' : 'Inactive'
                              fetch('/api/zones', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: zone.id, name: zone.name, area: zone.area, manager: zone.manager, status: next, accessMobile: zone.accessMobile }) })
                                .then(() => { setZones((p) => p.map((z) => z.id === zone.id ? { ...z, status: next } : z)); logActivity('System Admin', 'Admin', 'Zone Status', `${zone.name} → ${next}`) })
                                .catch(() => {})
                            }}
                            title={zoneInactive ? 'Activate zone QR' : 'Deactivate zone QR'}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[#d97706] hover:bg-[#fff7ed]"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button
                            onClick={() => {
                              if (!zone) return
                              if (!window.confirm(`Delete zone "${zone.name}" and its QR?`)) return
                              fetch('/api/zones', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: zone.id }) })
                                .then(() => { setZones((p) => p.filter((z) => z.id !== zone.id)); logActivity('System Admin', 'Admin', 'Zone Deleted', zone.name) })
                                .catch(() => {})
                            }}
                            title="Delete zone & QR"
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-[#fecaca] bg-white text-[#dc2626] hover:bg-[#fef2f2]"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </>
                      )
                    })()}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p className="col-span-full text-center text-[13px] text-[#9ca3af] py-10">No QR codes match your filters.</p>}
            </div>
            <p className="text-[11px] text-[#9ca3af] mt-4">Zone QR codes auto-generate from the live Zones master list (database). Custom QR codes persist in PostgreSQL via /api/qrcodes.</p>
          </div>
        )
      }
      case 'activity-logs': {
        const actors = Array.from(new Set(activityLogs.map((l) => l.actor))).sort()
        const filteredLogs = activityLogs.filter((l) => {
          const q = logSearch.trim().toLowerCase()
          const matchQ = !q || [l.actor, l.action, l.details, l.timestamp].some((v) => v.toLowerCase().includes(q))
          const matchA = logActorFilter === 'All Users' || l.actor === logActorFilter
          return matchQ && matchA
        })
        const actionColor = (a: string) => a.includes('Deleted') ? 'bg-[#fef2f2] text-[#dc2626]' : a.includes('Created') || a.includes('Marked') || a.includes('Imported') ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#eef2ff] text-[#4f46e5]'
        const totalPages = Math.max(1, Math.ceil(filteredLogs.length / logPageSize))
        const safePage = Math.min(logPage, totalPages)
        const pagedLogs = filteredLogs.slice((safePage - 1) * logPageSize, safePage * logPageSize)
        return (
          <div>
            <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-[20px] font-semibold text-[#1f2937]">Activity Logs</h1>
                <p className="text-[13px] text-[#6b7280] mt-1">Audit trail of all actions across the portal — who did what and when.</p>
              </div>
              <a href="/api/activity?download=csv" className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-[#0f766e] bg-[#e6f7f4] border border-[#b7e4d4] rounded-lg hover:bg-[#d7f0ea]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export CSV
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[{ l: 'TOTAL EVENTS', v: activityLogs.length, c: 'text-[#111827]' }, { l: 'USERS', v: actors.length, c: 'text-[#0f766e]' }, { l: 'UNIQUE ACTIONS', v: new Set(activityLogs.map((l) => l.action)).size, c: 'text-[#4f46e5]' }].map((c) => (
                <div key={c.l} className="bg-white rounded-xl border border-[#e8edf2] px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">{c.l}</p>
                  <p className={`text-[26px] font-semibold leading-none mt-1.5 ${c.c}`}>{c.v}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <svg className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" value={logSearch} onChange={(e) => setLogSearch(e.target.value)} placeholder="Search logs by user, action or details..." className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-[#e5e7eb] text-[13px]" />
              </div>
              <select value={logActorFilter} onChange={(e) => setLogActorFilter(e.target.value)} className="h-9 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] text-[#374151]">
                <option>All Users</option>
                {actors.map((a) => <option key={a}>{a}</option>)}
              </select>
              <button onClick={refreshLogs} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f8fafc]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Refresh
              </button>
            </div>
            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-[#eef1f4]">
                    {['TIME', 'USER', 'ROLE', 'ACTION', 'DETAILS'].map((h) => <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] whitespace-nowrap">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {pagedLogs.map((l) => (
                      <tr key={l.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafbfc]">
                        <td className="px-4 py-3 text-[12px] text-[#6b7280] whitespace-nowrap">{l.timestamp}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-[#0e4c5e] text-white text-[9px] font-bold flex items-center justify-center">{l.actor.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</div><span className="text-[12.5px] font-semibold text-[#111827]">{l.actor}</span></div></td>
                        <td className="px-4 py-3 text-[12px] text-[#6b7280] whitespace-nowrap">{l.role}</td>
                        <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${actionColor(l.action)}`}>{l.action}</span></td>
                        <td className="px-4 py-3 text-[12px] text-[#374151] max-w-[280px] truncate" title={l.details}>{l.details}</td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-[13px] text-[#9ca3af]">No activity recorded yet. Actions like zone edits, attendance marks and QR changes will appear here.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-[#eef1f4] flex items-center justify-between flex-wrap gap-2">
                <p className="text-[12.5px] text-[#9ca3af]">Showing {filteredLogs.length ? (safePage - 1) * logPageSize + 1 : 0}–{Math.min(safePage * logPageSize, filteredLogs.length)} of {filteredLogs.length} events</p>
                <div className="flex items-center gap-3">
                  <select value={logPageSize} onChange={(e) => { setLogPageSize(Number(e.target.value)); setLogPage(1) }} className="h-8 px-2 bg-white border border-[#e5e7eb] rounded-lg text-[12.5px] text-[#374151]">
                    {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}
                  </select>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setLogPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} className="p-1.5 rounded hover:bg-[#f3f5f8] text-[#9ca3af] disabled:opacity-40">‹</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map((p) => (
                      <button key={p} onClick={() => setLogPage(p)} className={`w-7 h-7 rounded-md text-[12.5px] font-medium ${p === safePage ? 'bg-[#0e4c5e] text-white' : 'text-[#6b7280] hover:bg-[#f3f5f8]'}`}>{p}</button>
                    ))}
                    <button onClick={() => setLogPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className="p-1.5 rounded hover:bg-[#f3f5f8] text-[#9ca3af] disabled:opacity-40">›</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
      case 'reports': {
        const repComplaints = complaints
        const repPending = repComplaints.filter((c) => c.status === 'PENDING').length
        const repDone = repComplaints.filter((c) => c.status === 'COMPLETED' || c.status === 'RESOLVED').length
        const byService = repComplaints.reduce<Record<string, number>>((m, c) => { const k = c.service || 'General'; m[k] = (m[k] || 0) + 1; return m }, {})
        const byZone = repComplaints.reduce<Record<string, number>>((m, c) => { const k = (c.zone || c.location || '—').split(' - ')[0]; m[k] = (m[k] || 0) + 1; return m }, {})
        const byAgency = repComplaints.reduce<Record<string, number>>((m, c) => { const k = c.agency || 'Unassigned'; m[k] = (m[k] || 0) + 1; return m }, {})
        const todayStr = new Date().toDateString()
        const attToday = attRecords.filter((r) => new Date(r.dateTime).toDateString() === todayStr).length
        const statCard = (label: string, value: string | number, sub: string, cls = 'text-[#111827]') => (
          <div key={label} className="bg-white rounded-xl border border-[#e8edf2] p-5">
            <p className="text-[11px] font-semibold tracking-[0.06em] text-[#9ca3af] uppercase">{label}</p>
            <p className={`text-[26px] font-bold mt-1 ${cls}`}>{value}</p>
            <p className="text-[11.5px] text-[#9ca3af] mt-0.5">{sub}</p>
          </div>
        )
        const bar = (label: string, count: number, total: number, color: string) => (
          <div key={label} className="flex items-center gap-3 py-2">
            <span className="w-40 truncate text-[12.5px] text-[#374151]">{label}</span>
            <div className="flex-1 h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${color}`} style={{ width: `${total ? Math.round((count / total) * 100) : 0}%` }} />
            </div>
            <span className="w-8 text-right text-[12.5px] font-semibold text-[#111827]">{count}</span>
          </div>
        )
        return (
          <div>
            <div className="mb-4">
              <h1 className="text-[20px] font-semibold text-[#1f2937]">Reports &amp; Analytics</h1>
              <p className="text-[13px] text-[#6b7280] mt-0.5">Live operational summary · Bharat Mandapam 360</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {statCard('Total Complaints', repComplaints.length, 'All registered complaints')}
              {statCard('Pending', repPending, 'Awaiting resolution', 'text-[#ea580c]')}
              {statCard('Completed', repDone, `${repComplaints.length ? Math.round((repDone / repComplaints.length) * 100) : 0}% resolution rate`, 'text-[#16a34a]')}
              {statCard('Attendance Today', attToday, `${attRecords.length} total records`)}
              {statCard('Field Staff', employees.length, `${employees.filter((e) => e.status === 'Active').length} active`)}
              {statCard('Agencies', agencies.length, 'Registered partners')}
              {statCard('ITPO Officials', officials.length, 'Active officials')}
              {statCard('Zones', zones.length, 'Operational zones')}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-[#e8edf2] p-5">
                <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Complaints by Service</h3>
                {Object.entries(byService).sort((a, b) => b[1] - a[1]).map(([k, v]) => bar(k, v, repComplaints.length, 'bg-[#0e4c5e]'))}
                {!repComplaints.length && <p className="text-[12.5px] text-[#9ca3af]">No complaints yet.</p>}
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] p-5">
                <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Complaints by Zone</h3>
                {Object.entries(byZone).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => bar(k, v, repComplaints.length, 'bg-[#1b8f84]'))}
                {!repComplaints.length && <p className="text-[12.5px] text-[#9ca3af]">No complaints yet.</p>}
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] p-5">
                <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Complaints by Agency</h3>
                {Object.entries(byAgency).sort((a, b) => b[1] - a[1]).map(([k, v]) => bar(k, v, repComplaints.length, 'bg-[#d97706]'))}
                {!repComplaints.length && <p className="text-[12.5px] text-[#9ca3af]">No complaints yet.</p>}
              </div>
              <div className="bg-white rounded-xl border border-[#e8edf2] p-5">
                <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Attendance Summary</h3>
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between py-2 border-b border-[#f3f4f6]"><span className="text-[#6b7280]">Total records</span><span className="font-semibold">{attRecords.length}</span></div>
                  <div className="flex justify-between py-2 border-b border-[#f3f4f6]"><span className="text-[#6b7280]">Marked today</span><span className="font-semibold text-[#16a34a]">{attToday}</span></div>
                  <div className="flex justify-between py-2"><span className="text-[#6b7280]">With photo evidence</span><span className="font-semibold">{attRecords.filter((r) => r.photoFile).length}</span></div>
                </div>
                <a href="/api/attendance" className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-semibold text-[#0f766e] bg-[#e6f7f4] border border-[#b7e4d4] rounded-lg hover:bg-[#d7f0ea]">
                  Export Attendance CSV
                </a>
              </div>
            </div>
          </div>
        )
      }
      case 'attendance': {
        const todayStr = new Date().toDateString()
        const attToday = attRecords.filter((r) => { const d = new Date(r.dateTime); return !isNaN(d.getTime()) && d.toDateString() === todayStr }).length
        const attWithPhoto = attRecords.filter((r) => r.photoFile).length
        const filteredAtt = attRecords.filter((r) => !attSearch || [r.staffName, r.staffId, r.zone, r.dateTime, r.gps, r.markedBy || ''].some((v) => String(v).toLowerCase().includes(attSearch.toLowerCase())))
        return (
          <div>
            <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-[20px] font-semibold text-[#1f2937]">Attendance Management</h1>
                <p className="text-[13px] text-[#6b7280] mt-0.5">{attRecords.length} records · marked via portal with photo &amp; GPS</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={refreshAttRecords} className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#fafbfc]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Refresh
                </button>
                <a href="/api/attendance" className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold text-[#0f766e] bg-[#e6f7f4] border border-[#b7e4d4] rounded-lg hover:bg-[#d7f0ea]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download CSV
                </a>
                <button onClick={() => setAttendanceOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Mark Attendance
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Total Records', value: attRecords.length, cls: 'text-[#111827]', sub: 'All saved attendance' },
                { label: 'Today', value: attToday, cls: 'text-[#16a34a]', sub: 'Marked today' },
                { label: 'With Photo', value: attWithPhoto, cls: 'text-[#1d4ed8]', sub: 'Evidence attached' },
                { label: 'Staff Covered', value: new Set(attRecords.map((r) => r.staffName)).size, cls: 'text-[#7c3aed]', sub: 'Unique staff' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-[#e8edf2] p-5">
                  <p className="text-[11px] font-semibold tracking-[0.06em] text-[#9ca3af] uppercase">{s.label}</p>
                  <p className={`text-[26px] font-bold mt-1 ${s.cls}`}>{s.value}</p>
                  <p className="text-[11.5px] text-[#9ca3af] mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#eef1f4] flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827]">Attendance Records</h3>
                  <p className="text-[12px] text-[#9ca3af] mt-0.5">{filteredAtt.length} record{filteredAtt.length === 1 ? '' : 's'} · PostgreSQL attendance table</p>
                </div>
                <div className="relative">
                  <svg className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" value={attSearch} onChange={(e) => setAttSearch(e.target.value)} placeholder="Search staff, zone, date..." className="h-9 pl-9 pr-3 w-64 rounded-lg bg-white border border-[#e5e7eb] text-[13px]" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f8fafc] border-b border-[#eef1f4]">
                    <tr>
                      {['S.NO', 'DATE', 'TIMESTAMP (IST)', 'STAFF', 'MOBILE', 'AGENCY', 'LATITUDE', 'LONGITUDE', 'ACCURACY', 'MAPS', 'REMARKS', 'PHOTO', 'ACTIONS'].map((h) => <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af] uppercase whitespace-nowrap">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f3f4f6]">
                    {filteredAtt.map((r, idx) => {
                      const ini = r.staffName.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                      const [lat, lng] = (r.gps || '').split(',').map((v) => v.trim())
                      const dtParts = (r.dateTime || '').split(',')
                      const mapUrl = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : ''
                      return (
                        <tr key={r.id} className="hover:bg-[#fafbfc]">
                          <td className="px-4 py-3 text-[12px] text-[#9ca3af] font-mono">{idx + 1}</td>
                          <td className="px-4 py-3 text-[12.5px] text-[#374151] whitespace-nowrap">{dtParts[0] || '—'}</td>
                          <td className="px-4 py-3 text-[12.5px] text-[#374151] whitespace-nowrap">{dtParts.slice(1).join(',').trim() || r.dateTime || '—'}</td>
                          <td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-[#0e4c5e] text-white text-[10px] font-bold flex items-center justify-center">{ini}</div><p className="text-[13px] font-semibold text-[#111827]">{r.staffName}</p></div></td>
                          <td className="px-4 py-3 text-[12px] text-[#6b7280] font-mono whitespace-nowrap">{(r as any).mobile || '—'}</td>
                          <td className="px-4 py-3 text-[12px] text-[#374151] whitespace-nowrap">{(r as any).agency || '—'}</td>
                          <td className="px-4 py-3 text-[11.5px] text-[#6b7280] font-mono whitespace-nowrap">{lat || '—'}</td>
                          <td className="px-4 py-3 text-[11.5px] text-[#6b7280] font-mono whitespace-nowrap">{lng || '—'}</td>
                          <td className="px-4 py-3 text-[11.5px] text-[#6b7280] font-mono whitespace-nowrap">{(r as any).accuracy ? `${(r as any).accuracy} m` : '—'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {mapUrl ? (
                              <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#1d4ed8] hover:underline">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Maps
                              </a>
                            ) : <span className="text-[11px] text-[#9ca3af]">—</span>}
                          </td>
                          <td className="px-4 py-3 text-[11.5px] text-[#6b7280] whitespace-nowrap">{(r as any).remarks || '—'}</td>
                          <td className="px-4 py-3">
                            {r.photoFile ? (
                              <a href={`/api/photo?f=${encodeURIComponent(r.photoFile)}`} target="_blank" rel="noreferrer" title="View / download photo">
                                <img src={`/api/photo?f=${encodeURIComponent(r.photoFile)}`} alt="" className="w-9 h-9 rounded-lg object-cover border border-[#e8edf2] hover:opacity-80" />
                              </a>
                            ) : <span className="text-[11px] text-[#9ca3af]">—</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              {r.photoFile && (
                                <a href={`/api/photo?f=${encodeURIComponent(r.photoFile)}&download=1`} download title="Download photo" className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-[#b7e4d4] bg-white text-[#0f766e] hover:bg-[#e6f7f4]">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </a>
                              )}
                              <button onClick={() => setEditingAtt(r)} title="Edit record" className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[#0f766e] hover:bg-[#e6f7f4]"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                              <button onClick={() => handleDeleteAtt(r.id)} title="Delete record" className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-[#fecaca] bg-white text-[#dc2626] hover:bg-[#fef2f2]"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredAtt.length === 0 && <tr><td colSpan={13} className="px-4 py-10 text-center text-[13px] text-[#9ca3af]">{attRecords.length ? 'No records match your search.' : 'No attendance records yet. Click "Mark Attendance" to add the first record.'}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
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
    fetch('/api/qrcodes').then((r) => r.json()).then((d) => {
      if (d.ok && d.codes && d.codes.length) {
        setQrRecords(d.codes.map((c: any) => ({ id: String(c.id), title: c.title, type: c.type === 'custom' ? 'custom' : 'complaint', zone: c.zone || undefined, url: c.url || undefined, fgColor: c.fg_color || '#0b3c4a', bgColor: c.bg_color || '#ffffff', size: c.size || 220, status: c.status === 'Inactive' ? 'Inactive' : 'Active', createdAt: new Date(c.created_at).toLocaleDateString('en-IN') })))
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!qrOrigin) return
    const items = [
      ...zones.filter((z) => z.status !== 'Inactive').map((z) => ({ id: `zone:${z.name}`, title: z.name, type: 'complaint' as const, zone: z.name, fgColor: '#0b3c4a', bgColor: '#ffffff', size: 220, status: 'Active' as const, createdAt: 'Auto' })),
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

  const refreshLogs = () => {
    fetch('/api/activity').then((r) => r.json()).then((d) => { if (d.ok) setActivityLogs(d.logs) }).catch(() => {})
  }

  useEffect(() => { refreshLogs() }, [])
  useEffect(() => { if (currentView === 'activity-logs') refreshLogs() }, [currentView])

  const refreshAttRecords = () => {
    fetch('/api/attendance?format=json').then((r) => r.json()).then((d) => {
      if (d.ok) {
        setAttRecords(d.records)
        // Rebuild today's marked list from DB so it survives refresh
        const todayStr = new Date().toDateString()
        setAttendanceRecords(d.records.filter((r: any) => {
          const dt = new Date(r.dateTime)
          return !isNaN(dt.getTime()) && dt.toDateString() === todayStr
        }).map((r: any, i: number) => ({
          staffId: Number(r.staffId) || i + 1,
          staffName: r.staffName,
          zone: r.zone || '',
          timestamp: r.dateTime,
          gps: r.gps || null,
          photo: r.photoFile ? `/api/photo?f=${encodeURIComponent(r.photoFile)}` : null,
        })))
      }
    }).catch(() => {})
  }
  useEffect(() => { refreshAttRecords() }, [])
  useEffect(() => { if (currentView === 'field-staff' || currentView === 'reports' || currentView === 'attendance') refreshAttRecords() }, [currentView])

  const handleUpdateAtt = async (id: number, data: { staffName: string; zone: string; dateTime: string; gps: string; mobile?: string; agency?: string; accuracy?: string; remarks?: string }) => {
    await fetch('/api/attendance', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) }).catch(() => {})
    setEditingAtt(null); refreshAttRecords()
  }

  const handleDeleteAtt = async (id: number) => {
    if (!window.confirm('Delete this attendance record?')) return
    await fetch('/api/attendance', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {})
    refreshAttRecords()
  }

  const persistQr = (records: QrRecord[]) => { setQrRecords(records); saveQrRecords(records) }

  const handleSaveQr = (record: QrRecord) => {
    logActivity('System Admin', 'Admin', editingQr ? 'QR Updated' : 'QR Created', record.title)
    const body = { id: editingQr && /^\d+$/.test(record.id) ? Number(record.id) : undefined, title: record.title, type: record.type, zone: record.zone, url: record.url, fgColor: record.fgColor, bgColor: record.bgColor, size: record.size, status: record.status }
    fetch('/api/qrcodes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json()).then((d) => {
      if (d.ok && d.code && !editingQr) persistQr([...qrRecords, { ...record, id: String(d.code.id) }])
      else persistQr(editingQr ? qrRecords.map((r) => (r.id === record.id ? record : r)) : [...qrRecords, record])
    }).catch(() => persistQr(editingQr ? qrRecords.map((r) => (r.id === record.id ? record : r)) : [...qrRecords, record]))
    setEditingQr(null)
  }

  const handleDeleteQr = (id: string) => {
    if (window.confirm('Delete this QR code?')) {
      if (/^\d+$/.test(id)) fetch('/api/qrcodes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: Number(id) }) }).catch(() => {})
      persistQr(qrRecords.filter((r) => r.id !== id)); logActivity('System Admin', 'Admin', 'QR Deleted', id)
    }
  }

  const handleToggleQr = (id: string) => {
    const rec = qrRecords.find((r) => r.id === id)
    if (rec) {
      logActivity('System Admin', 'Admin', rec.status === 'Active' ? 'QR Deactivated' : 'QR Activated', rec.title)
      if (/^\d+$/.test(id)) fetch('/api/qrcodes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: Number(id), title: rec.title, type: rec.type, zone: rec.zone, url: rec.url, fgColor: rec.fgColor, bgColor: rec.bgColor, size: rec.size, status: rec.status === 'Active' ? 'Inactive' : 'Active' }) }).catch(() => {})
    }
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
    reports: 'Reports',
    attendance: 'Attendance',
    zones: 'Zones',
    areas: 'Areas',
    categories: 'Categories',
    'qr-manager': 'QR Manager',
    'activity-logs': 'Activity Logs',
    'escalation-settings': 'Escalation Settings',
    'all-complaints': 'All Complaints',
    resolved: 'Resolved',
    pending: 'Pending',
  }

  const complaintItems: { id: ViewType; label: string; icon: string; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'complaint-register', label: 'Complaint Register', icon: 'clipboard', badge: String(complaints.filter((c) => c.status === 'PENDING').length) },
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
    { id: 'attendance', label: 'Attendance', icon: 'clock' },
    { id: 'reports', label: 'Reports', icon: 'chart' },
    { id: 'qr-manager', label: 'QR Manager', icon: 'qr' },
    { id: 'activity-logs', label: 'Activity Logs', icon: 'log' },
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
    if (name === 'log') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
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
      {navOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setNavOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[270px] bg-[#0b3c4a] text-white flex flex-col transform transition-transform duration-200 ${navOpen ? 'translate-x-0' : '-translate-x-full'} md:sticky md:top-0 md:bottom-auto md:left-auto md:h-screen md:self-start md:translate-x-0 md:w-[248px] md:shrink-0`}>
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
        <div className="px-3 pb-3">
          <button
            onClick={() => { fetch('/api/auth/logout', { method: 'POST' }).catch(() => {}); localStorage.removeItem('isLoggedIn'); localStorage.removeItem('userRole'); window.location.href = '/' }}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[#fca5a5] hover:bg-white/5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-14 bg-white border-b border-[#e8edf2] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[13px] text-[#6b7280] min-w-0">
            <button onClick={() => setNavOpen(true)} className="md:hidden p-1.5 -ml-1.5 text-[#374151] hover:bg-[#f3f5f8] rounded-lg" title="Menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
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
            <div className="relative hidden md:block">
              <svg className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search complaints..."
                className="w-[230px] h-9 pl-9 pr-3 rounded-full bg-[#f8fafc] text-[13px]"
              />
            </div>
            <div className="hidden sm:flex items-center gap-2 pl-1">

              <div className="w-8 h-8 rounded-full bg-[#e8eefc] text-[#1d4ed8] text-[11px] font-bold flex items-center justify-center">IA</div>
              <div className="leading-tight">
                <p className="text-[12.5px] font-semibold text-[#111827]">ITPO Administrator</p>
                <p className="text-[11px] text-[#6b7280]">ITPO Official</p>
              </div>
              <button onClick={() => { fetch('/api/auth/logout', { method: 'POST' }).catch(() => {}); localStorage.removeItem('isLoggedIn'); localStorage.removeItem('userRole'); window.location.href = '/' }} title="Logout" className="ml-1 p-1.5 text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-colors">
                <svg className="w-4.5 h-4.5 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {renderContent()}
        </main>
      </div>
      <ItpoOfficialFormModal open={showItpoForm} onClose={() => { setShowItpoForm(false); setEditingOfficial(null) }} editing={editingOfficial} onSave={handleSaveOfficial} />
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
      <AttendanceEditModal
        open={editingAtt != null}
        record={editingAtt}
        onClose={() => setEditingAtt(null)}
        onSave={handleUpdateAtt}
      />
      <ZoneSelectModal
        open={zoneModalOpen}
        onClose={() => setZoneModalOpen(false)}
        currentZone={operationalZone}
        onConfirm={(zone) => { const z = zone === 'All Campus Zones (Entire Complex)' ? 'All Zones (Entire Complex)' : zone; setOperationalZone(z); setZoneModalOpen(false); logActivity('System Admin', 'Admin', 'Zone Switched', z) }}
      />
      <ComplaintDetailsModal
        open={inspectComplaint != null}
        onClose={() => setInspectComplaint(null)}
        complaint={inspectComplaint}
        onStatusChange={(status) => {
          if (!inspectComplaint) return
          fetch('/api/complaints', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: inspectComplaint.id, status, actor: 'System Admin', role: 'Admin' }),
          }).then((r) => r.json()).then((d) => {
            if (d.ok) { logActivity('System Admin', 'Admin', status === 'COMPLETED' ? 'Complaint Completed' : 'Complaint Reopened', inspectComplaint.publicId || String(inspectComplaint.id)); loadComplaints() }
          }).catch(() => {})
        }}
      />
      <ComplaintEditModal
        open={editComplaint != null}
        onClose={() => setEditComplaint(null)}
        complaint={editComplaint}
        zones={zones.map((z) => z.name)}
        onSaved={() => { loadComplaints(); setEditComplaint(null) }}
      />
      <RegisterComplaintModal
        open={showComplaintForm}
        onClose={() => setShowComplaintForm(false)}
        onSuccess={loadComplaints}
        source="admin"
        reporterName="System Admin"
      />
    </div>
  )
}
