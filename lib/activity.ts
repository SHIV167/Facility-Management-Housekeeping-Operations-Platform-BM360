'use client'

export interface ActivityRecord {
  id: number
  timestamp: string
  actor: string
  role: string
  action: string
  details: string
}

export function logActivity(actor: string, role: string, action: string, details: string) {
  fetch('/api/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actor, role, action, details }),
  }).catch(() => {})
}
