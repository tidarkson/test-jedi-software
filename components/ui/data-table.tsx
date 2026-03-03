'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface DataTableColumn<T> {
  key: keyof T | string
  title: string
  width?: number | string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T, index: number) => React.ReactNode
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  keyField: keyof T
  loading?: boolean
  selectable?: boolean
  selectedRows?: T[]
  onRowClick?: (row: T) => void
  onSelectionChange?: (selectedRows: T[]) => void
  emptyMessage?: string
  density?: 'compact' | 'default' | 'comfortable'
  striped?: boolean
  stickyHeader?: boolean
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
    pageSizeOptions?: number[]
  }
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField,
  loading = false,
  selectable = false,
  selectedRows = [],
  onRowClick,
  onSelectionChange,
  emptyMessage = 'No data available',
  density = 'default',
  striped = false,
  stickyHeader = false,
  sortColumn,
  sortDirection,
  onSort,
  pagination,
}: DataTableProps<T>) {
  const selectedKeys = new Set(selectedRows.map((row) => row[keyField]))
  const allSelected = data.length > 0 && data.every((row) => selectedKeys.has(row[keyField]))
  const someSelected = data.some((row) => selectedKeys.has(row[keyField])) && !allSelected

  const handleSelectAll = () => {
    if (!onSelectionChange) return
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange([...data])
    }
  }

  const handleSelectRow = (row: T) => {
    if (!onSelectionChange) return
    const key = row[keyField]
    if (selectedKeys.has(key)) {
      onSelectionChange(selectedRows.filter((r) => r[keyField] !== key))
    } else {
      onSelectionChange([...selectedRows, row])
    }
  }

  const handleSort = (column: string) => {
    if (!onSort) return
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(column, newDirection)
  }

  const rowHeight = {
    compact: 'h-8',
    default: 'h-10',
    comfortable: 'h-12',
  }

  const getValue = (row: T, key: string): unknown => {
    const keys = key.split('.')
    let value: unknown = row
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k]
    }
    return value
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1

  return (
    <div className="flex flex-col gap-4">
      {/* Table */}
      <div className="overflow-auto rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <thead
            className={cn(
              'bg-neutral-50 dark:bg-neutral-100',
              stickyHeader && 'sticky top-0 z-10'
            )}
          >
            <tr>
              {selectable && (
                <th className="w-10 border-b border-border px-3 py-2">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el) {
                        ;(el as unknown as HTMLInputElement).indeterminate = someSelected
                      }
                    }}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'border-b border-border px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  style={{ width: column.width }}
                >
                  {column.sortable && onSort ? (
                    <button
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() => handleSort(String(column.key))}
                    >
                      {column.title}
                      {sortColumn === String(column.key) ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-50" />
                      )}
                    </button>
                  ) : (
                    column.title
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-12 text-center"
                >
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-12 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const isSelected = selectedKeys.has(row[keyField])
                return (
                  <tr
                    key={String(row[keyField])}
                    className={cn(
                      rowHeight[density],
                      'transition-colors',
                      isSelected && 'bg-primary-50 dark:bg-primary-100',
                      !isSelected && striped && rowIndex % 2 === 1 && 'bg-neutral-50 dark:bg-neutral-100',
                      !isSelected && 'hover:bg-neutral-50 dark:hover:bg-neutral-100',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td
                        className="border-b border-border px-3 py-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectRow(row)}
                          aria-label={`Select row ${rowIndex + 1}`}
                        />
                      </td>
                    )}
                    {columns.map((column) => {
                      const value = getValue(row, String(column.key))
                      return (
                        <td
                          key={String(column.key)}
                          className={cn(
                            'border-b border-border px-3 py-2',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                        >
                          {column.render
                            ? column.render(value, row, rowIndex)
                            : String(value ?? '')}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </span>
            {pagination.onPageSizeChange && (
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) => pagination.onPageSizeChange?.(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pagination.pageSize} />
                </SelectTrigger>
                <SelectContent>
                  {(pagination.pageSizeOptions ?? [10, 25, 50, 100]).map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <span className="px-2 text-sm">
              Page {pagination.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(totalPages)}
              disabled={pagination.page >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
