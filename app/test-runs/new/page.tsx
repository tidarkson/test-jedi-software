'use client'

import * as React from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { TestRunWizard } from '@/components/test-runs'

export default function NewTestRunPage() {
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
      <TestRunWizard />
    </AppShell>
  )
}
