'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  useTestRunWizardStore,
  mockEnvironments,
  mockMilestones,
  mockTeamMembers,
  type RunType,
  type RiskThreshold,
  type CaseIncludeOption,
} from '@/lib/store/test-run-wizard-store'
import { useTestRepositoryStore } from '@/lib/store/test-repository-store'
import type { TestSuiteNode, TestCaseItem } from '@/lib/store/test-repository-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Calendar as CalendarIcon,
  Plus,
  X,
  FolderTree,
  ChevronDown,
  AlertTriangle,
  Clock,
  Users,
  FileText,
  PlayCircle,
  Layers,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

// Step indicator component
function StepIndicator({
  step,
  currentStep,
  completedSteps,
  title,
}: {
  step: number
  currentStep: number
  completedSteps: Set<number>
  title: string
}) {
  const isActive = currentStep === step
  const isCompleted = completedSteps.has(step)

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
          isActive && 'border-primary bg-primary text-primary-foreground',
          isCompleted && !isActive && 'border-primary bg-primary/10 text-primary',
          !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground'
        )}
      >
        {isCompleted && !isActive ? <Check className="h-4 w-4" /> : step}
      </div>
      <span
        className={cn(
          'text-sm font-medium',
          isActive && 'text-foreground',
          !isActive && 'text-muted-foreground'
        )}
      >
        {title}
      </span>
    </div>
  )
}

