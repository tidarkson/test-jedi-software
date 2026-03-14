'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useExecutionStore } from '@/lib/store/execution-store'
import type { TestStatus } from '@/types'
import type { ExecutionStepResult } from '@/types/execution'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  SkipForward,
  Ban,
  RefreshCw,
  HelpCircle,
  AlertCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
  Paperclip,
  Bug,
  Save,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'

const statusConfig: Record<TestStatus | 'pending', {
  label: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
}> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-slate-500', bgColor: 'bg-slate-100', borderColor: 'border-slate-300' },
  passed: { label: 'Passed', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-300' },
  blocked: { label: 'Blocked', icon: Ban, color: 'text-orange-600', bgColor: 'bg-orange-100', borderColor: 'border-orange-300' },
  retest: { label: 'Retest', icon: RefreshCw, color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
  skipped: { label: 'Skipped', icon: SkipForward, color: 'text-gray-500', bgColor: 'bg-gray-100', borderColor: 'border-gray-300' },
  na: { label: 'N/A', icon: HelpCircle, color: 'text-gray-400', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  deferred: { label: 'Deferred', icon: AlertCircle, color: 'text-purple-600', bgColor: 'bg-purple-100', borderColor: 'border-purple-300' },
}

const priorityConfig = {
  critical: { label: 'Critical', className: 'bg-red-100 text-red-700 border-red-200' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  low: { label: 'Low', className: 'bg-green-100 text-green-700 border-green-200' },
}

interface ExecutionDetailProps {
  className?: string
}

export function ExecutionDetail({ className }: ExecutionDetailProps) {
  const {
    getSelectedCase,
    setStepStatus,
    setStepComment,
    setCaseStatus,
    setCaseNotes,
    navigateToNextCase,
    navigateToPreviousCase,
    timer,
    startTimer,
    pauseTimer,
    resetTimer,
    tickTimer,
    lastSavedAt,
    isSaving,
    error,
    createDefectForCase,
    getFilteredCases,
    selectedCaseId,
  } = useExecutionStore()

  const selectedCase = getSelectedCase()
  const filteredCases = getFilteredCases()
  const currentIndex = filteredCases.findIndex((c) => c.id === selectedCaseId)

  const [isPreconditionsOpen, setIsPreconditionsOpen] = React.useState(true)
  const [showDefectDialog, setShowDefectDialog] = React.useState(false)
  const [defectForm, setDefectForm] = React.useState({
    title: '',
    severity: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    externalId: '',
  })

  // Timer tick effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (timer.isRunning) {
      interval = setInterval(() => {
        tickTimer()
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer.isRunning, tickTimer])

  // Format timer
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Auto-save indicator
  const getLastSavedText = () => {
    if (error) return 'Save failed'
    if (isSaving) return 'Saving...'
    if (!lastSavedAt) return 'Not saved'
    const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000)
    if (seconds < 5) return 'Just saved'
    if (seconds < 60) return `Saved ${seconds}s ago`
    return `Saved ${Math.floor(seconds / 60)}m ago`
  }

  const handleCreateDefect = () => {
    if (!selectedCase || !defectForm.title) return
    void createDefectForCase(selectedCase.id, defectForm)
    toast.success('Defect created successfully')
    setShowDefectDialog(false)
    setDefectForm({ title: '', severity: 'medium', externalId: '' })
  }

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable
      ) {
        return
      }

      if (!selectedCase) {
        return
      }

      const key = event.key.toLowerCase()
      if (key === 'p') {
        event.preventDefault()
        void setCaseStatus(selectedCase.id, 'passed')
      }

      if (key === 'f') {
        event.preventDefault()
        void setCaseStatus(selectedCase.id, 'failed')
      }

      if (key === 'n') {
        event.preventDefault()
        navigateToNextCase()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigateToNextCase, selectedCase, setCaseStatus])

  if (!selectedCase) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <div className="text-center text-muted-foreground">
          <FileText className="mx-auto h-12 w-12 opacity-50" />
          <p className="mt-2">Select a test case to begin execution</p>
        </div>
      </div>
    )
  }

  const priorityInfo = priorityConfig[selectedCase.priority]
  const caseStatusInfo = statusConfig[selectedCase.status]

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {selectedCase.caseId}
              </span>
              <Badge variant="outline" className={priorityInfo.className}>
                {priorityInfo.label}
              </Badge>
              <Badge variant="outline" className={cn(caseStatusInfo.bgColor, caseStatusInfo.color, 'border', caseStatusInfo.borderColor)}>
                <caseStatusInfo.icon className="mr-1 h-3 w-3" />
                {caseStatusInfo.label}
              </Badge>
            </div>
            <h2 className="mt-1 text-lg font-semibold">{selectedCase.caseTitle}</h2>
            <p className="text-sm text-muted-foreground">{selectedCase.suiteName}</p>
          </div>
          
          {/* Timer and Save Indicator */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-md border bg-muted/50 px-3 py-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-lg font-medium">
                  {formatTime(timer.elapsedSeconds)}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={timer.isRunning ? pauseTimer : startTimer}
              >
                {timer.isRunning ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="icon" onClick={resetTimer}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Save className="h-3 w-3" />
              {getLastSavedText()}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-4 space-y-6">
          {/* Preconditions */}
          {selectedCase.preconditions && (
            <Collapsible open={isPreconditionsOpen} onOpenChange={setIsPreconditionsOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium hover:bg-muted/50">
                Preconditions
                <ChevronDown className={cn('h-4 w-4 transition-transform', isPreconditionsOpen && 'rotate-180')} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 rounded-md border bg-amber-50 p-3 text-sm">
                  <pre className="whitespace-pre-wrap font-sans text-amber-900">
                    {selectedCase.preconditions}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Steps */}
          <div>
            <h3 className="mb-3 text-sm font-medium">Test Steps</h3>
            <div className="space-y-3">
              {selectedCase.steps.map((step) => (
                <StepCard
                  key={step.stepId}
                  step={step}
                  caseId={selectedCase.id}
                  onStatusChange={(status) => setStepStatus(selectedCase.id, step.stepId, status)}
                  onCommentChange={(comment) => setStepComment(selectedCase.id, step.stepId, comment)}
                />
              ))}
            </div>
          </div>

          {/* Overall Case Status */}
          <div>
            <h3 className="mb-3 text-sm font-medium">Overall Result</h3>
            <div className="flex flex-wrap gap-2">
              {(['passed', 'failed', 'blocked', 'retest', 'skipped', 'na', 'deferred'] as TestStatus[]).map((status) => {
                const info = statusConfig[status]
                const Icon = info.icon
                const isSelected = selectedCase.status === status
                return (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    onClick={() => void setCaseStatus(selectedCase.id, status)}
                    className={cn(
                      'transition-all',
                      isSelected && cn(info.bgColor, info.color, 'border-2', info.borderColor)
                    )}
                  >
                    <Icon className="mr-1 h-4 w-4" />
                    {info.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Create Defect Button (shown when failed) */}
          {selectedCase.status === 'failed' && !selectedCase.defectId && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-800">Test Failed</h4>
                  <p className="text-sm text-red-600">Would you like to create a defect for this failure?</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setDefectForm({
                      ...defectForm,
                      title: `[${selectedCase.caseId}] ${selectedCase.caseTitle} - Failed`,
                    })
                    setShowDefectDialog(true)
                  }}
                >
                  <Bug className="mr-1 h-4 w-4" />
                  Create Defect
                </Button>
              </div>
            </div>
          )}

          {selectedCase.defectId && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Defect linked: {selectedCase.defectId}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <h3 className="mb-3 text-sm font-medium">Notes</h3>
            <Textarea
              placeholder="Add execution notes..."
              value={selectedCase.notes || ''}
              onChange={(e) => setCaseNotes(selectedCase.id, e.target.value)}
              className="min-h-24"
            />
          </div>
        </div>
      </ScrollArea>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between border-t p-4">
        <Button
          variant="outline"
          onClick={navigateToPreviousCase}
          disabled={currentIndex <= 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} of {filteredCases.length}
        </span>
        <Button
          variant="outline"
          onClick={navigateToNextCase}
          disabled={currentIndex >= filteredCases.length - 1}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {/* Create Defect Dialog */}
      <Dialog open={showDefectDialog} onOpenChange={setShowDefectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Defect</DialogTitle>
            <DialogDescription>
              Create a new defect for this failed test case
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="defect-title">Title</Label>
              <Input
                id="defect-title"
                value={defectForm.title}
                onChange={(e) => setDefectForm({ ...defectForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="defect-severity">Severity</Label>
              <Select
                value={defectForm.severity}
                onValueChange={(value) => setDefectForm({ ...defectForm, severity: value as typeof defectForm.severity })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="defect-external">External ID (optional)</Label>
              <Input
                id="defect-external"
                placeholder="e.g., JIRA-123"
                value={defectForm.externalId}
                onChange={(e) => setDefectForm({ ...defectForm, externalId: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDefectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDefect} disabled={!defectForm.title}>
              Create Defect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface StepCardProps {
  step: ExecutionStepResult
  caseId: string
  onStatusChange: (status: TestStatus | 'pending') => void
  onCommentChange: (comment: string) => void
}

function StepCard({ step, caseId, onStatusChange, onCommentChange }: StepCardProps) {
  const [showComment, setShowComment] = React.useState(false)
  const [localComment, setLocalComment] = React.useState(step.comment || '')
  const statusInfo = statusConfig[step.status]

  // Debounced comment save
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (localComment !== step.comment) {
        onCommentChange(localComment)
      }
    }, 1000)
    return () => clearTimeout(timeout)
  }, [localComment, step.comment, onCommentChange])

  return (
    <div className={cn(
      'rounded-lg border p-4 transition-colors',
      step.status !== 'pending' && cn(statusInfo.bgColor, 'border', statusInfo.borderColor)
    )}>
      <div className="flex items-start gap-4">
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {step.stepNumber}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-sm font-medium">Action</p>
            <p className="text-sm text-muted-foreground">{step.action}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Expected Result</p>
            <p className="text-sm text-muted-foreground">{step.expectedResult}</p>
          </div>
          
          {/* Comment toggle */}
          <div className="pt-2">
            <button
              onClick={() => setShowComment(!showComment)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="h-3 w-3" />
              {step.comment ? 'Edit comment' : 'Add comment'}
            </button>
            {showComment && (
              <Textarea
                value={localComment}
                onChange={(e) => setLocalComment(e.target.value)}
                placeholder="Add a comment about this step..."
                className="mt-2 text-sm"
                rows={2}
              />
            )}
          </div>
        </div>

        {/* Status buttons */}
        <div className="flex flex-shrink-0 gap-1">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'h-8 w-8',
              step.status === 'passed' && 'bg-green-100 text-green-600 border-green-300 hover:bg-green-200'
            )}
            onClick={() => onStatusChange('passed')}
            title="Pass"
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'h-8 w-8',
              step.status === 'failed' && 'bg-red-100 text-red-600 border-red-300 hover:bg-red-200'
            )}
            onClick={() => onStatusChange('failed')}
            title="Fail"
          >
            <XCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'h-8 w-8',
              step.status === 'skipped' && 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
            )}
            onClick={() => onStatusChange('skipped')}
            title="Skip"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
