'use client'

import { useState } from 'react'

export default function AgencyDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('Last 7 Days')
  const [agencyFilter, setAgencyFilter] = useState('All Agencies')

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

        {/* Agency Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Soni Facility Management</p>
              <p className="text-xs text-gray-500">BM360 - Operations</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Complaints Section */}
          <div className="px-4 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Complaints</p>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Overview
              </a>
              <a href="#" className="flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Complaint Register
                </div>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Housekeeping Worker Ranking
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Field Staff
              </a>
            </nav>
          </div>

          {/* Language Section */}
          <div className="px-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Language / Bhasha</p>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                EN
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                हिन्दी
              </a>
            </nav>
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">LL</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Laxman Lal</p>
              <p className="text-xs text-gray-500">Agency Manager</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500">Operational Zone</p>
              <p className="text-sm font-medium text-gray-900">Unassigned</p>
            </div>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Change</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
              <a href="#" className="text-gray-500 hover:text-gray-700">BM360</a>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium">Overview</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <div className="flex items-center gap-1">
                <button className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">EN</button>
                <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md">हिन्दी</button>
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search complaints..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* User */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">LL</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Laxman Lal</p>
                  <p className="text-xs text-gray-500">Agency Manager</p>
                </div>
              </div>

              {/* Time */}
              <div className="text-sm text-gray-500">
                09:59
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Greeting Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Good Afternoon, Laxman Lal</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Agency Manager
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-sm text-gray-600">All Campus</span>
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Change Zone</button>
            </div>
          </div>

          {/* Complaint Overview Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Complaint Overview</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {['Last 7 Days', 'Today', '30 Days', 'Calendar', 'All Time'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDateFilter(filter)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                        dateFilter === filter
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  + New Complaint
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-500 mb-1">Total Complaints</p>
                <p className="text-3xl font-bold text-gray-900">54</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-500 mb-1">Pending Complaints</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-orange-600">3</p>
                  <span className="text-sm text-red-600">(3 past SLA)</span>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-500 mb-1">Completed Complaints</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-green-600">51</p>
                  <span className="text-sm text-gray-500">(Resolved)</span>
                </div>
              </div>
            </div>
          </div>

          {/* All Complaints Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">All Complaints</h2>
                <p className="text-sm text-gray-500">Showing 54 complaints</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search complaints by ID, title, location, officer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={agencyFilter}
                  onChange={(e) => setAgencyFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>All Agencies</option>
                  <option>Soni Facility Management</option>
                  <option>BLUSPRING ENTERPRISES LTD.</option>
                </select>
              </div>
            </div>

            {/* Complaints Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Photo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID & Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Complaint</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Agency</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        {complaint.photo ? (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">#{complaint.id}</p>
                        <p className="text-xs text-gray-500">{complaint.date}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-900 mb-1">{complaint.title}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            complaint.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            complaint.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {complaint.status}
                          </span>
                          {complaint.completionTime && (
                            <p className="text-xs text-gray-500 mt-1">{complaint.completionTime}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">{complaint.location}</p>
                        <p className="text-xs text-gray-500">{complaint.campus}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">{complaint.service}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">{complaint.agency}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">{complaint.dueDate}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">Showing 1 to 5 of 54 complaints</p>
                <div className="flex items-center gap-4">
                  <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                  <span className="text-sm text-gray-500">complaints per page</span>
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded hover:bg-gray-100">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    {[1, 2, 3, 4, 5].map((page) => (
                      <button
                        key={page}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          page === 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
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
        </div>
      </div>
    </div>
  )
}