// Step 1: Run Configuration
function StepConfiguration() {
  const {
    configuration,
    updateConfiguration,
    environments,
    milestones,
    teamMembers,
  } = useTestRunWizardStore()
  
  const [showNewEnvironment, setShowNewEnvironment] = React.useState(false)
  const [tagInput, setTagInput] = React.useState('')

  const riskLabels: Record<number, RiskThreshold> = {
    0: 'low',
    33: 'medium',
    66: 'high',
    100: 'critical',
  }

  const getRiskValue = (threshold: RiskThreshold): number => {
    switch (threshold) {
      case 'low': return 0
      case 'medium': return 33
      case 'high': return 66
      case 'critical': return 100
    }
  }

  const handleRiskChange = (value: number[]) => {
    const closest = Object.keys(riskLabels)
      .map(Number)
      .reduce((prev, curr) =>
        Math.abs(curr - value[0]) < Math.abs(prev - value[0]) ? curr : prev
      )
    updateConfiguration({ riskThreshold: riskLabels[closest] })
  }

  const addTag = () => {
    if (tagInput.trim() && !configuration.tags.includes(tagInput.trim())) {
      updateConfiguration({ tags: [...configuration.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    updateConfiguration({ tags: configuration.tags.filter(t => t !== tag) })
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Run Title *</Label>
        <Input
          id="title"
          placeholder="e.g., Sprint 23 Regression Test"
          value={configuration.title}
          onChange={(e) => updateConfiguration({ title: e.target.value })}
        />
      </div>

      {/* Run Type */}
      <div className="space-y-2">
        <Label>Run Type</Label>
        <div className="flex gap-1 rounded-lg border p-1">
          {(['manual', 'automated', 'mixed'] as RunType[]).map((type) => (
            <Button
              key={type}
              variant={configuration.runType === type ? 'default' : 'ghost'}
              size="sm"
              className="flex-1 capitalize"
              onClick={() => updateConfiguration({ runType: type })}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Environment */}
        <div className="space-y-2">
          <Label>Environment</Label>
          {!showNewEnvironment ? (
            <div className="flex gap-2">
              <Select
                value={configuration.environmentId || ''}
                onValueChange={(value) => updateConfiguration({ environmentId: value })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  {environments.map((env) => (
                    <SelectItem key={env.id} value={env.id}>
                      {env.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNewEnvironment(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="New environment name"
                value={configuration.newEnvironment || ''}
                onChange={(e) => updateConfiguration({ newEnvironment: e.target.value })}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setShowNewEnvironment(false)
                  updateConfiguration({ newEnvironment: undefined })
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Milestone */}
        <div className="space-y-2">
          <Label>Milestone</Label>
          <Select
            value={configuration.milestoneId || ''}
            onValueChange={(value) => updateConfiguration({ milestoneId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select milestone" />
            </SelectTrigger>
            <SelectContent>
              {milestones.map((ms) => (
                <SelectItem key={ms.id} value={ms.id}>
                  {ms.name} {ms.dueDate && `(Due: ${format(new Date(ms.dueDate), 'MMM d')})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Build Number */}
        <div className="space-y-2">
          <Label htmlFor="buildNumber">Build Number</Label>
          <Input
            id="buildNumber"
            placeholder="e.g., 1.2.3-beta"
            value={configuration.buildNumber}
            onChange={(e) => updateConfiguration({ buildNumber: e.target.value })}
          />
        </div>

        {/* Branch */}
        <div className="space-y-2">
          <Label htmlFor="branch">Branch</Label>
          <Input
            id="branch"
            placeholder="e.g., main, feature/xyz"
            value={configuration.branch}
            onChange={(e) => updateConfiguration({ branch: e.target.value })}
          />
        </div>

        {/* Planned Start Date */}
        <div className="space-y-2">
          <Label>Planned Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {configuration.plannedStartDate
                  ? format(configuration.plannedStartDate, 'PPP')
                  : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={configuration.plannedStartDate || undefined}
                onSelect={(date) => updateConfiguration({ plannedStartDate: date || null })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {configuration.dueDate
                  ? format(configuration.dueDate, 'PPP')
                  : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={configuration.dueDate || undefined}
                onSelect={(date) => updateConfiguration({ dueDate: date || null })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Default Assignee */}
      <div className="space-y-2">
        <Label>Default Assignee</Label>
        <Select
          value={configuration.defaultAssigneeId || ''}
          onValueChange={(value) => updateConfiguration({ defaultAssigneeId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select team member" />
          </SelectTrigger>
          <SelectContent>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name} ({member.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button variant="outline" onClick={addTag}>
            Add
          </Button>
        </div>
        {configuration.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {configuration.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Risk Threshold */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Risk Threshold</Label>
          <Badge
            variant="outline"
            className={cn(
              'capitalize',
              configuration.riskThreshold === 'critical' && 'border-red-500 text-red-500',
              configuration.riskThreshold === 'high' && 'border-orange-500 text-orange-500',
              configuration.riskThreshold === 'medium' && 'border-yellow-500 text-yellow-500',
              configuration.riskThreshold === 'low' && 'border-green-500 text-green-500'
            )}
          >
            {configuration.riskThreshold}
          </Badge>
        </div>
        <Slider
          value={[getRiskValue(configuration.riskThreshold)]}
          onValueChange={handleRiskChange}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
          <span>Critical</span>
        </div>
      </div>
    </div>
  )
}

// Suite tree item with checkbox
function SuiteTreeItem({
  suite,
  level = 0,
  suites,
  cases,
}: {
  suite: TestSuiteNode
  level?: number
  suites: TestSuiteNode[]
  cases: TestCaseItem[]
}) {
  const [isExpanded, setIsExpanded] = React.useState(true)
  const { caseSelection, toggleSuiteSelection } = useTestRunWizardStore()
  
  const isSelected = caseSelection.selectedSuiteIds.has(suite.id)
  const hasChildren = suite.children.length > 0
  
  // Count cases in this suite
  const directCaseCount = cases.filter(c => c.suiteId === suite.id).length

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50',
          isSelected && 'bg-primary/10'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-5 w-5 items-center justify-center"
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                !isExpanded && '-rotate-90'
              )}
            />
          </button>
        ) : (
          <div className="w-5" />
        )}
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleSuiteSelection(suite.id, suites, cases)}
        />
        <FolderTree className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 truncate text-sm">{suite.name}</span>
        <span className="text-xs text-muted-foreground">{directCaseCount} cases</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {suite.children.map((child) => (
            <SuiteTreeItem
              key={child.id}
              suite={child}
              level={level + 1}
              suites={suites}
              cases={cases}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Step 2: Case Selection
function StepCaseSelection() {
  const {
    suites,
    cases,
    caseSelection,
    excludeCase,
    setIncludeOption,
    setSelectionFilters,
    updatePreview,
    getSelectedCases,
    getDuplicateSuites,
    previewCount,
    previewEstimatedMinutes,
    isPreviewLoading,
  } = useTestRunWizardStore()

  const selectedCases = getSelectedCases()
  const duplicateSuites = getDuplicateSuites()

  React.useEffect(() => {
    void updatePreview()
  }, [
    caseSelection.selectedSuiteIds,
    caseSelection.selectedCaseIds,
    caseSelection.excludedCaseIds,
    caseSelection.includeOption,
    caseSelection.filters,
    updatePreview,
  ])

  const includeOptions: { value: CaseIncludeOption; label: string }[] = [
    { value: 'all', label: 'All Selected Cases' },
    { value: 'failed-only', label: 'Failed Only' },
    { value: 'untested-only', label: 'Untested Only' },
    { value: 'high-priority', label: 'High Priority Only' },
  ]

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="flex h-[500px] gap-4">
      {/* Left Panel: Suite Tree */}
      <Card className="flex w-1/2 flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Test Suites</CardTitle>
          <CardDescription>Check a suite to select all its test cases</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-4 pb-4">
            {suites.map((suite) => (
              <SuiteTreeItem
                key={suite.id}
                suite={suite}
                suites={suites}
                cases={cases}
              />
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Panel: Selected Cases */}
      <div className="flex w-1/2 flex-col gap-4">
        {/* Duplicate Warning */}
        {duplicateSuites.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Duplicate Detection</AlertTitle>
            <AlertDescription>
              Some selected suites overlap with parent suites. This may result in duplicate test cases.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Bar */}
        <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {isPreviewLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm font-medium">{previewCount} Cases</span>
            )}
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {isPreviewLoading ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <span className="text-sm font-medium">{formatDuration(previewEstimatedMinutes)}</span>
            )}
          </div>
        </div>

        {/* Include Options */}
        <div className="space-y-2">
          <Label>Include</Label>
          <Select
            value={caseSelection.includeOption}
            onValueChange={(value) => setIncludeOption(value as CaseIncludeOption)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {includeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select
            value={caseSelection.filters.priorities[0] || 'all'}
            onValueChange={(value) =>
              setSelectionFilters({ priorities: value === 'all' ? [] : [value] })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={caseSelection.filters.automationStatuses[0] || 'all'}
            onValueChange={(value) =>
              setSelectionFilters({ automationStatuses: value === 'all' ? [] : [value] })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Automation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="automated">Automated</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="to-automate">To Automate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selected Cases List */}
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Selected Cases</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[250px]">
            <CardContent className="space-y-1 py-0">
              {selectedCases.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No cases selected. Select suites from the left panel.
                </div>
              ) : (
                selectedCases.map((testCase) => (
                  <div
                    key={testCase.id}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <StatusBadge status={testCase.status} size="sm" showLabel={false} />
                      <span className="truncate text-sm">{testCase.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => excludeCase(testCase.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}

// Step 3: Review & Create
function StepReview() {
  const {
    configuration,
    environments,
    milestones,
    teamMembers,
    getSelectedCases,
    getCaseCountBySuite,
    suites,
    previewCount,
    previewEstimatedMinutes,
    isPreviewLoading,
  } = useTestRunWizardStore()

  const selectedCases = getSelectedCases()
  const caseCountBySuite = getCaseCountBySuite()

  const environment = environments.find(e => e.id === configuration.environmentId)
  const milestone = milestones.find(m => m.id === configuration.milestoneId)
  const assignee = teamMembers.find(m => m.id === configuration.defaultAssigneeId)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // Get suite name by ID
  const getSuiteName = (suiteId: string): string => {
    const findSuite = (nodes: TestSuiteNode[]): string | null => {
      for (const node of nodes) {
        if (node.id === suiteId) return node.name
        const found = findSuite(node.children)
        if (found) return found
      }
      return null
    }
    return findSuite(suites) || suiteId
  }

  // Group cases by priority
  const casesByPriority = {
    critical: selectedCases.filter(c => c.priority === 'critical').length,
    high: selectedCases.filter(c => c.priority === 'high').length,
    medium: selectedCases.filter(c => c.priority === 'medium').length,
    low: selectedCases.filter(c => c.priority === 'low').length,
  }

  return (
    <div className="space-y-6">
      {/* Run Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Run Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground">Title</Label>
              <p className="font-medium">{configuration.title || 'Untitled Run'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Run Type</Label>
              <p className="font-medium capitalize">{configuration.runType}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Environment</Label>
              <p className="font-medium">
                {configuration.newEnvironment || environment?.name || 'Not specified'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Milestone</Label>
              <p className="font-medium">{milestone?.name || 'Not specified'}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground">Build / Branch</Label>
              <p className="font-medium">
                {configuration.buildNumber || '-'} / {configuration.branch || '-'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Planned Start</Label>
              <p className="font-medium">
                {configuration.plannedStartDate
                  ? format(configuration.plannedStartDate, 'PPP')
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Due Date</Label>
              <p className="font-medium">
                {configuration.dueDate ? format(configuration.dueDate, 'PPP') : 'Not specified'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Risk Threshold</Label>
              <Badge
                variant="outline"
                className={cn(
                  'capitalize',
                  configuration.riskThreshold === 'critical' && 'border-red-500 text-red-500',
                  configuration.riskThreshold === 'high' && 'border-orange-500 text-orange-500',
                  configuration.riskThreshold === 'medium' && 'border-yellow-500 text-yellow-500',
                  configuration.riskThreshold === 'low' && 'border-green-500 text-green-500'
                )}
              >
                {configuration.riskThreshold}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Case Count Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4" />
              Case Breakdown by Suite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px]">
              <div className="space-y-2">
                {Array.from(caseCountBySuite.entries()).map(([suiteId, count]) => (
                  <div key={suiteId} className="flex items-center justify-between">
                    <span className="text-sm truncate">{getSuiteName(suiteId)}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Priority Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600">Critical</span>
                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-600">
                  {casesByPriority.critical}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-600">High</span>
                <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-600">
                  {casesByPriority.high}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600">Medium</span>
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600">
                  {casesByPriority.medium}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Low</span>
                <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-600">
                  {casesByPriority.low}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Totals */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                {isPreviewLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{previewCount}</p>
                )}
                <p className="text-xs text-muted-foreground">Total Cases</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                {isPreviewLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">{formatDuration(previewEstimatedMinutes)}</p>
                )}
                <p className="text-xs text-muted-foreground">Estimated Effort</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{assignee?.name || 'Unassigned'}</p>
                <p className="text-xs text-muted-foreground">Default Assignee</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Wizard Component
export function TestRunWizard({ projectId }: { projectId: string | null }) {
  const router = useRouter()
  const {
    suites: repositorySuites,
    cases: repositoryCases,
    loadSuites,
    loadCases,
  } = useTestRepositoryStore()

  const {
    currentStep,
    completedSteps,
    configuration,
    setData,
    nextStep,
    prevStep,
    previewCount,
    submitWizard,
    reset,
  } = useTestRunWizardStore()

  // Load repository data for suite/case selection
  React.useEffect(() => {
    async function loadRepositoryData() {
      if (!projectId) {
        setData({
          projectId: null,
          suites: [],
          cases: [],
          environments: mockEnvironments,
          milestones: mockMilestones,
          teamMembers: mockTeamMembers,
        })
        return
      }

      try {
        await Promise.all([loadSuites(projectId), loadCases(projectId)])
      } catch {
        toast.error('Failed to load repository suites and cases')
      }
    }

    void loadRepositoryData()
  }, [projectId, loadSuites, loadCases, setData])

  // Initialize wizard data
  React.useEffect(() => {
    setData({
      projectId,
      suites: repositorySuites,
      cases: repositoryCases,
      environments: mockEnvironments,
      milestones: mockMilestones,
      teamMembers: mockTeamMembers,
    })
  }, [projectId, repositorySuites, repositoryCases, setData])

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return configuration.title.trim().length > 0
      case 2:
        return previewCount > 0
      case 3:
        return true
      default:
        return false
    }
  }

  const handleCreate = async () => {
    if (!projectId) {
      toast.error('No active project selected')
      return
    }

    try {
      const newRunId = await submitWizard(projectId)
      router.push(`/test-runs/${newRunId}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create test run'
      toast.error(message)
    }
  }

  const handleCancel = () => {
    reset()
    router.push('/')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">Create Test Run</h1>
          <p className="text-sm text-muted-foreground">
            Configure your test run settings and select test cases
          </p>
        </div>
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-8 border-b bg-muted/30 px-6 py-4">
        <StepIndicator
          step={1}
          currentStep={currentStep}
          completedSteps={completedSteps}
          title="Configuration"
        />
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <StepIndicator
          step={2}
          currentStep={currentStep}
          completedSteps={completedSteps}
          title="Case Selection"
        />
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <StepIndicator
          step={3}
          currentStep={currentStep}
          completedSteps={completedSteps}
          title="Review & Create"
        />
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl">
          <div
            className={cn(
              'transition-all duration-300 ease-in-out',
              'animate-in fade-in slide-in-from-right-4'
            )}
            key={currentStep}
          >
            {currentStep === 1 && <StepConfiguration />}
            {currentStep === 2 && <StepCaseSelection />}
            {currentStep === 3 && <StepReview />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-6 py-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {currentStep < 3 ? (
            <Button onClick={nextStep} disabled={!canProceed()}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => void handleCreate()} disabled={!canProceed()}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Create Test Run
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
