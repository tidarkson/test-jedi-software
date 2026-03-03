'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { TestCaseForm } from '@/components/test-repository'

export default function NewTestCasePage() {
  const router = useRouter()

  const breadcrumbs = [
    { title: 'Test Management', href: '#' },
    { title: 'Test Repository', href: '/' },
    { title: 'New Test Case' },
  ]

  const handleSubmit = (data: unknown) => {
    console.log('Test case data:', data)
    // In a real app, this would save to the database
    router.push('/')
  }

  const handleCancel = () => {
    router.push('/')
  }

  return (
    <AppShell
      sidebar={<Sidebar />}
      header={<Header breadcrumbs={breadcrumbs} />}
    >
      <div className="h-full overflow-auto p-6">
        <div className="mx-auto max-w-4xl">
          <TestCaseForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </AppShell>
  )
}
