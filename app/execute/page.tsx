'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ExecutionWorkspace } from '@/components/execution'
import { useExecutionStore } from '@/lib/store/execution-store'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

function ExecutionPageContent() {
  const { execution, loadExecution, isLoading } = useExecutionStore()
  const searchParams = useSearchParams()
  const params = useParams<{ runId?: string }>()
  const runIdFromQuery = searchParams.get('runId')
  const runIdFromRoute = typeof params?.runId === 'string' ? params.runId : null
  const runId = runIdFromQuery || runIdFromRoute

  React.useEffect(() => {
    if (!runId) {
      return
    }

    void loadExecution(runId)
  }, [runId, loadExecution])

  const breadcrumbs = [
    { title: 'Test Management', href: '#' },
    { title: 'Test Runs', href: '/test-runs' },
    { title: execution?.name || 'Execution', href: '#' },
  ]

  return (
    <AppShell
      sidebar={<Sidebar />}
      header={<Header breadcrumbs={breadcrumbs} />}
    >
      {!runId ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold">No run selected</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose a test run to start execution.</p>
            <Button className="mt-4" asChild>
              <Link href="/test-runs">Back to test runs</Link>
            </Button>
          </div>
        </div>
      ) : isLoading && !execution ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[320px] w-full" />
            <Skeleton className="h-[320px] w-full" />
          </div>
        </div>
      ) : (
        <ExecutionWorkspace className="h-full" />
      )}
    </AppShell>
  )
}

export default function ExecutionPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ExecutionPageContent />
    </Suspense>
  )
}
