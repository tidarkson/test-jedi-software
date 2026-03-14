'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TOKEN_STORAGE_KEY } from '@/lib/api/client'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY)

    if (token) {
      router.replace('/dashboard')
      return
    }

    router.replace('/login')
  }, [router])

  return null
}
