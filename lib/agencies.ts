export interface AgencyRecord {
  id: number
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  services: string[]
  zones: string[]
  employeeCount: number
  joinedDate: string
  status: 'Active' | 'Inactive'
}

export interface EmployeeRecord {
  id: number
  agencyId: number
  name: string
  role: string
  phone: string
  zone: string
  shift: string
  status: 'Active' | 'Inactive'
}

export const SERVICE_OPTIONS = ['Housekeeping', 'Electrical', 'Plumbing', 'HVAC']

export const defaultAgencies: AgencyRecord[] = [
  {
    id: 1,
    name: 'Soni Facility Management',
    contactPerson: 'Laxman Lal',
    phone: '9876543210',
    email: 'contact@sonifacility.com',
    address: 'Bharat Mandapam Campus, New Delhi',
    services: ['Housekeeping'],
    zones: ['Hall 1-5', 'Hall 6-10', 'Parking Area'],
    employeeCount: 148,
    joinedDate: '01 Jan 2025',
    status: 'Active',
  },
  {
    id: 2,
    name: 'BLUSPRING ENTERPRISES LTD.',
    contactPerson: 'Rajesh Kumar',
    phone: '9876543211',
    email: 'info@bluspring.com',
    address: 'Connaught Place, New Delhi',
    services: ['Housekeeping', 'Electrical'],
    zones: ['Hall 11-14', 'Admin Building'],
    employeeCount: 108,
    joinedDate: '15 Mar 2025',
    status: 'Active',
  },
]

export const defaultEmployees: EmployeeRecord[] = [
  { id: 1, agencyId: 1, name: 'Ramesh Singh', role: 'Supervisor', phone: '9810012345', zone: 'Hall 1-5', shift: 'Morning (6AM - 2PM)', status: 'Active' },
  { id: 2, agencyId: 1, name: 'Suresh Gupta', role: 'Cleaner', phone: '9810012346', zone: 'Hall 1-5', shift: 'Morning (6AM - 2PM)', status: 'Active' },
  { id: 3, agencyId: 1, name: 'Mahesh Verma', role: 'Cleaner', phone: '9810012347', zone: 'Hall 6-10', shift: 'Evening (2PM - 10PM)', status: 'Active' },
  { id: 4, agencyId: 2, name: 'Anil Sharma', role: 'Electrician', phone: '9810012348', zone: 'Hall 11-14', shift: 'Morning (6AM - 2PM)', status: 'Active' },
  { id: 5, agencyId: 2, name: 'Vikram Yadav', role: 'Plumber', phone: '9810012349', zone: 'Admin Building', shift: 'Evening (2PM - 10PM)', status: 'Inactive' },
]
