'use client'

import { useRouter } from 'next/navigation'
import RegisterComplaintModal from '@/components/RegisterComplaintModal'

export default function RegisterComplaintPage() {
  const router = useRouter()
  return <RegisterComplaintModal open onClose={() => router.push('/agency-dashboard')} />
}
