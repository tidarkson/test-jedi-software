'use client'

import * as React from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ExecutionWorkspace } from '@/components/execution'
import { useExecutionStore } from '@/lib/store/execution-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlayCircle, Pause, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ExecutionPage() {
  const { execution } = useExecutionStore()

  const breadcrumbs = [
    { title: 'Test Management', href: '#' },
    { title: 'Test Runs', href: '/test-runs' },
    { title: execution?.name || 'Execution', href: '#' },
  ]

  const statusConfig = {
    not_started: { label: 'Not Started', icon: PlayCircle, className: 'bg-slate-100 text-slate-700' },
    in_progress: { label: 'In Progress', icon: PlayCircle, className: 'bg-blue-100 text-blue-700' },
    paused: { label: 'Paused', icon: Pause, className: 'bg-yellow-100 text-yellow-700' },
    completed: { label: 'Completed', icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
  }

  const status = execution?.status || 'not_started'
  const StatusIcon = statusConfig[status].icon

  return (
    <AppShell
      sidebar={<Sidebar />}
      header={
        <Header breadcrumbs={breadcrumbs}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/test-runs">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Runs
              </Link>
            </Button>
            {execution && (
              <>
                <Badge variant="outline" className={statusConfig[status].className}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {statusConfig[status].label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {execution.environment} • {execution.buildNumber}
                </span>
              </>
            )}
          </div>
        </Header>
      }
    >
      <ExecutionWorkspace className="h-full" />
    </AppShell>
  )
}
