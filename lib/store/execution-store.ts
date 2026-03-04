'use client'

import { create } from 'zustand'
import type { TestStatus } from '@/types'
import type {
  TestRunExecution,
  ExecutionCase,
  ExecutionStepResult,
  ExecutionFilter,
  TimerState,
  QuickDefect,
  ExecutionStatistics,
} from '@/types/execution'

// Mock users for demo
const mockUsers = [
  { id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'engineer' as const },
  { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'engineer' as const },
  { id: 'u3', name: 'Bob Wilson', email: 'bob@example.com', role: 'manager' as const },
]

// Generate mock execution data
function generateMockExecution(): TestRunExecution {
  const cases: ExecutionCase[] = [
    {
      id: 'ec-1',
      caseId: 'TC-001',
      caseTitle: 'Verify user login with valid credentials',
      caseDescription: 'Test that users can successfully log in with valid username and password',
      suiteName: 'Authentication > Login',
      suiteId: 'suite-1-1',
      priority: 'critical',
      status: 'pending',
      assignee: mockUsers[0],
      estimatedTime: 10,
      preconditions: 'User account must exist in the system\nUser must not be currently logged in',
      steps: [
        { stepId: 's1', stepNumber: 1, action: 'Navigate to login page', expectedResult: 'Login page is displayed', status: 'pending' },
        { stepId: 's2', stepNumber: 2, action: 'Enter valid username', expectedResult: 'Username is accepted', status: 'pending' },
        { stepId: 's3', stepNumber: 3, action: 'Enter valid password', expectedResult: 'Password field shows masked characters', status: 'pending' },
        { stepId: 's4', stepNumber: 4, action: 'Click Login button', expectedResult: 'User is redirected to dashboard', status: 'pending' },
      ],
    },
    {
      id: 'ec-2',
      caseId: 'TC-002',
      caseTitle: 'Verify login fails with invalid credentials',
      caseDescription: 'Test that appropriate error message is shown for invalid login',
      suiteName: 'Authentication > Login',
      suiteId: 'suite-1-1',
      priority: 'high',
      status: 'pending',
      assignee: mockUsers[0],
      estimatedTime: 8,
      preconditions: 'User is on login page',
      steps: [
        { stepId: 's1', stepNumber: 1, action: 'Enter invalid username', expectedResult: 'Username is accepted', status: 'pending' },
        { stepId: 's2', stepNumber: 2, action: 'Enter invalid password', expectedResult: 'Password field shows masked characters', status: 'pending' },
        { stepId: 's3', stepNumber: 3, action: 'Click Login button', expectedResult: 'Error message "Invalid credentials" is displayed', status: 'pending' },
      ],
    },
    {
      id: 'ec-3',
      caseId: 'TC-003',
      caseTitle: 'Verify password reset email is sent',
      caseDescription: 'Test the forgot password functionality sends reset email',
      suiteName: 'Authentication > Password Reset',
      suiteId: 'suite-1-3',
      priority: 'medium',
      status: 'pending',
      assignee: mockUsers[1],
      estimatedTime: 12,
      preconditions: 'User has a registered email in the system',
      steps: [
        { stepId: 's1', stepNumber: 1, action: 'Click "Forgot Password" link', expectedResult: 'Password reset page is displayed', status: 'pending' },
        { stepId: 's2', stepNumber: 2, action: 'Enter registered email address', expectedResult: 'Email field accepts input', status: 'pending' },
        { stepId: 's3', stepNumber: 3, action: 'Click "Send Reset Link" button', expectedResult: 'Success message is displayed', status: 'pending' },
        { stepId: 's4', stepNumber: 4, action: 'Check email inbox', expectedResult: 'Password reset email is received within 2 minutes', status: 'pending' },
      ],
    },
    {
      id: 'ec-4',
      caseId: 'TC-004',
      caseTitle: 'Verify dashboard widgets load correctly',
      caseDescription: 'Test that all dashboard widgets display data properly',
      suiteName: 'Dashboard > Widgets',
      suiteId: 'suite-2-1',
      priority: 'high',
      status: 'pending',
      assignee: mockUsers[1],
      estimatedTime: 15,
      preconditions: 'User is logged in\nUser has dashboard access permissions',
      steps: [
        { stepId: 's1', stepNumber: 1, action: 'Navigate to dashboard', expectedResult: 'Dashboard page loads within 3 seconds', status: 'pending' },
        { stepId: 's2', stepNumber: 2, action: 'Verify statistics widget', expectedResult: 'Statistics widget shows correct data', status: 'pending' },
        { stepId: 's3', stepNumber: 3, action: 'Verify recent activity widget', expectedResult: 'Recent activity shows last 10 actions', status: 'pending' },
        { stepId: 's4', stepNumber: 4, action: 'Verify quick actions widget', expectedResult: 'Quick action buttons are clickable', status: 'pending' },
        { stepId: 's5', stepNumber: 5, action: 'Refresh the page', expectedResult: 'All widgets reload with updated data', status: 'pending' },
      ],
    },
    {
      id: 'ec-5',
      caseId: 'TC-005',
      caseTitle: 'Verify API authentication endpoint',
      caseDescription: 'Test the /api/auth endpoint returns correct responses',
      suiteName: 'API Integration > Authentication',
      suiteId: 'suite-3',
      priority: 'critical',
      status: 'pending',
      assignee: mockUsers[2],
      estimatedTime: 10,
      preconditions: 'API server is running\nValid API credentials are available',
      steps: [
        { stepId: 's1', stepNumber: 1, action: 'Send POST request to /api/auth with valid credentials', expectedResult: 'Response status 200 with JWT token', status: 'pending' },
        { stepId: 's2', stepNumber: 2, action: 'Send POST request with invalid credentials', expectedResult: 'Response status 401 with error message', status: 'pending' },
        { stepId: 's3', stepNumber: 3, action: 'Send request with expired token', expectedResult: 'Response status 403 with "Token expired" message', status: 'pending' },
      ],
    },
    {
      id: 'ec-6',
      caseId: 'TC-006',
      caseTitle: 'Verify user registration flow',
      caseDescription: 'Test complete user registration process',
      suiteName: 'Authentication > Registration',
      suiteId: 'suite-1-2',
      priority: 'high',
      status: 'pending',
      assignee: mockUsers[0],
      estimatedTime: 20,
      preconditions: 'Registration page is accessible\nEmail service is operational',
      steps: [
        { stepId: 's1', stepNumber: 1, action: 'Navigate to registration page', expectedResult: 'Registration form is displayed', status: 'pending' },
        { stepId: 's2', stepNumber: 2, action: 'Fill in all required fields', expectedResult: 'Form accepts all inputs', status: 'pending' },
        { stepId: 's3', stepNumber: 3, action: 'Submit registration form', expectedResult: 'Success message appears', status: 'pending' },
        { stepId: 's4', stepNumber: 4, action: 'Check email for verification link', expectedResult: 'Verification email received', status: 'pending' },
        { stepId: 's5', stepNumber: 5, action: 'Click verification link', expectedResult: 'Account is verified and user can login', status: 'pending' },
      ],
    },
  ]

  return {
    id: 'tr-exec-001',
    name: 'Sprint 23 Regression',
    description: 'Full regression test for Sprint 23 release',
    environment: 'Staging',
    buildNumber: 'v2.5.0-rc1',
    status: 'in_progress',
    cases,
    statistics: calculateStatistics(cases),
    startedAt: new Date(),
    createdBy: mockUsers[2],
    createdAt: new Date(),
  }
}

