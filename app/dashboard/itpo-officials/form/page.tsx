'use client'

import { useRouter } from 'next/navigation'
import ItpoOfficialFormModal from '@/components/ItpoOfficialFormModal'

export default function ItpoOfficialFormPage() {
  const router = useRouter()
  return <ItpoOfficialFormModal open onClose={() => router.push('/dashboard')} />
}
