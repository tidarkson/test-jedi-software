'use client'

import { useEffect } from 'react'
import { TOKEN_STORAGE_KEY } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth-store'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const loadUser = useAuthStore((state) => state.loadUser)

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    if (token) {
      void loadUser().catch(() => undefined)
    }
  }, [loadUser])

  return <>{children}</>
}