function calculateStatistics(cases: ExecutionCase[]): ExecutionStatistics {
  const stats = {
    total: cases.length,
    pending: 0,
    passed: 0,
    failed: 0,
    blocked: 0,
    retest: 0,
    skipped: 0,
    na: 0,
    deferred: 0,
    passRate: 0,
    completionRate: 0,
  }

  cases.forEach((c) => {
    if (c.status === 'pending') stats.pending++
    else if (c.status === 'passed') stats.passed++
    else if (c.status === 'failed') stats.failed++
    else if (c.status === 'blocked') stats.blocked++
    else if (c.status === 'retest') stats.retest++
    else if (c.status === 'skipped') stats.skipped++
    else if (c.status === 'na') stats.na++
    else if (c.status === 'deferred') stats.deferred++
  })

  const completed = stats.total - stats.pending
  stats.completionRate = stats.total > 0 ? Math.round((completed / stats.total) * 100) : 0
  stats.passRate = completed > 0 ? Math.round((stats.passed / completed) * 100) : 0

  return stats
}

interface ExecutionState {
  // Current execution
  execution: TestRunExecution | null
  
  // Selected case
  selectedCaseId: string | null
  
  // Filter
  filter: ExecutionFilter
  
  // Timer
  timer: TimerState
  
  // Auto-save
  lastSavedAt: Date | null
  isSaving: boolean
  
