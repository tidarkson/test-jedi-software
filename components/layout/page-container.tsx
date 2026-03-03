import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function PageContainer({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: PageContainerProps) {
  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Page Header */}
      <div className="flex flex-shrink-0 items-start justify-between border-b border-border bg-surface-base px-6 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Page Content */}
      <div className={cn('flex-1 overflow-auto p-6', contentClassName)}>
        {children}
      </div>
    </div>
  )
}

// Sub-components for flexible page layouts
interface PageSectionProps {
  title?: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description || actions) && (
        <div className="flex items-start justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-medium text-foreground">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

interface PageGridProps {
  columns?: 1 | 2 | 3 | 4
  children: React.ReactNode
  className?: string
}

export function PageGrid({ columns = 3, children, className }: PageGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  )
}
