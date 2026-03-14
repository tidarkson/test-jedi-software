'use client'

import * as React from 'react'
import {
  Download,
  Filter,
  ChevronRight,
  User,
  FileEdit,
  Trash2,
  Archive,
  RotateCcw,
  UserPlus,
  UserMinus,
  LogIn,
  LogOut,
  Plus,
} from 'lucide-react'
import type { AuditLogEntry, AuditAction, AuditEntityType } from '@/types/admin'
import { exportAuditLogsCsv } from '@/lib/api/admin'
import { useAdminStore } from '@/lib/store/admin-store'
import { useAuthStore } from '@/lib/store/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from 'sonner'

const actionIcons: Record<AuditAction, React.ElementType> = {
  create: Plus,
  update: FileEdit,
  delete: Trash2,
  archive: Archive,
  restore: RotateCcw,
  assign: UserPlus,
  unassign: UserMinus,
  invite: UserPlus,
  remove: UserMinus,
  login: LogIn,
  logout: LogOut,
}

const actionColors: Record<AuditAction, string> = {
  create: 'bg-green-100 text-green-700 border-green-200',
  update: 'bg-blue-100 text-blue-700 border-blue-200',
  delete: 'bg-red-100 text-red-700 border-red-200',
  archive: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  restore: 'bg-purple-100 text-purple-700 border-purple-200',
  assign: 'bg-teal-100 text-teal-700 border-teal-200',
  unassign: 'bg-orange-100 text-orange-700 border-orange-200',
  invite: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  remove: 'bg-red-100 text-red-700 border-red-200',
  login: 'bg-gray-100 text-gray-700 border-gray-200',
  logout: 'bg-gray-100 text-gray-700 border-gray-200',
}

const entityTypeLabels: Record<AuditEntityType, string> = {
  test_case: 'Test Case',
  test_suite: 'Test Suite',
  test_run: 'Test Run',
  project: 'Project',
  user: 'User',
  custom_field: 'Custom Field',
  integration: 'Integration',
  settings: 'Settings',
}

interface AuditLogTableProps {
  entries?: AuditLogEntry[]
}

interface DiffViewerProps {
  before: Record<string, unknown>
  after: Record<string, unknown>
}

