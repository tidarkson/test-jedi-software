'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { TestCaseForm } from '@/components/test-repository'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { useTestRepositoryStore } from '@/lib/store/test-repository-store'
import type { TestCaseItem, TestSuiteNode } from '@/lib/store/test-repository-store'
import type { TestCaseFormData } from '@/components/test-repository/test-case-form'
import { useProjectStore } from '@/lib/store/project-store'
import { ApiError } from '@/lib/api/errors'

function flattenSuiteOptions(suites: TestSuiteNode[], depth = 0): Array<{ id: string; name: string }> {
  return suites.flatMap((suite) => [
    {
      id: suite.id,
      name: `${depth > 0 ? `${'  '.repeat(depth)}- ` : ''}${suite.name}`,
    },
    ...flattenSuiteOptions(suite.children, depth + 1),
  ])
}

function NewTestCasePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const suiteIdFromUrl = searchParams.get('suiteId') ?? undefined
  const { createCaseAction, suites, loadSuites } = useTestRepositoryStore()
  const currentProjectId = useProjectStore((state) => state.currentProjectId)
  const suiteOptions = React.useMemo(() => flattenSuiteOptions(suites), [suites])

  React.useEffect(() => {
    if (!currentProjectId || suites.length > 0) {
      return
    }

    void loadSuites(currentProjectId)
  }, [currentProjectId, loadSuites, suites.length])

  const breadcrumbs = [
    { title: 'Test Management', href: '#' },
    { title: 'Test Repository', href: '/test-repository' },
    { title: 'New Test Case' },
  ]

  const handleSubmit = async (data: TestCaseFormData) => {
    if (!currentProjectId) {
      toast.error('Please select a project before creating a test case')
      return
    }

    try {
      const payload: Partial<TestCaseItem> = {
        ...data,
        suiteId: data.suiteId || suiteIdFromUrl,
        steps: data.steps.map((step, index) => ({
          id: step.id,
          order: index + 1,
          action: step.action,
          expectedResult: step.expectedResult,
        })),
      }

      await createCaseAction(currentProjectId, payload)
      toast.success('Test case created successfully')
      router.push('/test-repository')
    } catch (err) {
      if (err instanceof ApiError && err.errors.length > 0) {
        err.errors.forEach((e) => toast.error(e.message))
      } else {
        toast.error(err instanceof Error ? err.message : 'Failed to create test case')
      }
    }
  }

  const handleCancel = () => {
    router.push('/test-repository')
  }

  if (!currentProjectId) {
    return (
      <AppShell
        sidebar={<Sidebar />}
        header={<Header breadcrumbs={breadcrumbs} />}
      >
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">No project selected</h2>
            <p className="mt-2 text-muted-foreground">
              Select or create a project first, then create test cases.
            </p>
          </div>
        </div>
      </AppShell>
    )
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
            initialData={{ suiteId: suiteIdFromUrl ?? '' }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            suiteOptions={suiteOptions}
          />
        </div>
      </div>
    </AppShell>
  )
}

export default function NewTestCasePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewTestCasePageContent />
    </Suspense>
  )
}
