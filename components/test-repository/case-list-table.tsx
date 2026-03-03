'use client'

import * as React from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Move,
  Edit,
  Trash2,
  Archive,
  Copy,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { StatusBadge } from '@/components/ui/status-badge'
import { useTestRepositoryStore, type TestCaseItem } from '@/lib/store/test-repository-store'

type SortKey = 'id' | 'title' | 'priority' | 'type' | 'status' | 'automationStatus' | 'lastRunDate' | 'author'
type SortDirection = 'asc' | 'desc'

interface SortState {
  key: SortKey
  direction: SortDirection
}

const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
const priorityStyles: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' },
  high: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  medium: { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' },
  low: { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' },
}

const automationStyles: Record<string, { bg: string; text: string; border: string }> = {
  automated: { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' },
  manual: { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' },
  'to-automate': { bg: '#E0E7FF', text: '#4338CA', border: '#C7D2FE' },
}

const typeLabels: Record<string, string> = {
  functional: 'Functional',
  regression: 'Regression',
  smoke: 'Smoke',
  integration: 'Integration',
  e2e: 'E2E',
  performance: 'Performance',
}

export function CaseListTable() {
  const {
    selectedCaseIds,
    toggleCaseSelection,
    selectAllCases,
    clearCaseSelection,
    setActiveCase,
    getFilteredCases,
  } = useTestRepositoryStore()

  const [sort, setSort] = React.useState<SortState>({ key: 'id', direction: 'asc' })
  const filteredCases = getFilteredCases()

  // Sort cases
  const sortedCases = React.useMemo(() => {
    return [...filteredCases].sort((a, b) => {
      const direction = sort.direction === 'asc' ? 1 : -1
      
      switch (sort.key) {
        case 'id':
          return direction * a.id.localeCompare(b.id)
        case 'title':
          return direction * a.title.localeCompare(b.title)
        case 'priority':
          return direction * (priorityOrder[a.priority] - priorityOrder[b.priority])
        case 'type':
          return direction * a.type.localeCompare(b.type)
        case 'status':
          return direction * a.status.localeCompare(b.status)
        case 'automationStatus':
          return direction * a.automationStatus.localeCompare(b.automationStatus)
        case 'lastRunDate':
          const dateA = a.lastRunDate ? new Date(a.lastRunDate).getTime() : 0
          const dateB = b.lastRunDate ? new Date(b.lastRunDate).getTime() : 0
          return direction * (dateA - dateB)
        case 'author':
          return direction * a.author.localeCompare(b.author)
        default:
          return 0
      }
    })
  }, [filteredCases, sort])

  const handleSort = (key: SortKey) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const handleSelectAll = () => {
    if (selectedCaseIds.size === filteredCases.length) {
      clearCaseSelection()
    } else {
      selectAllCases()
    }
  }

  const handleRowClick = (testCase: TestCaseItem) => {
    setActiveCase(testCase.id)
  }

  const isAllSelected = filteredCases.length > 0 && selectedCaseIds.size === filteredCases.length
  const isSomeSelected = selectedCaseIds.size > 0 && selectedCaseIds.size < filteredCases.length

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => {
    const isActive = sort.key === sortKey
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 -ml-3 px-2 gap-1 font-medium"
        onClick={() => handleSort(sortKey)}
      >
        {label}
        {isActive ? (
          sort.direction === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
        )}
      </Button>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Bulk action toolbar */}
      {selectedCaseIds.size > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 border-b">
          <span className="text-sm text-muted-foreground">
            {selectedCaseIds.size} selected
          </span>
          <div className="h-4 w-px bg-border" />
          <Button variant="outline" size="sm" className="h-7 gap-1.5">
            <Move className="h-3.5 w-3.5" />
            Move
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1.5">
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1.5">
            <Archive className="h-3.5 w-3.5" />
            Archive
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7"
            onClick={clearCaseSelection}
          >
            Clear selection
          </Button>
        </div>
      )}

      {/* Table */}
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={isAllSelected}
                  ref={(ref) => {
                    if (ref) {
                      (ref as HTMLInputElement).indeterminate = isSomeSelected
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-28">
                <SortableHeader label="ID" sortKey="id" />
              </TableHead>
              <TableHead className="min-w-[250px]">
                <SortableHeader label="Title" sortKey="title" />
              </TableHead>
              <TableHead className="w-24">
                <SortableHeader label="Priority" sortKey="priority" />
              </TableHead>
              <TableHead className="w-28">
                <SortableHeader label="Type" sortKey="type" />
              </TableHead>
              <TableHead className="w-24">
                <SortableHeader label="Status" sortKey="status" />
              </TableHead>
              <TableHead className="w-28">
                <SortableHeader label="Automation" sortKey="automationStatus" />
              </TableHead>
              <TableHead className="w-28">
                <SortableHeader label="Last Run" sortKey="lastRunDate" />
              </TableHead>
              <TableHead className="w-28">
                <SortableHeader label="Author" sortKey="author" />
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  No test cases found
                </TableCell>
              </TableRow>
            ) : (
              sortedCases.map((testCase) => {
                const isSelected = selectedCaseIds.has(testCase.id)
                return (
                  <TableRow
                    key={testCase.id}
                    className={cn(
                      'cursor-pointer',
                      isSelected && 'bg-muted/50'
                    )}
                    onClick={() => handleRowClick(testCase)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleCaseSelection(testCase.id)}
                        aria-label={`Select ${testCase.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {testCase.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm truncate max-w-[300px]">
                          {testCase.title}
                        </span>
                        {testCase.tags.length > 0 && (
                          <div className="flex gap-1">
                            {testCase.tags.slice(0, 2).map(tag => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="h-4 px-1 text-[10px] font-normal"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {testCase.tags.length > 2 && (
                              <Badge
                                variant="outline"
                                className="h-4 px-1 text-[10px] font-normal"
                              >
                                +{testCase.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium capitalize"
                        style={{
                          backgroundColor: priorityStyles[testCase.priority].bg,
                          color: priorityStyles[testCase.priority].text,
                          borderColor: priorityStyles[testCase.priority].border,
                        }}
                      >
                        {testCase.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {typeLabels[testCase.type]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={testCase.status} size="sm" />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium capitalize"
                        style={{
                          backgroundColor: automationStyles[testCase.automationStatus].bg,
                          color: automationStyles[testCase.automationStatus].text,
                          borderColor: automationStyles[testCase.automationStatus].border,
                        }}
                      >
                        {testCase.automationStatus === 'to-automate' ? 'To Automate' : testCase.automationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {testCase.lastRunDate ? (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(testCase.lastRunDate), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground truncate max-w-[100px] block">
                        {testCase.author}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => setActiveCase(testCase.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" />
                            Run Test
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Clone
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Move className="mr-2 h-4 w-4" />
                            Move
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
