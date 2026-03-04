'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useExecutionStore } from '@/lib/store/execution-store'
import { CaseQueue } from './case-queue'
import { ExecutionDetail } from './execution-detail'
import { GripVertical } from 'lucide-react'

interface ExecutionWorkspaceProps {
  className?: string
}

export function ExecutionWorkspace({ className }: ExecutionWorkspaceProps) {
  const { leftPanelWidth, setLeftPanelWidth, loadExecution, execution } = useExecutionStore()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  // Load execution on mount
  React.useEffect(() => {
    if (!execution) {
      loadExecution('tr-exec-001')
    }
  }, [execution, loadExecution])

  // Handle resize
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

      // Clamp between 20% and 60%
      setLeftPanelWidth(Math.max(20, Math.min(60, newWidth)))
    },
    [isDragging, setLeftPanelWidth]
  )

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      // Add cursor style to body during drag
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  if (!execution) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <div className="text-center text-muted-foreground">
          Loading execution...
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('flex h-full', className)}>
      {/* Left Panel - Case Queue */}
      <div
        className="flex h-full overflow-hidden border-r bg-background"
        style={{ width: `${leftPanelWidth}%` }}
      >
        <CaseQueue className="h-full flex-1" />
      </div>

      {/* Resize Handle */}
      <div
        className={cn(
          'group relative flex w-1 cursor-col-resize items-center justify-center bg-border transition-colors hover:bg-primary/20',
          isDragging && 'bg-primary/30'
        )}
        onMouseDown={handleMouseDown}
      >
        <div
          className={cn(
            'absolute flex h-8 w-4 items-center justify-center rounded-sm bg-border transition-colors group-hover:bg-primary/30',
            isDragging && 'bg-primary/50'
          )}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Right Panel - Execution Detail */}
      <div
        className="flex h-full overflow-hidden bg-background"
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        <ExecutionDetail className="h-full flex-1" />
      </div>
    </div>
  )
}
