'use client'

import * as React from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  X,
  Edit,
  Save,
  Clock,
  User,
  Calendar,
  Tag,
  CheckCircle2,
  XCircle,
  MessageSquare,
  History,
  ListChecks,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { StatusBadge } from '@/components/ui/status-badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useTestRepositoryStore, type TestCaseItem, type TestStepItem } from '@/lib/store/test-repository-store'
import type { TestStatus } from '@/types'

const priorityOptions = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const severityOptions = [
  { value: 'blocker', label: 'Blocker' },
  { value: 'critical', label: 'Critical' },
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'trivial', label: 'Trivial' },
]

const typeOptions = [
  { value: 'functional', label: 'Functional' },
  { value: 'regression', label: 'Regression' },
  { value: 'smoke', label: 'Smoke' },
  { value: 'integration', label: 'Integration' },
  { value: 'e2e', label: 'E2E' },
  { value: 'performance', label: 'Performance' },
]

const automationOptions = [
  { value: 'automated', label: 'Automated' },
  { value: 'manual', label: 'Manual' },
  { value: 'to-automate', label: 'To Automate' },
]

const statusOptions: { value: TestStatus; label: string }[] = [
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'retest', label: 'Retest' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'na', label: 'N/A' },
  { value: 'deferred', label: 'Deferred' },
]

interface DetailsTabProps {
  testCase: TestCaseItem
  isEditing: boolean
}

function DetailsTab({ testCase, isEditing }: DetailsTabProps) {
  return (
    <div className="space-y-6 py-4">
      {/* Title and Description */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          {isEditing ? (
            <Input id="title" defaultValue={testCase.title} />
          ) : (
            <p className="text-sm">{testCase.title}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          {isEditing ? (
            <Textarea
              id="description"
              defaultValue={testCase.description}
              rows={3}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {testCase.description || 'No description provided'}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Properties Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Status</Label>
          {isEditing ? (
            <Select defaultValue={testCase.status}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <StatusBadge status={testCase.status} />
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Priority</Label>
          {isEditing ? (
            <Select defaultValue={testCase.priority}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline" className="capitalize">
              {testCase.priority}
            </Badge>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Severity</Label>
          {isEditing ? (
            <Select defaultValue={testCase.severity}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {severityOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline" className="capitalize">
              {testCase.severity}
            </Badge>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Type</Label>
          {isEditing ? (
            <Select defaultValue={testCase.type}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline" className="capitalize">
              {testCase.type}
            </Badge>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Automation</Label>
          {isEditing ? (
            <Select defaultValue={testCase.automationStatus}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {automationOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline" className="capitalize">
              {testCase.automationStatus === 'to-automate'
                ? 'To Automate'
                : testCase.automationStatus}
            </Badge>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Estimated Time</Label>
          {isEditing ? (
            <Input
              type="number"
              defaultValue={testCase.estimatedTime}
              className="h-8"
              placeholder="Minutes"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {testCase.estimatedTime ? `${testCase.estimatedTime} min` : 'Not set'}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Meta Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Author:</span>
          <span>{testCase.author}</span>
        </div>
        {testCase.assignee && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Assignee:</span>
            <span>{testCase.assignee}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Created:</span>
          <span>{format(new Date(testCase.createdAt), 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Updated:</span>
          <span>{formatDistanceToNow(new Date(testCase.updatedAt), { addSuffix: true })}</span>
        </div>
        {testCase.tags.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Tags:</span>
            <div className="flex flex-wrap gap-1">
              {testCase.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface StepsTabProps {
  steps: TestStepItem[]
  isEditing: boolean
}

function StepsTab({ steps, isEditing }: StepsTabProps) {
  return (
    <div className="py-4 space-y-4">
      {steps.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No test steps defined
        </p>
      ) : (
        steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'border rounded-lg p-3 space-y-2',
              step.status === 'passed' && 'border-l-4 border-l-success-500',
              step.status === 'failed' && 'border-l-4 border-l-error-500'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-medium">
                  {index + 1}
                </span>
                <span className="font-medium text-sm">Step {index + 1}</span>
              </div>
              {step.status && (
                <StatusBadge status={step.status} size="sm" showLabel={false} />
              )}
            </div>

            <div className="space-y-2 pl-8">
              <div>
                <Label className="text-xs text-muted-foreground">Action</Label>
                {isEditing ? (
                  <Textarea defaultValue={step.action} rows={2} className="mt-1" />
                ) : (
                  <p className="text-sm">{step.action}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Expected Result</Label>
                {isEditing ? (
                  <Textarea defaultValue={step.expectedResult} rows={2} className="mt-1" />
                ) : (
                  <p className="text-sm">{step.expectedResult}</p>
                )}
              </div>
              {step.actualResult && (
                <div>
                  <Label className="text-xs text-muted-foreground">Actual Result</Label>
                  <p className="text-sm">{step.actualResult}</p>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

interface HistoryTabProps {
  testCase: TestCaseItem
}

function HistoryTab({ testCase }: HistoryTabProps) {
  return (
    <div className="py-4 space-y-4">
      {testCase.history.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No run history
        </p>
      ) : (
        testCase.history.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-3 p-3 border rounded-lg"
          >
            <StatusBadge status={entry.status} showLabel={false} />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {format(new Date(entry.date), 'MMM d, yyyy HH:mm')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {entry.duration}s
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Run by {entry.runBy}
              </div>
              {entry.notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  {entry.notes}
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

interface CommentsTabProps {
  testCase: TestCaseItem
}

function CommentsTab({ testCase }: CommentsTabProps) {
  return (
    <div className="py-4 space-y-4">
      {testCase.comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No comments
        </p>
      ) : (
        testCase.comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {comment.author
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{comment.author}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          </div>
        ))
      )}

      {/* Add comment input */}
      <div className="pt-4 border-t">
        <Textarea placeholder="Add a comment..." rows={2} />
        <div className="flex justify-end mt-2">
          <Button size="sm">Add Comment</Button>
        </div>
      </div>
    </div>
  )
}

export function CaseDetailDrawer() {
  const { activeCaseId, setActiveCase, getCaseById } = useTestRepositoryStore()
  const [isEditing, setIsEditing] = React.useState(false)

  const testCase = activeCaseId ? getCaseById(activeCaseId) : null
  const isOpen = !!testCase

  const handleClose = () => {
    setActiveCase(null)
    setIsEditing(false)
  }

  if (!testCase) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {testCase.id}
              </Badge>
              <StatusBadge status={testCase.status} size="sm" />
            </div>
            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" className="gap-1.5">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <SheetTitle className="text-left text-base font-semibold mt-2 line-clamp-2">
            {testCase.title}
          </SheetTitle>
        </SheetHeader>

        {/* Tabs Content */}
        <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start rounded-none border-b px-4 h-10 bg-transparent flex-shrink-0">
            <TabsTrigger value="details" className="gap-1.5">
              <FileText className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="steps" className="gap-1.5">
              <ListChecks className="h-4 w-4" />
              Steps ({testCase.steps.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Comments ({testCase.comments.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-4">
            <TabsContent value="details" className="m-0">
              <DetailsTab testCase={testCase} isEditing={isEditing} />
            </TabsContent>
            <TabsContent value="steps" className="m-0">
              <StepsTab steps={testCase.steps} isEditing={isEditing} />
            </TabsContent>
            <TabsContent value="history" className="m-0">
              <HistoryTab testCase={testCase} />
            </TabsContent>
            <TabsContent value="comments" className="m-0">
              <CommentsTab testCase={testCase} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
