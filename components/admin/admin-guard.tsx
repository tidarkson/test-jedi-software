'use client'

import * as React from 'react'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useAuthStore } from '@/lib/store/auth-store'
import Link from 'next/link'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)

  const hasAdminAccess = React.useMemo(() => {
    const role = user?.role?.toLowerCase()
    return role === 'admin' || role === 'owner'
  }, [user?.role])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (!isAuthenticated || !hasAdminAccess) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this page. Only administrators and owners can view admin settings.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
