'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout'
import { AnalyticsDashboard } from '@/components/analytics'
import { useAnalyticsStore } from '@/lib/store/analytics-store'
import { useProjectStore } from '@/lib/store/project-store'

export default function ReportsPage() {
  const { currentProjectId } = useProjectStore()
  const { fetchAnalytics, dateRange } = useAnalyticsStore()

  React.useEffect(() => {
    if (!currentProjectId) {
      return
    }

    fetchAnalytics(currentProjectId, dateRange)
  }, [currentProjectId, fetchAnalytics])

  return (
    <PageContainer title="Analytics & Reporting">
      <AnalyticsDashboard projectId={currentProjectId} />
    </PageContainer>
  )
}

