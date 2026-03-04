import type { TestStatus, User } from './index'

// Execution Step Result
export interface ExecutionStepResult {
  stepId: string
  stepNumber: number
  action: string
  expectedResult: string
  status: TestStatus | 'pending'
  actualResult?: string
  comment?: string
  attachments?: ExecutionAttachment[]
  executedAt?: Date
}

// Execution Attachment
export interface ExecutionAttachment {
  id: string
  name: string
  url: string
  type: 'image' | 'video' | 'document' | 'other'
  size: number
  uploadedAt: Date
}

// Execution Case - a test case instance within a test run
export interface ExecutionCase {
  id: string
  caseId: string
  caseTitle: string
  caseDescription?: string
  suiteName: string
  suiteId: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: TestStatus | 'pending'
  assignee?: User
  steps: ExecutionStepResult[]
  preconditions?: string
  notes?: string
  defectId?: string
  estimatedTime?: number
  actualTime?: number
  startedAt?: Date
  completedAt?: Date
  lastSavedAt?: Date
}

// Defect (quick create)
export interface QuickDefect {
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  externalId?: string
  executionCaseId: string
  createdAt: Date
}

// Test Run Execution
export interface TestRunExecution {
  id: string
  name: string
  description?: string
  environment: string
  buildNumber?: string
  status: 'not_started' | 'in_progress' | 'paused' | 'completed'
  cases: ExecutionCase[]
  statistics: ExecutionStatistics
  startedAt?: Date
  pausedAt?: Date
  completedAt?: Date
  createdBy: User
  createdAt: Date
}

// Execution Statistics
export interface ExecutionStatistics {
  total: number
  pending: number
  passed: number
  failed: number
  blocked: number
  retest: number
  skipped: number
  na: number
  deferred: number
  passRate: number
  completionRate: number
}

// Filter for case queue
export interface ExecutionFilter {
  status?: (TestStatus | 'pending')[]
  assignee?: string[]
  priority?: ('critical' | 'high' | 'medium' | 'low')[]
}

// Timer state
export interface TimerState {
  isRunning: boolean
  elapsedSeconds: number
  startTime?: Date
}
