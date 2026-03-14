'use client'

import * as React from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Plus, Search, Filter } from 'lucide-react'
import { PlanCard } from '@/components/test-plans'
import { usePlanStore } from '@/lib/store/plan-store'
import { useProjectStore } from '@/lib/store/project-store'
import { toast } from 'sonner'

export default function TestPlansPage() {
  const plans = usePlanStore((state) => state.plans)
  const isLoading = usePlanStore((state) => state.isLoading)
  const error = usePlanStore((state) => state.error)
  const loadPlans = usePlanStore((state) => state.loadPlans)
  const clearError = usePlanStore((state) => state.clearError)

  const currentProjectId = useProjectStore((state) => state.currentProjectId)
  const projects = useProjectStore((state) => state.projects)
  const isProjectsLoading = useProjectStore((state) => state.isLoading)

  const [searchText, setSearchText] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [milestoneFilter, setMilestoneFilter] = React.useState<string>('all')

  React.useEffect(() => {
    if (!currentProjectId) {
      return
    }

    void loadPlans(currentProjectId)
  }, [currentProjectId, loadPlans])

  React.useEffect(() => {
    if (!error) {
      return
    }

    toast.error(error)
    clearError()
  }, [error, clearError])

  const filteredPlans = React.useMemo(() => {
    let filtered = plans

    if (searchText) {
      filtered = filtered.filter(
        (plan) =>
          plan.name.toLowerCase().includes(searchText.toLowerCase()) ||
          plan.description?.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((plan) => plan.status === statusFilter)
    }

    if (milestoneFilter !== 'all') {
      filtered = filtered.filter((plan) => plan.milestone === milestoneFilter)
    }

    return filtered
  }, [plans, searchText, statusFilter, milestoneFilter])

  const breadcrumbs = [
    { title: 'Test Management', href: '#' },
    { title: 'Test Plans' },
  ]

  const uniqueMilestones = Array.from(new Set(plans.filter((p) => p.milestone).map((p) => p.milestone!)))

  const statusCounts = {
    draft: plans.filter((p) => p.status === 'draft').length,
    pending_approval: plans.filter((p) => p.status === 'pending_approval').length,
    approved: plans.filter((p) => p.status === 'approved').length,
    deprecated: plans.filter((p) => p.status === 'deprecated').length,
  }

  if (isProjectsLoading) {
    return (
      <AppShell sidebar={<Sidebar />} header={<Header breadcrumbs={breadcrumbs} />}>
        <div className="h-full overflow-auto p-6">
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">Loading plans...</CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  if (!projects.length || !currentProjectId) {
    return (
      <AppShell sidebar={<Sidebar />} header={<Header breadcrumbs={breadcrumbs} />}>
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">No project selected</h2>
            <p className="mt-2 text-muted-foreground">Create or select a project to view test plans.</p>
            <Button asChild className="mt-4">
              <Link href="/projects">Go to Projects</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell sidebar={<Sidebar />} header={<Header breadcrumbs={breadcrumbs} />}>
      <div className="h-full overflow-auto p-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Test Plans</h1>
              <p className="mt-2 text-muted-foreground">Create and manage test plans for your releases and sprints</p>
            </div>
            <Link href="/test-plans/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
              </Button>
            </Link>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search plans..."
                    className="pl-10"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={milestoneFilter} onValueChange={setMilestoneFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Milestones</SelectItem>
                    {uniqueMilestones.map((milestone) => (
                      <SelectItem key={milestone} value={milestone}>
                        {milestone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Draft', value: statusCounts.draft, color: 'bg-gray-100 text-gray-700' },
              { label: 'Pending Approval', value: statusCounts.pending_approval, color: 'bg-yellow-100 text-yellow-700' },
              { label: 'Approved', value: statusCounts.approved, color: 'bg-green-100 text-green-700' },
              { label: 'Deprecated', value: statusCounts.deprecated, color: 'bg-red-100 text-red-700' },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className={`mt-2 inline-block rounded-full ${stat.color} px-3 py-1`}>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="py-8 text-center text-muted-foreground">Loading test plans...</div>
              </CardContent>
            </Card>
          ) : filteredPlans.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center gap-2 py-8">
                  <Filter className="h-8 w-8 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">
                    {searchText || statusFilter !== 'all' || milestoneFilter !== 'all'
                      ? 'No test plans match your filters'
                      : 'No test plans yet. Create one to get started!'}
                  </p>
                  {searchText === '' && statusFilter === 'all' && milestoneFilter === 'all' && (
                    <Link href="/test-plans/new">
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Plan
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  )
}
