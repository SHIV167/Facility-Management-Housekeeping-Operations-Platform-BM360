'use client'

import { useRouter } from 'next/navigation'
import ComplaintDetailsModal from '@/components/ComplaintDetailsModal'

export default function ComplaintDetailsPage() {
  const router = useRouter()

  const complaint = {
    id: 24,
    title: 'Housekeeping Work During Fair',
    status: 'COMPLETED',
    completionTime: 'Completed in 42 min - 18 min early',
    location: 'Admin Building, 1st Floor',
    campus: 'Bharat Mandapam',
    service: 'Housekeeping Operations',
    agency: 'BLUSPRING ENTERPRISES LTD.',
    dueDate: '14 Nov 2026, 02:55 pm',
    date: '14 Nov 2026, 01:55 pm',
  }

  return (
    <ComplaintDetailsModal
      open={true}
      complaint={complaint}
      onClose={() => router.push('/agency-dashboard')}
    />
  )
}
