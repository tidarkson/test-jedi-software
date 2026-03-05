'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout'
import { AnalyticsDashboard } from '@/components/analytics'

export default function ReportsPage() {
  return (
    <PageContainer title="Analytics & Reporting">
      <AnalyticsDashboard />
    </PageContainer>
  )
}