  // Defects
  defects: QuickDefect[]
  
  // Panel width (percentage)
  leftPanelWidth: number
  
  // Actions
  loadExecution: (executionId: string) => void
  selectCase: (caseId: string | null) => void
  
  // Step actions
  updateStepStatus: (caseId: string, stepId: string, status: TestStatus | 'pending') => void
  updateStepComment: (caseId: string, stepId: string, comment: string) => void
  updateStepActualResult: (caseId: string, stepId: string, actualResult: string) => void
  
  // Case actions
  updateCaseStatus: (caseId: string, status: TestStatus | 'pending') => void
  updateCaseNotes: (caseId: string, notes: string) => void
  
  // Timer actions
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  tickTimer: () => void
  
  // Filter actions
  setFilter: (filter: ExecutionFilter) => void
  clearFilter: () => void
  
  // Defect actions
  createDefect: (defect: Omit<QuickDefect, 'id' | 'createdAt'>) => void
  
  // Navigation
  navigateToNextCase: () => void
  navigateToPreviousCase: () => void
  
  // Panel resize
  setLeftPanelWidth: (width: number) => void
  
  // Get filtered cases
  getFilteredCases: () => ExecutionCase[]
  
  // Get selected case
  getSelectedCase: () => ExecutionCase | null
}

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  execution: null,
  selectedCaseId: null,
  filter: {},
  timer: { isRunning: false, elapsedSeconds: 0 },
  lastSavedAt: null,
  isSaving: false,
  defects: [],
  leftPanelWidth: 35,

  loadExecution: () => {
    const execution = generateMockExecution()
    set({ 
      execution, 
      selectedCaseId: execution.cases[0]?.id || null,
      lastSavedAt: new Date(),
    })
  },

  selectCase: (caseId) => {
    set({ selectedCaseId: caseId })
  },

  updateStepStatus: (caseId, stepId, status) => {
    set((state) => {
      if (!state.execution) return state
      
      const cases = state.execution.cases.map((c) => {
        if (c.id !== caseId) return c
        
        const steps = c.steps.map((s) =>
          s.stepId === stepId ? { ...s, status, executedAt: new Date() } : s
        )
        
        // Auto-calculate case status based on steps
        let caseStatus: TestStatus | 'pending' = 'pending'
        const completedSteps = steps.filter((s) => s.status !== 'pending')
        if (completedSteps.length === steps.length) {
          // All steps completed
          if (steps.some((s) => s.status === 'failed')) caseStatus = 'failed'
          else if (steps.some((s) => s.status === 'blocked')) caseStatus = 'blocked'
          else if (steps.every((s) => s.status === 'passed')) caseStatus = 'passed'
          else if (steps.every((s) => s.status === 'skipped')) caseStatus = 'skipped'
          else caseStatus = 'retest'
        }
        
        return { ...c, steps, status: caseStatus, lastSavedAt: new Date() }
      })
      
      return {
        execution: {
          ...state.execution,
          cases,
          statistics: calculateStatistics(cases),
        },
        lastSavedAt: new Date(),
      }
    })
  },

  updateStepComment: (caseId, stepId, comment) => {
    set((state) => {
      if (!state.execution) return state
      
      const cases = state.execution.cases.map((c) => {
        if (c.id !== caseId) return c
        const steps = c.steps.map((s) =>
          s.stepId === stepId ? { ...s, comment } : s
        )
        return { ...c, steps, lastSavedAt: new Date() }
      })
      
      return {
        execution: { ...state.execution, cases },
        lastSavedAt: new Date(),
      }
    })
  },

  updateStepActualResult: (caseId, stepId, actualResult) => {
    set((state) => {
      if (!state.execution) return state
      
      const cases = state.execution.cases.map((c) => {
        if (c.id !== caseId) return c
        const steps = c.steps.map((s) =>
          s.stepId === stepId ? { ...s, actualResult } : s
        )
        return { ...c, steps, lastSavedAt: new Date() }
      })
      
      return {
        execution: { ...state.execution, cases },
        lastSavedAt: new Date(),
      }
    })
  },

  updateCaseStatus: (caseId, status) => {
    set((state) => {
      if (!state.execution) return state
      
      const cases = state.execution.cases.map((c) =>
        c.id === caseId ? { ...c, status, lastSavedAt: new Date() } : c
      )
      
      return {
        execution: {
          ...state.execution,
          cases,
          statistics: calculateStatistics(cases),
        },
        lastSavedAt: new Date(),
      }
    })
  },

  updateCaseNotes: (caseId, notes) => {
    set((state) => {
      if (!state.execution) return state
      
      const cases = state.execution.cases.map((c) =>
        c.id === caseId ? { ...c, notes, lastSavedAt: new Date() } : c
      )
      
      return {
        execution: { ...state.execution, cases },
        lastSavedAt: new Date(),
      }
    })
  },

  startTimer: () => {
    set((state) => ({
      timer: { ...state.timer, isRunning: true, startTime: new Date() },
    }))
  },

  pauseTimer: () => {
    set((state) => ({
      timer: { ...state.timer, isRunning: false },
    }))
  },

  resetTimer: () => {
    set({ timer: { isRunning: false, elapsedSeconds: 0 } })
  },

  tickTimer: () => {
    set((state) => ({
      timer: { ...state.timer, elapsedSeconds: state.timer.elapsedSeconds + 1 },
    }))
  },

  setFilter: (filter) => {
    set({ filter })
  },

  clearFilter: () => {
    set({ filter: {} })
  },

  createDefect: (defect) => {
    const newDefect: QuickDefect = {
      ...defect,
      id: `DEF-${Date.now()}`,
      createdAt: new Date(),
    }
    
    set((state) => {
      // Link defect to case
      const cases = state.execution?.cases.map((c) =>
        c.id === defect.executionCaseId ? { ...c, defectId: newDefect.id } : c
      )
      
      return {
        defects: [...state.defects, newDefect],
        execution: state.execution ? { ...state.execution, cases: cases || [] } : null,
      }
    })
  },

  navigateToNextCase: () => {
    const { execution, selectedCaseId } = get()
    if (!execution) return
    
    const filteredCases = get().getFilteredCases()
    const currentIndex = filteredCases.findIndex((c) => c.id === selectedCaseId)
    if (currentIndex < filteredCases.length - 1) {
      set({ selectedCaseId: filteredCases[currentIndex + 1].id })
    }
  },

  navigateToPreviousCase: () => {
    const { execution, selectedCaseId } = get()
    if (!execution) return
    
    const filteredCases = get().getFilteredCases()
    const currentIndex = filteredCases.findIndex((c) => c.id === selectedCaseId)
    if (currentIndex > 0) {
      set({ selectedCaseId: filteredCases[currentIndex - 1].id })
    }
  },

  setLeftPanelWidth: (width) => {
    set({ leftPanelWidth: Math.max(20, Math.min(60, width)) })
  },

  getFilteredCases: () => {
    const { execution, filter } = get()
    if (!execution) return []
    
    return execution.cases.filter((c) => {
      if (filter.status?.length && !filter.status.includes(c.status)) return false
      if (filter.assignee?.length && (!c.assignee || !filter.assignee.includes(c.assignee.id))) return false
      if (filter.priority?.length && !filter.priority.includes(c.priority)) return false
      return true
    })
  },

  getSelectedCase: () => {
    const { execution, selectedCaseId } = get()
    if (!execution || !selectedCaseId) return null
    return execution.cases.find((c) => c.id === selectedCaseId) || null
  },
}))
