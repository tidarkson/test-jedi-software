'use client'

import * as React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Lock,
  Archive,
  Plus,
  Copy,
  Trash2,
  MoreHorizontal,
  GripVertical,
  ChevronsUpDown,
  ChevronsDownUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTestRepositoryStore, type TestSuiteNode } from '@/lib/store/test-repository-store'

interface SuiteTreeItemProps {
  suite: TestSuiteNode
  depth: number
}

function SuiteTreeItem({ suite, depth }: SuiteTreeItemProps) {
  const {
    selectedSuiteId,
    expandedSuiteIds,
    setSelectedSuite,
    toggleSuiteExpanded,
  } = useTestRepositoryStore()

  const isSelected = selectedSuiteId === suite.id
  const isExpanded = expandedSuiteIds.has(suite.id)
  const hasChildren = suite.children.length > 0

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: suite.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleClick = () => {
    setSelectedSuite(suite.id)
  }

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleSuiteExpanded(suite.id)
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              'group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors',
              'hover:bg-muted/50',
              isSelected && 'bg-accent text-accent-foreground',
              isDragging && 'opacity-50',
              suite.isArchived && 'opacity-60'
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={handleClick}
          >
            {/* Drag handle */}
            <span
              {...attributes}
              {...listeners}
              className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </span>

            {/* Expand/Collapse */}
            {hasChildren ? (
              <button
                onClick={handleToggleExpand}
                className="p-0.5 hover:bg-muted rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
            ) : (
              <span className="w-[18px]" />
            )}

            {/* Folder icon */}
            {isExpanded && hasChildren ? (
              <FolderOpen className="h-4 w-4 text-primary/80" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground" />
            )}

            {/* Suite name */}
            <span className="flex-1 truncate font-medium">{suite.name}</span>

            {/* Status indicators */}
            {suite.isLocked && (
              <Lock className="h-3 w-3 text-muted-foreground" />
            )}
            {suite.isArchived && (
              <Archive className="h-3 w-3 text-muted-foreground" />
            )}

            {/* Case count badge */}
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
              {suite.caseCount}
            </Badge>

            {/* Failure rate indicator */}
            {suite.failureRate > 0 && (
              <Badge
                variant="outline"
                className={cn(
                  'h-5 px-1.5 text-[10px] font-normal',
                  suite.failureRate > 20
                    ? 'border-destructive/50 text-destructive'
                    : suite.failureRate > 10
                    ? 'border-warning/50 text-warning'
                    : 'border-muted-foreground/50'
                )}
              >
                {suite.failureRate.toFixed(1)}%
              </Badge>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem>
            <Plus className="mr-2 h-4 w-4" />
            New Suite
          </ContextMenuItem>
          <ContextMenuItem>
            <Plus className="mr-2 h-4 w-4" />
            New Test Case
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <Copy className="mr-2 h-4 w-4" />
            Clone Suite
          </ContextMenuItem>
          <ContextMenuItem>
            <Lock className="mr-2 h-4 w-4" />
            {suite.isLocked ? 'Unlock' : 'Lock'} Suite
          </ContextMenuItem>
          <ContextMenuItem>
            <Archive className="mr-2 h-4 w-4" />
            {suite.isArchived ? 'Unarchive' : 'Archive'} Suite
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Suite
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Render children if expanded */}
      {isExpanded && hasChildren && (
        <SortableContext
          items={suite.children.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {suite.children
            .sort((a, b) => a.order - b.order)
            .map(child => (
              <SuiteTreeItem key={child.id} suite={child} depth={depth + 1} />
            ))}
        </SortableContext>
      )}
    </div>
  )
}

export function SuiteTree() {
  const {
    suites,
    selectedSuiteId,
    setSelectedSuite,
    reorderSuites,
    expandAllSuites,
    collapseAllSuites,
  } = useTestRepositoryStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      // For simplicity, we handle reordering at root level
      // In a real app, you'd determine the parent from the drop location
      const orderedIds = suites
        .map(s => s.id)
        .filter(id => id !== active.id)
      const overIndex = orderedIds.indexOf(over.id as string)
      orderedIds.splice(overIndex, 0, active.id as string)
      reorderSuites(null, orderedIds)
    }
  }

  return (
    <div className="flex h-full flex-col border-r bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h3 className="text-sm font-semibold">Test Suites</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={expandAllSuites}
            title="Expand all"
          >
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={collapseAllSuites}
            title="Collapse all"
          >
            <ChevronsDownUp className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Plus className="mr-2 h-4 w-4" />
                New Suite
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={expandAllSuites}>
                <ChevronsUpDown className="mr-2 h-4 w-4" />
                Expand All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={collapseAllSuites}>
                <ChevronsDownUp className="mr-2 h-4 w-4" />
                Collapse All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* All Tests option */}
      <div
        className={cn(
          'flex items-center gap-2 border-b px-3 py-2 text-sm cursor-pointer transition-colors',
          'hover:bg-muted/50',
          selectedSuiteId === null && 'bg-accent text-accent-foreground'
        )}
        onClick={() => setSelectedSuite(null)}
      >
        <Folder className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">All Test Cases</span>
      </div>

      {/* Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={suites.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {suites
                .sort((a, b) => a.order - b.order)
                .map(suite => (
                  <SuiteTreeItem key={suite.id} suite={suite} depth={0} />
                ))}
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>
    </div>
  )
}