function DiffViewer({ before, after }: DiffViewerProps) {
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)])

  return (
    <div className="space-y-3">
      {Array.from(allKeys).map((key) => {
        const beforeValue = before[key]
        const afterValue = after[key]
        const hasChanged = JSON.stringify(beforeValue) !== JSON.stringify(afterValue)

        if (!hasChanged && beforeValue === undefined && afterValue === undefined) return null

        return (
          <div key={key} className="rounded-md border p-3">
            <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              {key.replace(/_/g, ' ')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[10px] font-medium text-red-600">BEFORE</div>
                <div className={cn(
                  'rounded bg-red-50 p-2 font-mono text-xs',
                  beforeValue === undefined && 'italic text-muted-foreground'
                )}>
                  {beforeValue !== undefined ? JSON.stringify(beforeValue, null, 2) : '(not set)'}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[10px] font-medium text-green-600">AFTER</div>
                <div className={cn(
                  'rounded bg-green-50 p-2 font-mono text-xs',
                  afterValue === undefined && 'italic text-muted-foreground'
                )}>
                  {afterValue !== undefined ? JSON.stringify(afterValue, null, 2) : '(removed)'}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function AuditLogTable({ entries = [] }: AuditLogTableProps) {
  const user = useAuthStore((state) => state.user)
  const { auditLog, loadAuditLog, isAuditLogLoading, error } = useAdminStore()

  const [selectedEntry, setSelectedEntry] = React.useState<AuditLogEntry | null>(null)
  const [filters, setFilters] = React.useState({
    userId: '',
    entityType: '',
    action: '',
    dateFrom: '',
    dateTo: '',
  })
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)

  const orgId = user?.organizationId || ''

  const tableEntries = React.useMemo(() => {
    return entries.length > 0 ? entries : auditLog
  }, [auditLog, entries])

  const fetchAuditLog = React.useCallback(async () => {
    if (!orgId) {
      return
    }

    await loadAuditLog(orgId, {
      userId: filters.userId || undefined,
      entityType: (filters.entityType as AuditEntityType) || undefined,
      action: (filters.action as AuditAction) || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    })
  }, [filters.action, filters.dateFrom, filters.dateTo, filters.entityType, filters.userId, loadAuditLog, orgId])

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchAuditLog().catch((apiError) => {
        toast.error(apiError.message ?? 'Failed to load audit log')
      })
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [fetchAuditLog])

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleExportCSV = async () => {
    if (!orgId) {
      toast.error('Missing organization context')
      return
    }

    try {
      setIsExporting(true)
      const csvBlob = await exportAuditLogsCsv(orgId, {
        userId: filters.userId || undefined,
        entityType: (filters.entityType as AuditEntityType) || undefined,
        action: (filters.action as AuditAction) || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      })

      const url = URL.createObjectURL(csvBlob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)

      toast.success('Audit log exported')
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : 'Failed to export CSV'
      toast.error(message)
    } finally {
      setIsExporting(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      userId: '',
      entityType: '',
      action: '',
      dateFrom: '',
      dateTo: '',
    })
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      !
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filter Audit Log</h4>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="filter-user">User ID</Label>
                      <Input
                        id="filter-user"
                        placeholder="Filter by user ID..."
                        value={filters.userId}
                        onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Entity Type</Label>
                      <Select
                        value={filters.entityType}
                        onValueChange={(value) => setFilters({ ...filters, entityType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All types</SelectItem>
                          {Object.entries(entityTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Action</Label>
                      <Select
                        value={filters.action}
                        onValueChange={(value) => setFilters({ ...filters, action: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All actions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All actions</SelectItem>
                          {Object.keys(actionColors).map((action) => (
                            <SelectItem key={action} value={action} className="capitalize">
                              {action}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="filter-from">From</Label>
                        <Input
                          id="filter-from"
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="filter-to">To</Label>
                        <Input
                          id="filter-to"
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <span className="text-sm text-muted-foreground">
              {tableEntries.length} {tableEntries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <Button variant="outline" onClick={() => void handleExportCSV()} disabled={isExporting}>
            {isExporting ? <Spinner className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Timestamp</TableHead>
                <TableHead className="w-[150px]">User</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
                <TableHead className="w-[120px]">Entity Type</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAuditLogLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Spinner className="h-4 w-4" />
                      Loading audit log...
                    </div>
                  </TableCell>
                </TableRow>
              ) : tableEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No audit log entries found
                  </TableCell>
                </TableRow>
              ) : (
                tableEntries.map((entry) => {
                  const ActionIcon = actionIcons[entry.action]
                  return (
                    <TableRow
                      key={entry.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <TableCell className="text-sm text-muted-foreground">
                        {formatRelativeTime(entry.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{entry.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('capitalize', actionColors[entry.action])}>
                          <ActionIcon className="mr-1 h-3 w-3" />
                          {entry.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {entityTypeLabels[entry.entityType]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{entry.entityName || entry.entityId}</span>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          {selectedEntry && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('capitalize', actionColors[selectedEntry.action])}>
                    {selectedEntry.action}
                  </Badge>
                  {entityTypeLabels[selectedEntry.entityType]}
                </SheetTitle>
                <SheetDescription>
                  {selectedEntry.entityName || selectedEntry.entityId}
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">User</div>
                    <div className="font-medium">{selectedEntry.userName}</div>
                    <div className="text-xs text-muted-foreground">{selectedEntry.userEmail}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Timestamp</div>
                    <div className="font-medium">
                      {selectedEntry.timestamp.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Entity ID</div>
                    <div className="font-mono text-xs">{selectedEntry.entityId}</div>
                  </div>
                  {selectedEntry.ipAddress && (
                    <div>
                      <div className="text-muted-foreground">IP Address</div>
                      <div className="font-mono text-xs">{selectedEntry.ipAddress}</div>
                    </div>
                  )}
                </div>

                {selectedEntry.changes && (
                  <div>
                    <h4 className="mb-3 font-medium">Changes</h4>
                    <DiffViewer
                      before={selectedEntry.changes.before}
                      after={selectedEntry.changes.after}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
