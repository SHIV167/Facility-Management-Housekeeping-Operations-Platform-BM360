export const ALL_ZONES_LABEL = 'All Campus Zones (Entire Complex)'

export const ZONE_NAMES = [
  'Admin Building',
  'Female Washroom',
  'Food Court in Front of Hall 6',
  'GF H2',
  'GF H3',
  'GF H4',
  'Gate No. 1 From Gate No. 11',
  'Grand Canopy',
  'Hall No. 10',
  'Hall No. 11',
  'Hall No. 12',
  'Hall No. 12 A',
  'Hall No. 8',
  'Hall No. 9',
  'Inside',
  'Male Washroom',
  'Near hall 14 helipad Area',
  'Night Washroom',
  'Non tower area - near sada punjab',
  'Open Area, Helipad',
  'Open Area, NTA (parking)',
  'Outer',
  'Outside Outer',
  'Rajasthan food stall - amphitheater 2',
  'Truck & Champion All Area Garbage',
  'Truck All Area Garbage',
  'Uttarpradesh good stall - amphitheater 1',
  'Hall 14',
  'Hall 12 & 12A',
  'Hall 11',
  'Open Area 1',
  'Service Road',
  'Hall 1',
  'Musical Fountain',
  'Hall 2-4',
  'Hall 5',
  'Gate No. 4',
  'Hall 6',
  'Hall 2-5 First Floors',
  'Gate 9 and 10',
  'Gate 6, 7 and 8',
  'Bharat Mandapam CC - Level 1',
  'Bharat Mandapam CC - Level 2',
  'Bharat Mandapam CC - Level 3',
  'Area Outside BMCC',
  'Basement 1',
  'Basement 2',
  'Basement and Parking - Admin Building',
  'Canopy Area',
]

export interface ZoneRecord {
  id: number
  name: string
  area: string
  manager: string
  status: 'Active' | 'Inactive'
}

export const defaultZones: ZoneRecord[] = ZONE_NAMES.map((name, i) => ({
  id: i + 1,
  name,
  area: '—',
  manager: 'Unassigned',
  status: 'Active',
}))
