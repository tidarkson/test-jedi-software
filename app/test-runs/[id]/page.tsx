'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { BreadcrumbItem } from '@/types'
import { RunDashboard } from '@/components/test-runs'
import { useRunDashboardStore } from '@/lib/store/run-dashboard-store'
import { toast } from 'sonner'

export default function TestRunDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

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

  const handleClone = () => {
    toast.success('Test run cloned successfully!')
    // router.push(`/test-runs/${id}/clone`)
  }

  const handleCloseRun = () => {
    toast.success('Test run closed successfully')
    // API call to close run
  }

  const handleExport = () => {
    if (run) {
      const data = JSON.stringify({
        run: run,
        exportedAt: new Date().toISOString(),
      }, null, 2)
      
      const element = document.createElement('a')
      element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(data))
      element.setAttribute('download', `test-run-${id}-export.json`)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      
      toast.success('Test run exported successfully')
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
