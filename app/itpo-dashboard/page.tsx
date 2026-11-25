'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ItpoOfficialFormModal from '@/components/ItpoOfficialFormModal'
import ZoneSelectModal from '@/components/ZoneSelectModal'
import DocumentTitle from '@/components/DocumentTitle'
import { logActivity } from '@/lib/activity'
import { useToast } from '@/components/Toast'
import { useOfficials } from '@/lib/hooks'

type ViewType = 'overview' | 'officials' | 'performance' | 'assignments' | 'reports'

export default function ITPODashboardPage() {
  const { toast } = useToast()
  const router = useRouter()
  // React Query hooks
  const { data: dbOfficials = [], refetch: refetchOfficials } = useOfficials()

  const [currentView, setCurrentView] = useState<ViewType>('overview')
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [headerSearch, setHeaderSearch] = useState('')
  const [operationalZone, setOperationalZone] = useState('Hall 1-5')
  useEffect(() => {
    const z = localStorage.getItem('bm360_assigned_zone')
    if (z) setOperationalZone(z === 'All Campus Zones (Entire Complex)' ? 'All Zones (Entire Complex)' : z)
  }, [])
  const [zoneModalOpen, setZoneModalOpen] = useState(false)
  const [showItpoForm, setShowItpoForm] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    router.push('/')
  }

  // Sync React Query data to local state
  const [officials, setOfficials] = useState<any[]>([])
  useEffect(() => {
    if (dbOfficials.length) {
      setOfficials(dbOfficials.map((o: any) => ({
        id: o.id, name: o.name,
        initials: o.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        username: o.username || '', employeeId: o.employee_id || '', designation: o.designation || '',
        phone: o.phone || '', email: o.email || '',
        zones: Array.isArray(o.zones) && o.zones.length ? o.zones.join(', ') : 'All Zones (Entire Complex)',
        zonesList: Array.isArray(o.zones) ? o.zones : [],
        status: o.status || 'Active',
      })))
    }
  }, [dbOfficials])

  const recentActivities = [
    { id: 1, action: 'Complaint Resolved', official: 'Mr. Premjit Lal', complaintId: '#156', timestamp: '2 minutes ago', type: 'success' },
    { id: 2, action: 'New Complaint Assigned', official: 'Mrs. Sunita Sharma', complaintId: '#157', timestamp: '15 minutes ago', type: 'info' },
    { id: 3, action: 'Zone Updated', official: 'Mr. Rajesh Kumar', complaintId: '-', timestamp: '1 hour ago', type: 'warning' },
    { id: 4, action: 'Complaint Escalated', official: 'Ms. Priya Verma', complaintId: '#155', timestamp: '2 hours ago', type: 'error' }
  ]

  const navItems: { id: ViewType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'officials', label: 'Officials Directory', icon: 'badge' },
    { id: 'performance', label: 'Performance Analytics', icon: 'chart' },
    { id: 'assignments', label: 'Zone Assignments', icon: 'pin' },
    { id: 'reports', label: 'Reports', icon: 'clipboard' },
  ]

  const breadcrumbs: Record<ViewType, string> = {
    overview: 'ITPO Overview',
    officials: 'Officials Directory',
    performance: 'Performance Analytics',
    assignments: 'Zone Assignments',
    reports: 'Reports',
  }

  const NavIcon = ({ name }: { name: string }) => {
    const common = 'w-[18px] h-[18px] shrink-0'
    if (name === 'grid') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 6h6v6H4V6zm10 0h6v6h-6V6zM4 16h6v4H4v-4zm10 0h6v4h-6v-4z" /></svg>
    if (name === 'badge') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 11-4 0 2 2 0 014 0zm6 0h4" /></svg>
    if (name === 'chart') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    if (name === 'pin') return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
  }

  const navButton = (item: { id: ViewType; label: string; icon: string }) => {
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
      </button>
    )
  }

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          
      <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 w-9 h-9 rounded-full bg-white border border-[#e6ebf0] flex items-center justify-center text-[#1f8f86] shrink-0">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                </div>
                <div>
                  <h1 className="text-[20px] font-semibold text-[#1f2937] leading-tight">ITPO Operations Overview</h1>
                  <p className="text-[13px] text-[#6b7280] mt-0.5">Monitor officials, performance metrics, and complaint resolution across zones.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'TOTAL OFFICIALS', value: '124', sub: '↑ 12% from last month', iconBg: 'bg-[#eef2ff]', iconColor: 'text-[#4f46e5]', icon: 'users' },
                { label: 'ACTIVE ON DUTY', value: '122', sub: '98.4% active rate', iconBg: 'bg-[#e8f8ef]', iconColor: 'text-[#16a34a]', icon: 'check' },
                { label: 'COMPLAINTS ASSIGNED', value: '1,247', sub: 'This month', iconBg: 'bg-[#fff7ed]', iconColor: 'text-[#ea580c]', icon: 'clipboard' },
                { label: 'AVG. RESOLUTION', value: '94.2%', sub: '↑ 3% improvement', iconBg: 'bg-[#f3e8ff]', iconColor: 'text-[#7c3aed]', icon: 'chart' },
              ].map((card) => (
                <div key={card.label} className="bg-white rounded-xl border border-[#e8edf2] px-4 py-3.5 flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.04em] text-[#6b7280]">{card.label}</p>
                    <p className="text-[28px] font-semibold text-[#111827] leading-none mt-1.5">{card.value}</p>
                    <p className="text-[11px] text-[#9ca3af] mt-1">{card.sub}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${card.iconBg} ${card.iconColor} flex items-center justify-center`}>
                    {card.icon === 'users' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    {card.icon === 'check' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    {card.icon === 'clipboard' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    {card.icon === 'chart' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-[#e8edf2] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Top Performers This Month</h3>
                <div className="space-y-3">
                  {officials.slice(0, 3).map((official, index) => (
                    <div key={official.id} className="flex items-center gap-3 p-3 bg-[#fafbfc] rounded-lg border border-[#f0f2f5]">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white ${index === 0 ? 'bg-[#f59e0b]' : index === 1 ? 'bg-[#9ca3af]' : 'bg-[#d97706]'}`}>
                        {index + 1}
                      </div>
                      <div className="w-9 h-9 bg-[#0e4c5e] rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-[11px] font-semibold">{official.initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#111827] truncate">{official.name}</p>
                        <p className="text-[11px] text-[#6b7280]">{official.designation} • {official.zones}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] font-bold text-[#16a34a]">{official.resolutionRate}%</p>
                        <p className="text-[10px] text-[#9ca3af]">Resolution</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#e8edf2] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Recent Activities</h3>
                <div className="space-y-2.5">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-2.5 border border-[#f0f2f5] rounded-lg">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${activity.type === 'success' ? 'bg-[#22a35a]' : activity.type === 'error' ? 'bg-[#e11d48]' : activity.type === 'warning' ? 'bg-[#f59e0b]' : 'bg-[#2563eb]'}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] text-[#374151]">
                          <span className="font-semibold">{activity.action}</span>
                          {activity.complaintId !== '-' && <span className="text-[#6b7280]"> — {activity.complaintId}</span>}
                        </p>
                        <p className="text-[11px] text-[#9ca3af]">{activity.official} • {activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'officials':
        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 w-9 h-9 rounded-full bg-white border border-[#e6ebf0] flex items-center justify-center text-[#1f8f86] shrink-0">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 11-4 0 2 2 0 014 0zm6 0h4" /></svg>
                </div>
                <div>
                  <h1 className="text-[20px] font-semibold text-[#1f2937] leading-tight">ITPO Officials Directory</h1>
                  <p className="text-[13px] text-[#6b7280] mt-0.5">Manage authorized ITPO officials and their zone assignments.</p>
                </div>
              </div>
              <button onClick={() => setShowItpoForm(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#2563eb] rounded-lg hover:bg-[#1d4ed8] shadow-sm shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Official
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#eef1f4]">
                    {['OFFICIAL', 'DESIGNATION', 'ZONES', 'ASSIGNED', 'RESOLVED', 'RATE', 'STATUS', 'ACTIONS'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {officials.map((official) => (
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
                      <td className="px-4 py-3 text-[13px] text-[#374151]">{official.zones}</td>
                      <td className="px-4 py-3 text-[13px] text-[#374151]">{official.assignedComplaints}</td>
                      <td className="px-4 py-3 text-[13px] text-[#374151]">{official.resolvedComplaints}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#e8f8ef] text-[#16a34a]">{official.resolutionRate}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${official.status === 'Active' ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>{official.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="text-[12.5px] font-medium text-[#2563eb] hover:underline">View</button>
                          <button className="text-[12.5px] font-medium text-[#374151] hover:underline">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'performance':
        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 w-9 h-9 rounded-full bg-white border border-[#e6ebf0] flex items-center justify-center text-[#1f8f86] shrink-0">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <div>
                  <h1 className="text-[20px] font-semibold text-[#1f2937] leading-tight">Performance Analytics</h1>
                  <p className="text-[13px] text-[#6b7280] mt-0.5">Resolution rates, response times, and official rankings.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-[#e8edf2] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Resolution Rate by Official</h3>
                <div className="space-y-3.5">
                  {officials.map((official) => (
                    <div key={official.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12.5px] font-medium text-[#374151]">{official.name}</span>
                        <span className="text-[12.5px] font-bold text-[#111827]">{official.resolutionRate}%</span>
                      </div>
                      <div className="w-full bg-[#f3f4f6] rounded-full h-2">
                        <div className="bg-[#1b8f84] h-2 rounded-full" style={{ width: `${official.resolutionRate}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#e8edf2] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Response Time Analysis</h3>
                <div className="space-y-2.5">
                  {officials.map((official) => (
                    <div key={official.id} className="flex items-center justify-between p-3 bg-[#fafbfc] rounded-lg border border-[#f0f2f5]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-[#e6f7f4] rounded-full flex items-center justify-center">
                          <span className="text-[#0f766e] text-[11px] font-semibold">{official.initials}</span>
                        </div>
                        <span className="text-[13px] font-medium text-[#374151]">{official.name}</span>
                      </div>
                      <span className="text-[13px] font-bold text-[#111827]">{official.avgResponseTime} min</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#e8edf2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#eef1f4]">
                <h3 className="text-[15px] font-semibold text-[#111827]">Performance Ranking</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#eef1f4]">
                    {['RANK', 'OFFICIAL', 'DESIGNATION', 'ZONE', 'RESOLUTION', 'AVG RESPONSE', 'STATUS'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-[#9ca3af]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...officials].sort((a, b) => b.resolutionRate - a.resolutionRate).map((official, index) => (
                    <tr key={official.id} className={`border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafbfc] ${index === 0 ? 'bg-[#fffbeb]' : ''}`}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold text-white ${index === 0 ? 'bg-[#f59e0b]' : index === 1 ? 'bg-[#9ca3af]' : index === 2 ? 'bg-[#d97706]' : 'bg-[#e5e7eb] text-[#6b7280]'}`}>{index + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-[#12786f] rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white text-[11px] font-semibold">{official.initials}</span>
                          </div>
                          <span className="text-[13px] font-semibold text-[#111827]">{official.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#374151]">{official.designation}</td>
                      <td className="px-4 py-3 text-[13px] text-[#374151]">{official.zones}</td>
                      <td className="px-4 py-3 text-[13px] font-bold text-[#16a34a]">{official.resolutionRate}%</td>
                      <td className="px-4 py-3 text-[13px] text-[#374151]">{official.avgResponseTime} min</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${official.status === 'Active' ? 'bg-[#e8f8ef] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>{official.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'assignments':
        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 w-9 h-9 rounded-full bg-white border border-[#e6ebf0] flex items-center justify-center text-[#1f8f86] shrink-0">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <h1 className="text-[20px] font-semibold text-[#1f2937] leading-tight">Zone Assignments</h1>
                  <p className="text-[13px] text-[#6b7280] mt-0.5">Officials mapped to operational zones across Bharat Mandapam.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { zone: 'Hall 1-5', count: '2 officials', members: ['Mrs. Sunita Sharma', 'Ms. Priya Verma'], color: 'bg-[#e6f7f4] text-[#0f766e]' },
                { zone: 'Hall 6-10', count: '1 official', members: ['Mr. Rajesh Kumar'], color: 'bg-[#eef2ff] text-[#4f46e5]' },
                { zone: 'Hall 11-14', count: '1 official', members: ['Ms. Priya Verma'], color: 'bg-[#f3e8ff] text-[#7c3aed]' },
                { zone: 'Parking Area', count: '1 official', members: ['Mr. Amit Singh'], color: 'bg-[#fff7ed] text-[#ea580c]' },
                { zone: 'All Zones (Campus-wide)', count: '1 official', members: ['Mr. Premjit Lal'], color: 'bg-[#e8f8ef] text-[#16a34a]' },
                { zone: 'Unassigned', count: '118 officials', members: ['Pending assignment'], color: 'bg-[#f3f4f6] text-[#6b7280]' },
              ].map((z) => (
                <div key={z.zone} className="bg-white rounded-xl border border-[#e8edf2] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-semibold text-[#111827]">{z.zone}</h3>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${z.color}`}>{z.count}</span>
                  </div>
                  <div className="space-y-2">
                    {z.members.map((m) => (
                      <div key={m} className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#e6f7f4] rounded-full flex items-center justify-center shrink-0">
                          <span className="text-[#0f766e] text-[9px] font-bold">{m.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <span className="text-[12.5px] text-[#374151] truncate">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'reports':
        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 w-9 h-9 rounded-full bg-white border border-[#e6ebf0] flex items-center justify-center text-[#1f8f86] shrink-0">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <div>
                  <h1 className="text-[20px] font-semibold text-[#1f2937] leading-tight">Reports & Analytics</h1>
                  <p className="text-[13px] text-[#6b7280] mt-0.5">Generate performance and operational reports.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'Monthly Performance Report', desc: 'Comprehensive performance analysis for all officials', iconBg: 'bg-[#eef2ff]', iconColor: 'text-[#4f46e5]' },
                { title: 'Zone-wise Statistics', desc: 'Complaint distribution and resolution by zone', iconBg: 'bg-[#e6f7f4]', iconColor: 'text-[#0f766e]' },
                { title: 'Response Time Analysis', desc: 'Average response time trends and SLA compliance', iconBg: 'bg-[#fff7ed]', iconColor: 'text-[#ea580c]' },
                { title: 'Official Workload', desc: 'Work distribution and load balancing analysis', iconBg: 'bg-[#f3e8ff]', iconColor: 'text-[#7c3aed]' },
              ].map((r) => (
                <div key={r.title} className="bg-white rounded-xl border border-[#e8edf2] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-11 h-11 rounded-lg ${r.iconBg} ${r.iconColor} flex items-center justify-center`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h3 className="text-[14px] font-semibold text-[#111827]">{r.title}</h3>
                  </div>
                  <p className="text-[12.5px] text-[#6b7280] mb-3">{r.desc}</p>
                  <button className="text-[12.5px] font-semibold text-[#2563eb] hover:underline">Generate Report →</button>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return <div>Page not found</div>
    }
  }

  return (
    <div className="admin-shell min-h-screen flex bg-[#f3f5f8]">
      <DocumentTitle title="ITPO Dashboard" />
      {/* Sidebar - same theme as main dashboard */}
      <aside className="w-[248px] shrink-0 bg-[#0b3c4a] text-white flex flex-col">
        <div className="px-3.5 pt-3.5 pb-2">
          <div className="bg-white rounded-lg px-2 py-1.5 shadow-sm">
            <img src="https://vigpl.com/bm360_dark_logo.png" alt="BM360 Bharat Mandapam" className="h-9 w-auto mx-auto" />
          </div>
        </div>

        <div className="px-3 pt-2">
          <div className="w-full flex items-center gap-2.5 rounded-xl bg-[#0e4c5e] px-2.5 py-2">
            <span className="w-8 h-8 rounded-lg bg-[#14586a] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-semibold leading-tight">ITPO Dashboard</span>
              <span className="block text-[10px] text-[#9ec3d0] leading-tight mt-0.5">BM360 · ITPO Portal</span>
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll px-3 pt-3 pb-2">
          <p className="px-2 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#7f9eab]">ITPO OFFICIALS</p>
          <nav className="space-y-0.5">{navItems.map(navButton)}</nav>
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
            <p className="text-[13px] font-semibold leading-tight truncate">ITPO Administrator</p>
            <p className="text-[11px] text-[#9ec3d0] leading-tight">ITPO Official</p>
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
            <img src="https://vigpl.com/bm360_dark_logo.png" alt="BM360" className="h-4 w-auto" />
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
                placeholder="Search officials..."
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
      <ZoneSelectModal
        open={zoneModalOpen}
        onClose={() => setZoneModalOpen(false)}
        currentZone={operationalZone}
        onConfirm={(zone) => { const z = zone === 'All Campus Zones (Entire Complex)' ? 'All Zones (Entire Complex)' : zone; setOperationalZone(z); setZoneModalOpen(false); logActivity('ITPO Officer', 'ITPO', 'Zone Switched', z) }}
      />
    </div>
  )
}
