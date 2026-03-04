'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useExecutionStore } from '@/lib/store/execution-store'
import type { ExecutionCase } from '@/types/execution'
import type { TestStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  SkipForward,
  Ban,
  RefreshCw,
  HelpCircle,
} from 'lucide-react'

const statusConfig: Record<TestStatus | 'pending', { 
  label: string
  icon: React.ElementType
  color: string
  bgColor: string
}> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-slate-500', bgColor: 'bg-slate-100' },
  passed: { label: 'Passed', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  blocked: { label: 'Blocked', icon: Ban, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  retest: { label: 'Retest', icon: RefreshCw, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  skipped: { label: 'Skipped', icon: SkipForward, color: 'text-gray-500', bgColor: 'bg-gray-100' },
  na: { label: 'N/A', icon: HelpCircle, color: 'text-gray-400', bgColor: 'bg-gray-50' },
  deferred: { label: 'Deferred', icon: AlertCircle, color: 'text-purple-600', bgColor: 'bg-purple-100' },
}

const priorityConfig = {
  critical: { label: 'Critical', color: 'bg-red-500' },
  high: { label: 'High', color: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'bg-yellow-500' },
  low: { label: 'Low', color: 'bg-green-500' },
}

interface CaseQueueProps {
  className?: string
}

export function CaseQueue({ className }: CaseQueueProps) {
  const {
    execution,
    selectedCaseId,
    selectCase,
    filter,
    setFilter,
    clearFilter,
    getFilteredCases,
  } = useExecutionStore()

  const [searchTerm, setSearchTerm] = React.useState('')
  const filteredCases = getFilteredCases()

  // Filter by search term
  const displayedCases = React.useMemo(() => {
    if (!searchTerm) return filteredCases
    const term = searchTerm.toLowerCase()
    return filteredCases.filter(
      (c) =>
        c.caseTitle.toLowerCase().includes(term) ||
        c.caseId.toLowerCase().includes(term)
    )
  }, [filteredCases, searchTerm])

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const currentIndex = displayedCases.findIndex((c) => c.id === selectedCaseId)
        if (e.key === 'ArrowDown' && currentIndex < displayedCases.length - 1) {
          selectCase(displayedCases[currentIndex + 1].id)
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
          selectCase(displayedCases[currentIndex - 1].id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [displayedCases, selectedCaseId, selectCase])

  if (!execution) return null

  const stats = execution.statistics

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Progress Bar */}
      <div className="border-b p-3">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span className="text-muted-foreground">
            {stats.total - stats.pending} / {stats.total} completed
          </span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-muted">
          {stats.passed > 0 && (
            <div
              className="bg-green-500 transition-all"
              style={{ width: `${(stats.passed / stats.total) * 100}%` }}
            />
          )}
          {stats.failed > 0 && (
            <div
              className="bg-red-500 transition-all"
              style={{ width: `${(stats.failed / stats.total) * 100}%` }}
            />
          )}
          {stats.blocked > 0 && (
            <div
              className="bg-orange-500 transition-all"
              style={{ width: `${(stats.blocked / stats.total) * 100}%` }}
            />
          )}
          {stats.retest > 0 && (
            <div
              className="bg-blue-500 transition-all"
              style={{ width: `${(stats.retest / stats.total) * 100}%` }}
            />
          )}
          {stats.skipped > 0 && (
            <div
              className="bg-gray-400 transition-all"
              style={{ width: `${(stats.skipped / stats.total) * 100}%` }}
            />
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {stats.passed} Passed
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {stats.failed} Failed
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            {stats.blocked} Blocked
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            {stats.pending} Pending
          </span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-2 border-b p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filter.status?.join(',') || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                setFilter({ ...filter, status: undefined })
              } else {
                setFilter({ ...filter, status: value.split(',') as (TestStatus | 'pending')[] })
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <Filter className="mr-1 h-3 w-3" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filter.priority?.join(',') || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                setFilter({ ...filter, priority: undefined })
              } else {
                setFilter({ ...filter, priority: value.split(',') as ('critical' | 'high' | 'medium' | 'low')[] })
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          {(filter.status || filter.priority || filter.assignee) && (
            <Button variant="ghost" size="sm" onClick={clearFilter} className="h-8 px-2 text-xs">
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Case List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-2">
          {displayedCases.map((caseItem) => (
            <CaseRow
              key={caseItem.id}
              caseItem={caseItem}
              isSelected={caseItem.id === selectedCaseId}
              onClick={() => selectCase(caseItem.id)}
            />
          ))}
          {displayedCases.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No cases match your filters
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface CaseRowProps {
  caseItem: ExecutionCase
  isSelected: boolean
  onClick: () => void
}

function CaseRow({ caseItem, isSelected, onClick }: CaseRowProps) {
  const statusInfo = statusConfig[caseItem.status]
  const StatusIcon = statusInfo.icon
  const priorityInfo = priorityConfig[caseItem.priority]

  return (
    <button
      onClick={onClick}
      className={cn(
        'mb-1 w-full rounded-md border p-3 text-left transition-colors',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-transparent hover:border-border hover:bg-muted/50'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5 rounded-full p-1', statusInfo.bgColor)}>
          <StatusIcon className={cn('h-3 w-3', statusInfo.color)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {caseItem.caseId}
            </span>
            <span
              className={cn('h-1.5 w-1.5 rounded-full', priorityInfo.color)}
              title={priorityInfo.label}
            />
          </div>
          <p className="truncate text-sm font-medium">{caseItem.caseTitle}</p>
          <p className="truncate text-xs text-muted-foreground">
            {caseItem.suiteName}
          </p>
        </div>
        {caseItem.assignee && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={caseItem.assignee.avatar} />
            <AvatarFallback className="text-xs">
              {caseItem.assignee.name.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </button>
  )
}
