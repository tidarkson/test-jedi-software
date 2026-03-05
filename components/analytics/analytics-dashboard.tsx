'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAnalyticsStore } from '@/lib/store/analytics-store'
import { DateRangeFilter } from '@/types'
import {
  DateRangePicker,
  ExportModal,
  PassFailTrendChart,
  FailureDistributionChart,
  AutomationCoverageTrendChart,
  SuiteHealthHeatmapChart,
  SuiteHealthScoreTable,
  DefectLeakageTrendChart,
  DefectStatusChart,
  MTTRGauge,
  WorkloadHeatmapChart,
  TesterLeaderboardTable,
  ExecutionVelocityChart,
} from './index'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Download, RefreshCw } from 'lucide-react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface AnalyticsDashboardProps {
  className?: string
}

const MILESTONES = [
  { label: 'All Releases', value: 'all' },
  { label: 'v2.0 (Latest)', value: 'v2.0' },
  { label: 'v1.9', value: 'v1.9' },
  { label: 'v1.8', value: 'v1.8' },
]

const ENVIRONMENTS = [
  { label: 'All Environments', value: 'all' },
  { label: 'Production', value: 'prod' },
  { label: 'Staging', value: 'staging' },
  { label: 'Development', value: 'dev' },
]

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const router = useRouter()
  const {
    data,
    isLoading,
    dateRange,
    selectedMilestone,
    selectedEnvironment,
    setDateRange,
    setMilestone,
    setEnvironment,
    fetchAnalytics,
    refreshData,
  } = useAnalyticsStore()

  const [exportModalOpen, setExportModalOpen] = React.useState(false)

  // Initial data fetch
  React.useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const handleDateRangeChange = (range: DateRangeFilter) => {
    setDateRange(range)
    refreshData()
  }

  // Loading state
  if (isLoading && !data) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (!data) {
    return (
      <div className={cn('space-y-6', className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load analytics data. Please try again or contact support.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Global Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive dashboard for testing metrics and insights
            </p>
          </div>
          <Button
            onClick={() => setExportModalOpen(true)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="milestone" className="text-sm font-medium">
              Milestone
            </label>
            <Select
              value={selectedMilestone || 'all'}
              onValueChange={setMilestone}
            >
              <SelectTrigger id="milestone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MILESTONES.map((milestone) => (
                  <SelectItem key={milestone.value} value={milestone.value}>
                    {milestone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="environment" className="text-sm font-medium">
              Environment
            </label>
            <Select
              value={selectedEnvironment || 'all'}
              onValueChange={setEnvironment}
            >
              <SelectTrigger id="environment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENVIRONMENTS.map((env) => (
                  <SelectItem key={env.value} value={env.value}>
                    {env.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              size="icon"
              onClick={refreshData}
              disabled={isLoading}
              title="Refresh data"
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="quality-trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quality-trends">Quality Trends</TabsTrigger>
          <TabsTrigger value="suite-health">Suite Health</TabsTrigger>
          <TabsTrigger value="defect-analytics">Defect Analytics</TabsTrigger>
          <TabsTrigger value="team-performance">Team Performance</TabsTrigger>
        </TabsList>

        {/* Tab 1: Quality Trends */}
        <TabsContent value="quality-trends" className="space-y-6">
          <div className="grid gap-6">
            <PassFailTrendChart
              data={data.qualityTrends.passFailTrends}
              height={350}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <FailureDistributionChart
                data={data.qualityTrends.failureDistribution}
                height={300}
              />
              <AutomationCoverageTrendChart
                data={data.qualityTrends.automationCoverage}
                height={300}
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Suite Health */}
        <TabsContent value="suite-health" className="space-y-6">
          <div className="grid gap-6">
            <SuiteHealthHeatmapChart
              data={data.suiteHealth.heatmaps}
            />
            <SuiteHealthScoreTable
              data={data.suiteHealth.healthScores}
            />
          </div>
        </TabsContent>

        {/* Tab 3: Defect Analytics */}
        <TabsContent value="defect-analytics" className="space-y-6">
          <div className="grid gap-6">
            <DefectLeakageTrendChart
              data={data.defectAnalytics.leakageTrend}
              height={350}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <DefectStatusChart
                data={data.defectAnalytics.defectStatus}
                height={300}
              />
              <MTTRGauge
                data={data.defectAnalytics.mttr}
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Team Performance */}
        <TabsContent value="team-performance" className="space-y-6">
          <div className="grid gap-6">
            <WorkloadHeatmapChart
              data={data.teamPerformance.workloadHeatmaps}
            />
            <ExecutionVelocityChart
              data={data.teamPerformance.velocity}
              height={350}
            />
            <TesterLeaderboardTable
              data={data.teamPerformance.leaderboard}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
      />
    </div>
  )
}
