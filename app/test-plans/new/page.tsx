'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { PlanCreateForm } from '@/components/test-plans'
import { toast } from 'sonner'
import { useProjectStore } from '@/lib/store/project-store'
import { usePlanStore } from '@/lib/store/plan-store'
import { getRuns } from '@/lib/api/runs'
import type { TestRun } from '@/types'

function mapRunForPicker(run: Awaited<ReturnType<typeof getRuns>>[number]): TestRun {
  return {
    id: run.id,
    name: run.name,
    status: run.status === 'OPEN' || run.status === 'IN_PROGRESS' ? 'active' : run.status === 'CLOSED' || run.status === 'COMPLETED' ? 'completed' : 'archived',
    environment: run.environment,
    testCases: [],
    createdBy: {
      id: 'system',
      name: 'System',
      email: 'system@test-jedi.local',
      role: 'manager',
    },
    statistics: {
      total: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      retest: 0,
      skipped: 0,
      na: 0,
      deferred: 0,
      passRate: 0,
    },
  }
}

export default function CreateTestPlanPage() {
  const router = useRouter()
  const currentProjectId = useProjectStore((state) => state.currentProjectId)
  const projects = useProjectStore((state) => state.projects)
  const createPlan = usePlanStore((state) => state.createPlan)
  const isLoading = usePlanStore((state) => state.isLoading)

  const [linkedRuns, setLinkedRuns] = React.useState<TestRun[]>([])

  React.useEffect(() => {
    async function loadRuns() {
      if (!currentProjectId) {
        setLinkedRuns([])
        return
      }

      try {
        const runs = await getRuns(currentProjectId)
        setLinkedRuns(runs.map(mapRunForPicker))
      } catch {
        setLinkedRuns([])
      }
    }

    void loadRuns()
  }, [currentProjectId])

  const handleSubmit = async (data: {
    name: string
    description?: string
    milestone?: string
    linkedRuns?: TestRun[]
  }) => {
    if (!currentProjectId) {
      toast.error('Please select a project before creating a plan')
      return
    }

    try {
      await createPlan(currentProjectId, {
        name: data.name,
        description: data.description,
        runIds: (data.linkedRuns ?? []).map((run) => run.id),
      })

      toast.success('Test plan created successfully', {
        description: `Plan "${data.name}" has been created.`,
      })

      router.push('/test-plans')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create test plan')
    }
  }

  const breadcrumbs = [
    { title: 'Test Management', href: '/test-plans' },
    { title: 'Test Plans', href: '/test-plans' },
    { title: 'Create Plan' },
  ]

  if (!projects.length || !currentProjectId) {
    return (
      <AppShell sidebar={<Sidebar />} header={<Header breadcrumbs={breadcrumbs} />}>
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">No project selected</h2>
            <p className="mt-2 text-muted-foreground">Select or create a project before creating a test plan.</p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell sidebar={<Sidebar />} header={<Header breadcrumbs={breadcrumbs} />}>
      <div className="h-full overflow-auto p-6">
        <div className="max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Test Plan</h1>
            <p className="mt-2 text-muted-foreground">Define a new test plan for your release or sprint</p>
          </div>

          <PlanCreateForm linkedRuns={linkedRuns} onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </AppShell>
  )
}
