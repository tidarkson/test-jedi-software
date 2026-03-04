'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { PlanCreateForm } from '@/components/test-plans'
import { TestRun } from '@/types'
import { toast } from 'sonner'

// Mock test runs for the dropdown
const mockTestRuns: TestRun[] = [
  {
    id: 'TR-001',
    name: 'Sprint 22 Regression',
    status: 'completed',
    environment: 'Staging',
    testCases: [],
    createdBy: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'engineer' },
    statistics: {
      total: 45,
      passed: 40,
      failed: 3,
      blocked: 2,
      retest: 0,
      skipped: 0,
      na: 0,
      deferred: 0,
      passRate: 88.9,
    },
  },
  {
    id: 'TR-002',
    name: 'Hotfix v2.4.1 Smoke Test',
    status: 'completed',
    environment: 'Production',
    testCases: [],
    createdBy: { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'engineer' },
    statistics: {
      total: 12,
      passed: 11,
      failed: 1,
      blocked: 0,
      retest: 0,
      skipped: 0,
      na: 0,
      deferred: 0,
      passRate: 91.7,
    },
  },
  {
    id: 'TR-003',
    name: 'API Integration Tests',
    status: 'active',
    environment: 'QA',
    testCases: [],
    createdBy: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'engineer' },
    statistics: {
      total: 30,
      passed: 25,
      failed: 2,
      blocked: 1,
      retest: 1,
      skipped: 1,
      na: 0,
      deferred: 0,
      passRate: 83.3,
    },
  },
  {
    id: 'TR-004',
    name: 'Performance Testing Suite',
    status: 'completed',
    environment: 'Staging',
    testCases: [],
    createdBy: { id: '3', name: 'Manager', email: 'manager@example.com', role: 'manager' },
    statistics: {
      total: 20,
      passed: 18,
      failed: 1,
      blocked: 0,
      retest: 1,
      skipped: 0,
      na: 0,
      deferred: 0,
      passRate: 90,
    },
  },
  {
    id: 'TR-005',
    name: 'Security Validation Tests',
    status: 'active',
    environment: 'QA',
    testCases: [],
    createdBy: { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'engineer' },
    statistics: {
      total: 28,
      passed: 24,
      failed: 2,
      blocked: 2,
      retest: 0,
      skipped: 0,
      na: 0,
      deferred: 0,
      passRate: 85.7,
    },
  },
]

export default function CreateTestPlanPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast.success('Test plan created successfully', {
        description: `Plan "${data.name}" has been created.`,
      })

      router.push('/test-plans')
    } catch (error) {
      toast.error('Failed to create test plan', {
        description: 'Please try again later.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const breadcrumbs = [
    { title: 'Test Management', href: '/test-plans' },
    { title: 'Test Plans', href: '/test-plans' },
    { title: 'Create Plan' },
  ]

  return (
    <AppShell
      sidebar={<Sidebar />}
      header={<Header breadcrumbs={breadcrumbs} />}
    >
      <div className="h-full overflow-auto p-6">
        <div className="max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Test Plan</h1>
            <p className="mt-2 text-muted-foreground">
              Define a new test plan for your release or sprint
            </p>
          </div>

          <PlanCreateForm
            linkedRuns={mockTestRuns}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AppShell>
  )
}
