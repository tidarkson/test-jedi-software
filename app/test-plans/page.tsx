'use client'

import * as React from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, Filter } from 'lucide-react'
import { PlanCard } from '@/components/test-plans'
import { TestPlan, TestRun } from '@/types'

// Mock test runs data
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
]

// Mock test plans data
const mockTestPlans: TestPlan[] = [
  {
    id: 'TP-001',
    name: 'Release v2.5 Validation Plan',
    description:
      'Comprehensive testing plan for the 2.5 release covering all new features and regression scenarios.',
    version: 3,
    status: 'approved',
    milestone: 'Release v2.5',
    linkedRuns: [mockTestRuns[0], mockTestRuns[1]],
    tags: ['release', 'regression', 'critical'],
    readinessScore: 88,
    readinessMetrics: {
      passRateWeight: 0.5,
      passRateScore: 90,
      completionWeight: 0.3,
      completionScore: 95,
      defectWeight: 0.2,
      defectPenalty: 5,
      overallScore: 88,
    },
    passRate: 89.5,
    completionRate: 95,
    openDefects: 3,
    totalCases: 87,
    versions: [
      {
        id: 'v1',
        version: 1,
        createdAt: new Date('2026-02-15'),
        createdBy: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'engineer' },
      },
      {
        id: 'v2',
        version: 2,
        createdAt: new Date('2026-02-20'),
        createdBy: { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'engineer' },
      },
      {
        id: 'v3',
        version: 3,
        createdAt: new Date('2026-02-28'),
        createdBy: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'engineer' },
      },
    ],
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date('2026-02-28'),
    createdBy: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'engineer' },
    approvedBy: { id: '3', name: 'Manager', email: 'manager@example.com', role: 'manager' },
  },
  {
    id: 'TP-002',
    name: 'Hotfix v2.4.1 Test Plan',
    description: 'Quick validation plan for the hotfix release covering critical bug fixes.',
    version: 1,
    status: 'approved',
    milestone: 'Hotfix v2.4.1',
    linkedRuns: [mockTestRuns[1]],
    tags: ['hotfix', 'urgent'],
    readinessScore: 92,
    readinessMetrics: {
      passRateWeight: 0.5,
      passRateScore: 93,
      completionWeight: 0.3,
      completionScore: 100,
      defectWeight: 0.2,
      defectPenalty: 0,
      overallScore: 92,
    },
    passRate: 91.7,
    completionRate: 100,
    openDefects: 0,
    totalCases: 12,
    versions: [
      {
        id: 'v1',
        version: 1,
        createdAt: new Date('2026-03-01'),
        createdBy: { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'engineer' },
      },
    ],
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-01'),
    createdBy: { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'engineer' },
    approvedBy: { id: '3', name: 'Manager', email: 'manager@example.com', role: 'manager' },
  },
  {
    id: 'TP-003',
    name: 'Sprint 23 Integration Testing Plan',
    description: 'Testing plan for Sprint 23 features with focus on API integrations.',
    version: 2,
    status: 'pending_approval',
    milestone: 'Sprint 23',
    linkedRuns: [mockTestRuns[2]],
    tags: ['sprint', 'integration'],
    readinessScore: 72,
    readinessMetrics: {
      passRateWeight: 0.5,
      passRateScore: 83,
      completionWeight: 0.3,
      completionScore: 80,
      defectWeight: 0.2,
      defectPenalty: 8,
      overallScore: 72,
    },
    passRate: 83.3,
    completionRate: 80,
    openDefects: 4,
    totalCases: 30,
    versions: [
      {
        id: 'v1',
        version: 1,
        createdAt: new Date('2026-02-25'),
        createdBy: { id: '3', name: 'Manager', email: 'manager@example.com', role: 'manager' },
      },
      {
        id: 'v2',
        version: 2,
        createdAt: new Date('2026-03-02'),
        createdBy: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'engineer' },
      },
    ],
    createdAt: new Date('2026-02-25'),
    updatedAt: new Date('2026-03-02'),
    createdBy: { id: '3', name: 'Manager', email: 'manager@example.com', role: 'manager' },
  },
  {
    id: 'TP-004',
    name: 'v2.3 Post-Release Monitoring',
    description: 'Monitoring and validation plan for the v2.3 release post-deployment.',
    version: 1,
    status: 'deprecated',
    milestone: 'Release v2.3',
    linkedRuns: [],
    tags: ['monitoring', 'deprecated'],
    readinessScore: 45,
    readinessMetrics: {
      passRateWeight: 0.5,
      passRateScore: 65,
      completionWeight: 0.3,
      completionScore: 40,
      defectWeight: 0.2,
      defectPenalty: 15,
      overallScore: 45,
    },
    passRate: 65,
    completionRate: 40,
    openDefects: 8,
    totalCases: 25,
    versions: [
      {
        id: 'v1',
        version: 1,
        createdAt: new Date('2026-01-20'),
        createdBy: { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'engineer' },
      },
    ],
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-20'),
    createdBy: { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'engineer' },
  },
]

export default function TestPlansPage() {
  const [plans, setPlans] = React.useState<TestPlan[]>(mockTestPlans)
  const [filteredPlans, setFilteredPlans] = React.useState<TestPlan[]>(mockTestPlans)
  const [searchText, setSearchText] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [milestoneFilter, setMilestoneFilter] = React.useState<string>('all')

  React.useEffect(() => {
    let filtered = plans

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (plan) =>
          plan.name.toLowerCase().includes(searchText.toLowerCase()) ||
          plan.description?.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((plan) => plan.status === statusFilter)
    }

    // Milestone filter
    if (milestoneFilter !== 'all') {
      filtered = filtered.filter((plan) => plan.milestone === milestoneFilter)
    }

    setFilteredPlans(filtered)
  }, [plans, searchText, statusFilter, milestoneFilter])

  const breadcrumbs = [
    { title: 'Test Management', href: '#' },
    { title: 'Test Plans' },
  ]

  const uniqueMilestones = Array.from(
    new Set(plans.filter((p) => p.milestone).map((p) => p.milestone!))
  )

  const statusCounts = {
    draft: plans.filter((p) => p.status === 'draft').length,
    pending_approval: plans.filter((p) => p.status === 'pending_approval').length,
    approved: plans.filter((p) => p.status === 'approved').length,
    deprecated: plans.filter((p) => p.status === 'deprecated').length,
  }

  return (
    <AppShell
      sidebar={<Sidebar />}
      header={<Header breadcrumbs={breadcrumbs} />}
    >
      <div className="h-full overflow-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Test Plans</h1>
              <p className="mt-2 text-muted-foreground">
                Create and manage test plans for your releases and sprints
              </p>
            </div>
            <Link href="/test-plans/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
              </Button>
            </Link>
          </div>

          {/* Filters */}
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

          {/* Status Summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Draft', value: statusCounts.draft, color: 'bg-gray-100 text-gray-700' },
              {
                label: 'Pending Approval',
                value: statusCounts.pending_approval,
                color: 'bg-yellow-100 text-yellow-700',
              },
              { label: 'Approved', value: statusCounts.approved, color: 'bg-green-100 text-green-700' },
              {
                label: 'Deprecated',
                value: statusCounts.deprecated,
                color: 'bg-red-100 text-red-700',
              },
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

          {/* Plans Grid */}
          {filteredPlans.length > 0 ? (
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
