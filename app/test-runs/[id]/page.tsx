'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { BreadcrumbItem } from '@/types'
import { RunDashboard } from '@/components/test-runs'
import { useRunDashboardStore } from '@/lib/store/run-dashboard-store'
import { useProjectStore } from '@/lib/store/project-store'
import { closeRun, cloneRun, exportRun } from '@/lib/api/runs'
import { toast } from 'sonner'

function TestRunDashboardPageContent() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const currentProjectId = useProjectStore((state) => state.currentProjectId)

  const { run, isLoading, isPolling, lastUpdated, fetchRun, startPolling, stopPolling } =
    useRunDashboardStore()

  // Fetch run on mount
  React.useEffect(() => {
    if (id) {
      fetchRun(id)
      // Start polling for live updates every 10 seconds
      startPolling(id, 10000)
    }

    // Cleanup polling on unmount
    return () => {
      stopPolling()
    }
  }, [id, fetchRun, startPolling, stopPolling])

  const handleEdit = () => {
    toast.info('Edit functionality coming soon')
    // router.push(`/test-runs/${id}/edit`)
  }

  const handleClone = async () => {
    if (!currentProjectId) {
      toast.error('Select a project before cloning a run')
      return
    }

    try {
      const clonedRun = await cloneRun(currentProjectId, id)
      toast.success('Test run cloned successfully')
      router.push(`/test-runs/${clonedRun.id}`)
    } catch {
      toast.error('Failed to clone test run')
    }
  }

  const handleCloseRun = async () => {
    if (!currentProjectId) {
      toast.error('Select a project before closing a run')
      return
    }

    try {
      await closeRun(currentProjectId, id)
      await fetchRun(id)
    } catch {
      toast.error('Failed to close test run')
    }
  }

  const handleExport = async () => {
    if (!currentProjectId) {
      toast.error('Select a project before exporting a run')
      return
    }

    try {
      const exportResponse = await exportRun(currentProjectId, id)

      if (exportResponse.downloadUrl) {
        window.open(exportResponse.downloadUrl, '_blank', 'noopener,noreferrer')
      }

      toast.success('Run export started successfully')
    } catch {
      toast.error('Failed to export test run')
    }
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Test Management', href: '#' },
    { title: 'Test Runs', href: '/test-runs' },
    { title: run?.title || 'Run Dashboard' },
  ]

  return (
    <AppShell
      sidebar={<Sidebar />}
      header={<Header breadcrumbs={breadcrumbs} />}
    >
      <div className="space-y-4">
        <RunDashboard
          run={run}
          isLoading={isLoading}
          isLive={isPolling}
          lastUpdated={lastUpdated || undefined}
          onEdit={handleEdit}
          onClone={handleClone}
          onCloseRun={handleCloseRun}
          onExport={handleExport}
        />
      </div>
    </AppShell>
  )
}

export default function TestRunDashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TestRunDashboardPageContent />
    </Suspense>
  )
}
