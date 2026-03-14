'use client'

import * as React from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { TestRunWizard } from '@/components/test-runs'
import { useProjectStore } from '@/lib/store/project-store'

export default function NewTestRunPage() {
  const currentProjectId = useProjectStore((state) => state.currentProjectId)

  const breadcrumbs = [
    { title: 'Test Management', href: '#' },
    { title: 'Test Runs', href: '/test-runs' },
    { title: 'New Test Run' },
  ]

  return (
    <AppShell
      sidebar={<Sidebar />}
      header={<Header breadcrumbs={breadcrumbs} />}
    >
      <TestRunWizard projectId={currentProjectId} />
    </AppShell>
  )
}
