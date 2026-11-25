'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface Complaint {
  id: number
  public_id?: string
  title: string
  description?: string
  status: string
  priority?: string
  zone?: string
  sub_area?: string
  service?: string
  agency_id?: number | null
  agency_name?: string
  assigned_official_id?: number | null
  official_name?: string
  reporter_name?: string
  reported_by?: string
  reporter_mobile?: string
  due_date?: string
  dueDate?: string
  created_at?: string
  resolved_at?: string
  photo_url?: string | null
  photos?: string[]
  photo?: string | null
  sla_minutes?: number
}

export interface Agency {
  id: number
  name: string
  contact?: string
  phone?: string
  email?: string
  address?: string
  status?: string
  zones?: string[]
  services?: string[]
}

export interface Staff {
  id: number
  agency_id?: number
  name: string
  role: string
  designation?: string
  phone?: string
  employee_id?: string
  zones?: string[]
  shift?: string
  status?: string
  username?: string
}

export interface Zone {
  id: number
  name: string
  status?: string
  access_mobiles?: string
}

export interface Official {
  id: number
  name: string
  email?: string
  username?: string
  phone?: string
  role?: string
  zone?: string
  status?: string
}

export interface AttendanceRecord {
  id: number
  staff_id?: number
  staff_name: string
  zone?: string
  marked_at?: string
  dateTime?: string
  gps_lat?: number
  gps_lng?: number
  photo_url?: string
  photoFile?: string
  marked_by?: string
  mobile?: string
  agency?: string
  accuracy?: string
  remarks?: string
}

// Fetchers
const fetchComplaints = async (): Promise<Complaint[]> => {
  const res = await fetch('/api/complaints')
  const d = await res.json()
  return d.complaints || []
}

const fetchAgencies = async (): Promise<Agency[]> => {
  const res = await fetch('/api/agencies')
  const d = await res.json()
  return d.agencies || []
}

const fetchStaff = async (): Promise<Staff[]> => {
  const res = await fetch('/api/staff')
  const d = await res.json()
  return d.staff || []
}

const fetchZones = async (): Promise<Zone[]> => {
  const res = await fetch('/api/zones')
  const d = await res.json()
  return d.zones || []
}

const fetchOfficials = async (): Promise<Official[]> => {
  const res = await fetch('/api/officials')
  const d = await res.json()
  return d.officials || []
}

const fetchAttendance = async (): Promise<AttendanceRecord[]> => {
  const res = await fetch('/api/attendance')
  const d = await res.json()
  return d.attendance || []
}

// Query keys
export const queryKeys = {
  complaints: ['complaints'] as const,
  agencies: ['agencies'] as const,
  staff: ['staff'] as const,
  zones: ['zones'] as const,
  officials: ['officials'] as const,
  attendance: ['attendance'] as const,
}

// Hooks
export function useComplaints() {
  return useQuery({
    queryKey: queryKeys.complaints,
    queryFn: fetchComplaints,
  })
}

export function useAgencies() {
  return useQuery({
    queryKey: queryKeys.agencies,
    queryFn: fetchAgencies,
  })
}

export function useStaff() {
  return useQuery({
    queryKey: queryKeys.staff,
    queryFn: fetchStaff,
  })
}

export function useZones() {
  return useQuery({
    queryKey: queryKeys.zones,
    queryFn: fetchZones,
  })
}

export function useOfficials() {
  return useQuery({
    queryKey: queryKeys.officials,
    queryFn: fetchOfficials,
  })
}

export function useAttendance() {
  return useQuery({
    queryKey: queryKeys.attendance,
    queryFn: fetchAttendance,
  })
}

// Mutations with optimistic updates
export function useCreateComplaint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to create complaint')
      return d.complaint
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints })
    },
  })
}

export function useUpdateComplaint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await fetch('/api/complaints', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to update complaint')
      return d.complaint
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints })
    },
  })
}

export function useDeleteComplaint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch('/api/complaints', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to delete complaint')
      return d
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints })
    },
  })
}

export function useCreateAgency() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to create agency')
      return d.agency
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agencies })
    },
  })
}

export function useUpdateAgency() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await fetch('/api/agencies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to update agency')
      return d.agency
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agencies })
    },
  })
}

export function useDeleteAgency() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch('/api/agencies', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to delete agency')
      return d
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agencies })
    },
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to create staff')
      return d.staff
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff })
    },
  })
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await fetch('/api/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to update staff')
      return d.staff
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff })
    },
  })
}

export function useDeleteStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch('/api/staff', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to delete staff')
      return d
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff })
    },
  })
}

export function useCreateZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to create zone')
      return d.zone
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.zones })
    },
  })
}

export function useUpdateZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await fetch('/api/zones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to update zone')
      return d.zone
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.zones })
    },
  })
}

export function useDeleteZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch('/api/zones', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to delete zone')
      return d
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.zones })
    },
  })
}

export function useCreateOfficial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/officials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to create official')
      return d.official
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officials })
    },
  })
}

export function useUpdateOfficial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await fetch('/api/officials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to update official')
      return d.official
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officials })
    },
  })
}

export function useDeleteOfficial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch('/api/officials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to delete official')
      return d
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officials })
    },
  })
}

export function useCreateAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to create attendance')
      return d.attendance
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance })
    },
  })
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await fetch('/api/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to update attendance')
      return d.attendance
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance })
    },
  })
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch('/api/attendance', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) throw new Error(d.error || 'Failed to delete attendance')
      return d
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance })
    },
  })
}
