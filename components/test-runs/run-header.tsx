'use client'

import * as React from 'react'
import { format, isPast } from 'date-fns'
import { cn } from '@/lib/utils'
import { RunStatus, RunDashboardData } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Edit, Copy, XCircle, Download, MoreVertical, Calendar, AlertCircle } from 'lucide-react'

interface RunHeaderProps {
  run: RunDashboardData
  onEdit?: () => void
  onClone?: () => void
  onCloseRun?: () => void
  onExport?: () => void
  className?: string
}

export function RunHeader({
  run,
  onEdit,
  onClone,
  onCloseRun,
  onExport,
  className,
}: RunHeaderProps) {
  const [showCloseDialog, setShowCloseDialog] = React.useState(false)
  const [isClosing, setIsClosing] = React.useState(false)

  const getStatusColor = (status: RunStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      case 'in_progress':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-200'
      case 'closed':
        return 'bg-green-100 text-green-700 hover:bg-green-200'
      case 'paused':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: RunStatus) => {
    return status.split('_').map((s) => s.toUpperCase()).join(' ')
  }

  const isOverdue = run.dueDate && isPast(run.dueDate) && run.status !== 'closed'

  const handleExport = () => {
    if (onExport) {
      onExport()
    } else {
      // Default export behavior
      const data = JSON.stringify(run, null, 2)
      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data))
      element.setAttribute('download', `run-${run.id}-export.json`)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  const handleClone = () => {
    if (onClone) {
      onClone()
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{run.title}</h1>
            {run.description && (
              <p className="mt-1 text-base text-muted-foreground">{run.description}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Environment:</span>
              <Badge variant="outline" className="font-mono">
                {run.environment}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Build:</span>
              <Badge variant="outline" className="font-mono">
                {run.buildNumber}
              </Badge>
            </div>

            {run.branch && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Branch:</span>
                <Badge variant="outline" className="font-mono">
                  {run.branch}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn(
            'text-sm font-semibold px-3 py-1.5 whitespace-nowrap',
            getStatusColor(run.status)
          )}
        >
          {getStatusLabel(run.status)}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
        <div className="flex items-center gap-4">
          {run.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  {format(run.dueDate, 'MMM d, yyyy')}
                </span>
                {isOverdue && (
                  <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                    <AlertCircle className="h-3 w-3" />
                    Overdue
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Started: <span className="font-medium">{format(run.createdAt, 'MMM d, yyyy HH:mm')}</span>
          </div>

          {run.updatedAt && (
            <div className="text-sm text-muted-foreground">
              Last updated: <span className="font-medium">{format(run.updatedAt, 'HH:mm:ss')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.()}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleClone} className="gap-2">
                <Copy className="h-4 w-4" />
                Clone Run
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Export Run
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {run.status !== 'closed' && (
                <DropdownMenuItem
                  onClick={() => setShowCloseDialog(true)}
                  className="gap-2 text-destructive"
                >
                  <XCircle className="h-4 w-4" />
                  Close Run
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Test Run?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this test run? This action cannot be undone.
              All incomplete test cases will be marked as skipped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!onCloseRun) {
                  setShowCloseDialog(false)
                  return
                }

                setIsClosing(true)
                try {
                  await Promise.resolve(onCloseRun())
                } finally {
                  setIsClosing(false)
                }
                setShowCloseDialog(false)
              }}
              disabled={isClosing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClosing ? 'Closing...' : 'Close Run'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
