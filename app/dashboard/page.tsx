'use client'

import { useState } from 'react'
import { translations, Language } from '@/lib/translations'

type ViewType = 'overview' | 'complaint-register' | 'itpo-officials' | 'all-complaints' | 'resolved' | 'pending' | 'zones' | 'areas' | 'categories'

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<ViewType>('itpo-officials')
  const [language, setLanguage] = useState<Language>('en')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterZone, setFilterZone] = useState('All Zone Tagging Scopes')
  const [filterStatus, setFilterStatus] = useState('Active Only')

  const t = translations[language]

  const officials = [
    {
      id: 1,
      name: 'Mr. Premjit Lal',
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

  const zones = [
    { id: 1, name: 'Hall 1-5', area: '12000 sq ft', manager: 'Mrs. Sunita Sharma', status: 'Active' },
    { id: 2, name: 'Hall 6-10', area: '15000 sq ft', manager: 'Mr. Rajesh Kumar', status: 'Active' },
    { id: 3, name: 'Hall 11-14', area: '18000 sq ft', manager: 'Mr. Premjit Lal', status: 'Active' },
    { id: 4, name: 'Parking Area', area: '25000 sq ft', manager: 'Pending Assignment', status: 'Inactive' }
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

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.dashboardOverview}</h1>
              <p className="text-gray-600">{t.welcomeMessage}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-500 mb-1">{t.totalComplaints}</p>
                <p className="text-3xl font-bold text-gray-900">156</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-500 mb-1">{t.pendingComplaints}</p>
                <p className="text-3xl font-bold text-orange-600">23</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-500 mb-1">{t.resolvedComplaints}</p>
                <p className="text-3xl font-bold text-green-600">128</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-500 mb-1">{t.overdueComplaints}</p>
                <p className="text-3xl font-bold text-red-600">5</p>
              </div>
            </div>
          </div>
        )

      case 'complaint-register':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Complaint Register</h1>
              <p className="text-gray-600">View and manage all complaints across Bharat Mandapam</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Agency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{complaint.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.title}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          complaint.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          complaint.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          complaint.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                          complaint.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.itpoOfficialsDirectory}</h1>
              <p className="text-gray-600">{t.itpoOfficialsDescription}</p>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t.refresh}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t.export}
              </button>
              <button onClick={() => window.location.href = '/dashboard/itpo-officials/form'} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t.addItpoOfficial}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-500 mb-1">TOTAL ITPO OFFICIALS</p>
                <p className="text-3xl font-bold text-gray-900">124</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-500 mb-1">CAMPUS-WIDE (ALL ZONES)</p>
                <p className="text-3xl font-bold text-gray-900">72</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-500 mb-1">ZONE-SPECIFIC TAGGED</p>
                <p className="text-3xl font-bold text-gray-900">52</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-500 mb-1">ACTIVE ACCOUNTS</p>
                <p className="text-3xl font-bold text-gray-900">122</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search officials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterZone}
                  onChange={(e) => setFilterZone(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>All Zone Tagging Scopes</option>
                  <option>All Zones (Entire Complex)</option>
                  <option>Zone-Specific</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Active Only</option>
                  <option>All Status</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">OFFICIAL NAME & LOGIN</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">DESIGNATION</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">CONTACT</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">TAGGED OPERATIONAL ZONES</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">STATUS</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {officials.map((official) => (
                    <tr key={official.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {official.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{official.name}</p>
                            <p className="text-xs text-gray-500">{official.username}</p>
                            <p className="text-xs text-gray-400">ID: {official.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{official.designation}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{official.phone}</p>
                        <p className="text-xs text-gray-500">{official.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {official.zones}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          official.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {official.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit Zones</button>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">Disable</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">Showing 1 to 3 of 124 officials</p>
                <div className="flex items-center gap-4">
                  <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                  <span className="text-sm text-gray-500">rows per page</span>
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded hover:bg-gray-100">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium">1</button>
                    <button className="p-2 rounded hover:bg-gray-100">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'all-complaints':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">All Complaints</h1>
              <p className="text-gray-600">View all complaints across the system</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{complaint.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.title}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          complaint.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          complaint.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          complaint.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                          complaint.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Resolved Complaints</h1>
              <p className="text-gray-600">View all resolved complaints</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Resolved Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Agency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {complaints.filter(c => c.status === 'RESOLVED' || c.status === 'COMPLETED').map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Complaints</h1>
              <p className="text-gray-600">View all pending complaints</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {complaints.filter(c => c.status === 'PENDING').map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{complaint.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{complaint.dueDate}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          complaint.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                          complaint.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.zonesManagement}</h1>
              <p className="text-gray-600">{t.zonesDescription}</p>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => window.location.href = '/dashboard/zones/form'} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t.addZone}
              </button>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Zone Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Area</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Manager</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {zones.map((zone) => (
                    <tr key={zone.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{zone.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{zone.area}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{zone.manager}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          zone.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {zone.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.areasManagement}</h1>
              <p className="text-gray-600">{t.areasDescription}</p>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => window.location.href = '/dashboard/areas/form'} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t.addArea}
              </button>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Area Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Zone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {areas.map((area) => (
                    <tr key={area.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{area.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{area.zone}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{area.type}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {area.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.categoriesManagement}</h1>
              <p className="text-gray-600">{t.categoriesDescription}</p>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => window.location.href = '/dashboard/categories/form'} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t.addCategory}
              </button>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Complaints</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{category.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{category.complaints}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {category.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
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

      default:
        return <div>Page not found</div>
    }
  }

  const getBreadcrumbText = () => {
    switch (currentView) {
      case 'overview': return t.overview
      case 'complaint-register': return t.complaintRegister
      case 'itpo-officials': return t.itpoOfficials
      case 'all-complaints': return t.allComplaints
      case 'resolved': return t.resolved
      case 'pending': return t.pending
      case 'zones': return t.zones
      case 'areas': return t.areas
      case 'categories': return t.categories
      default: return ''
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-white">BM</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">BM360</h1>
              <p className="text-xs text-gray-500">Bharat Mandapam</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* ITPO Operations Section */}
          <div className="px-4 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t.itpoOperations}</p>
            <nav className="space-y-1">
              <button
                onClick={() => setCurrentView('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  currentView === 'overview' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t.overview}
              </button>
              <button
                onClick={() => setCurrentView('complaint-register')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  currentView === 'complaint-register' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {t.complaintRegister}
              </button>
              <button
                onClick={() => setCurrentView('itpo-officials')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  currentView === 'itpo-officials' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t.itpoOfficials}
              </button>
            </nav>
          </div>

          {/* COMPLAINTS Section */}
          <div className="px-4 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t.complaints}</p>
            <nav className="space-y-1">
              <button
                onClick={() => setCurrentView('all-complaints')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  currentView === 'all-complaints' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.allComplaints}
              </button>
              <button
                onClick={() => setCurrentView('resolved')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  currentView === 'resolved' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.resolved}
              </button>
              <button
                onClick={() => setCurrentView('pending')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  currentView === 'pending' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {t.pending}
              </button>
            </nav>
          </div>

          {/* MASTER DATA ENTRY Section */}
          <div className="px-4 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t.masterDataEntry}</p>
            <nav className="space-y-1">
              <button
                onClick={() => setCurrentView('zones')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  currentView === 'zones' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {t.zones}
              </button>
              <button
                onClick={() => setCurrentView('areas')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  currentView === 'areas' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t.areas}
              </button>
              <button
                onClick={() => setCurrentView('categories')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  currentView === 'categories' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {t.categories}
              </button>
            </nav>
          </div>

          {/* Language Section */}
          <div className="px-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t.language}</p>
            <nav className="space-y-1">
              <button
                onClick={() => setLanguage('en')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  language === 'en' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {t.english}
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  language === 'hi' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {t.hindi}
              </button>
            </nav>
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">IA</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{t.itpoAdministrator}</p>
              <p className="text-xs text-gray-500">{t.operationalZone}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t.logout}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
              <a href="#" className="text-gray-500 hover:text-gray-700">{t.bm360}</a>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium">{getBreadcrumbText()}</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    language === 'en' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    language === 'hi' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  हिन्दी
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* User */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">IA</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{t.itpoAdministrator}</span>
                <button
                  onClick={() => window.location.href = '/'}
                  className="ml-4 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
