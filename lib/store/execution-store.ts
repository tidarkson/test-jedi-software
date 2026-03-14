'use client'

import { create } from 'zustand'
import type { TestStatus } from '@/types'
import type {
  TestRunExecution,
  ExecutionCase,
  ExecutionFilter,
  TimerState,
  QuickDefect,
  ExecutionStatistics,
  ExecutionStepResult,
} from '@/types/execution'
import { getRunCases, updateRunCase } from '@/lib/api/runs'
import {
  runCaseDtoToExecutionCase,
  stepResultToUpdateRequest,
} from '@/lib/api/adapters/execution'
import type { RunCaseUpdateRequest } from '@/lib/api/types/runs'

const AUTO_SAVE_DEBOUNCE_MS = 1000
const runCaseSaveTimers = new Map<string, ReturnType<typeof setTimeout>>()

const systemUser = {
  id: 'system',
  name: 'System',
  email: 'system@test-jedi.local',
  role: 'manager' as const,
}

function executionStatusToBackendStatus(status: TestStatus | 'pending'): RunCaseUpdateRequest['status'] {
  switch (status) {
    case 'passed':
      return 'PASSED'
    case 'failed':
      return 'FAILED'
    case 'blocked':
      return 'BLOCKED'
    case 'skipped':
      return 'SKIPPED'
    case 'pending':
    case 'retest':
    case 'na':
    case 'deferred':
    default:
      return 'NOT_RUN'
  }
}

function deriveCaseStatusFromSteps(steps: ExecutionStepResult[]): TestStatus | 'pending' {
  if (!steps.length) {
    return 'pending'
  }

  const completedSteps = steps.filter((step) => step.status !== 'pending')
  if (completedSteps.length !== steps.length) {
    return 'pending'
  }

  if (steps.some((step) => step.status === 'failed')) {
    return 'failed'
  }

  if (steps.some((step) => step.status === 'blocked')) {
    return 'blocked'
  }

  if (steps.every((step) => step.status === 'passed')) {
    return 'passed'
  }

  if (steps.every((step) => step.status === 'skipped')) {
    return 'skipped'
  }

  return 'retest'
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

  cases.forEach((caseItem) => {
    if (caseItem.status === 'pending') stats.pending++
    else if (caseItem.status === 'passed') stats.passed++
    else if (caseItem.status === 'failed') stats.failed++
    else if (caseItem.status === 'blocked') stats.blocked++
    else if (caseItem.status === 'retest') stats.retest++
    else if (caseItem.status === 'skipped') stats.skipped++
    else if (caseItem.status === 'na') stats.na++
    else if (caseItem.status === 'deferred') stats.deferred++
  })

  const completed = stats.total - stats.pending
  stats.completionRate = stats.total > 0 ? Math.round((completed / stats.total) * 100) : 0
  stats.passRate = completed > 0 ? Math.round((stats.passed / completed) * 100) : 0

  return stats
}

interface DefectCreateInput {
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  externalId?: string
}

interface ExecutionState {
  execution: TestRunExecution | null
  runId: string | null
  selectedCaseId: string | null
  filter: ExecutionFilter
  timer: TimerState
  lastSavedAt: Date | null
  isSaving: boolean
  isLoading: boolean
  error: string | null
  defects: QuickDefect[]
  leftPanelWidth: number

  loadExecution: (runId: string) => Promise<void>
  selectCase: (caseId: string | null) => void

  setStepStatus: (caseId: string, stepId: string, status: TestStatus | 'pending') => void
  setStepComment: (caseId: string, stepId: string, comment: string) => void
  setStepActualResult: (caseId: string, stepId: string, actualResult: string) => void

  setCaseStatus: (caseId: string, status: TestStatus | 'pending') => Promise<void>
  setCaseNotes: (caseId: string, notes: string) => void

  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  tickTimer: () => void

  setFilter: (filter: ExecutionFilter) => void
  clearFilter: () => void

  createDefectForCase: (runCaseId: string, defectData: DefectCreateInput) => Promise<void>

  navigateToNextCase: () => void
  navigateToPreviousCase: () => void

  setLeftPanelWidth: (width: number) => void
  getFilteredCases: () => ExecutionCase[]
  getSelectedCase: () => ExecutionCase | null
}

export const useExecutionStore = create<ExecutionState>((set, get) => {
  const persistRunCase = async (
    runId: string,
    runCaseId: string,
    payload: RunCaseUpdateRequest
  ) => {
    set({ isSaving: true, error: null })

    try {
      await updateRunCase(runId, runCaseId, payload)
      const savedAt = new Date()

      set((state) => {
        if (!state.execution) {
          return {
            isSaving: false,
            lastSavedAt: savedAt,
            error: null,
          }
        }

        const cases = state.execution.cases.map((caseItem) =>
          caseItem.id === runCaseId ? { ...caseItem, lastSavedAt: savedAt } : caseItem
        )

        return {
          isSaving: false,
          lastSavedAt: savedAt,
          error: null,
          execution: {
            ...state.execution,
            cases,
          },
        }
      })
    } catch {
      set({ isSaving: false, error: 'Save failed' })
    }
  }

  const scheduleStepSave = (runCaseId: string) => {
    const existingTimer = runCaseSaveTimers.get(runCaseId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(async () => {
      const { execution, runId } = get()
      if (!execution || !runId) {
        return
      }

      const caseToSave = execution.cases.find((caseItem) => caseItem.id === runCaseId)
      if (!caseToSave) {
        return
      }

      const latestStep = [...caseToSave.steps]
        .sort((a, b) => b.stepNumber - a.stepNumber)
        .find((step) => step.executedAt)

      const payload = latestStep
        ? {
            ...stepResultToUpdateRequest(latestStep),
            status: executionStatusToBackendStatus(caseToSave.status),
          }
        : {
            status: executionStatusToBackendStatus(caseToSave.status),
          }

      await persistRunCase(runId, runCaseId, payload)
      runCaseSaveTimers.delete(runCaseId)
    }, AUTO_SAVE_DEBOUNCE_MS)

    runCaseSaveTimers.set(runCaseId, timer)
  }

  return {
    execution: null,
    runId: null,
    selectedCaseId: null,
    filter: {},
    timer: { isRunning: false, elapsedSeconds: 0 },
    lastSavedAt: null,
    isSaving: false,
    isLoading: false,
    error: null,
    defects: [],
    leftPanelWidth: 35,

    loadExecution: async (runId) => {
      set({ isLoading: true, error: null, runId, execution: null, selectedCaseId: null })

      try {
        const runCases = await getRunCases(runId)
        const cases = runCases.map(runCaseDtoToExecutionCase)
        const execution: TestRunExecution = {
          id: runId,
          name: `Run ${runId.slice(0, 8)}`,
          environment: 'N/A',
          status: cases.length > 0 ? 'in_progress' : 'not_started',
          cases,
          statistics: calculateStatistics(cases),
          startedAt: new Date(),
          createdBy: systemUser,
          createdAt: new Date(),
        }

        set({
          execution,
          selectedCaseId: cases[0]?.id ?? null,
          isLoading: false,
          error: null,
        })
      } catch {
        set({
          execution: null,
          selectedCaseId: null,
          isLoading: false,
          error: 'Failed to load execution cases',
        })
      }
    },

    selectCase: (caseId) => {
      set({ selectedCaseId: caseId })
    },

    setStepStatus: (caseId, stepId, status) => {
      set((state) => {
        if (!state.execution) {
          return state
        }

        const cases = state.execution.cases.map((caseItem) => {
          if (caseItem.id !== caseId) {
            return caseItem
          }

          const steps = caseItem.steps.map((step) =>
            step.stepId === stepId ? { ...step, status, executedAt: new Date() } : step
          )

          const caseStatus = deriveCaseStatusFromSteps(steps)
          return { ...caseItem, steps, status: caseStatus }
        })

        return {
          execution: {
            ...state.execution,
            cases,
            statistics: calculateStatistics(cases),
          },
        }
      })

      scheduleStepSave(caseId)
    },

    setStepComment: (caseId, stepId, comment) => {
      set((state) => {
        if (!state.execution) {
          return state
        }

        const cases = state.execution.cases.map((caseItem) => {
          if (caseItem.id !== caseId) {
            return caseItem
          }

          const steps = caseItem.steps.map((step) =>
            step.stepId === stepId ? { ...step, comment } : step
          )

          return { ...caseItem, steps }
        })

        return {
          execution: { ...state.execution, cases },
        }
      })
    },

    setStepActualResult: (caseId, stepId, actualResult) => {
      set((state) => {
        if (!state.execution) {
          return state
        }

        const cases = state.execution.cases.map((caseItem) => {
          if (caseItem.id !== caseId) {
            return caseItem
          }

          const steps = caseItem.steps.map((step) =>
            step.stepId === stepId ? { ...step, actualResult } : step
          )

          return { ...caseItem, steps }
        })

        return {
          execution: { ...state.execution, cases },
        }
      })
    },

    setCaseStatus: async (caseId, status) => {
      const { execution, runId } = get()
      if (!execution || !runId) {
        return
      }

      set((state) => {
        if (!state.execution) {
          return state
        }

        const cases = state.execution.cases.map((caseItem) =>
          caseItem.id === caseId ? { ...caseItem, status } : caseItem
        )

        return {
          execution: {
            ...state.execution,
            cases,
            statistics: calculateStatistics(cases),
          },
        }
      })

      await persistRunCase(runId, caseId, { status: executionStatusToBackendStatus(status) })
    },

    setCaseNotes: (caseId, notes) => {
      set((state) => {
        if (!state.execution) {
          return state
        }

        const cases = state.execution.cases.map((caseItem) =>
          caseItem.id === caseId ? { ...caseItem, notes } : caseItem
        )

        return {
          execution: { ...state.execution, cases },
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

    createDefectForCase: async (runCaseId, defectData) => {
      const { runId, execution } = get()
      if (!runId || !execution) {
        return
      }

      const existingCase = execution.cases.find((caseItem) => caseItem.id === runCaseId)
      if (!existingCase) {
        return
      }

      const defectId = defectData.externalId?.trim() || `DEF-${Date.now()}`

      set((state) => {
        if (!state.execution) {
          return state
        }

        const createdAt = new Date()
        const cases = state.execution.cases.map((caseItem) =>
          caseItem.id === runCaseId ? { ...caseItem, defectId } : caseItem
        )

        return {
          defects: [
            ...state.defects,
            {
              id: defectId,
              title: defectData.title,
              severity: defectData.severity,
              externalId: defectData.externalId,
              executionCaseId: runCaseId,
              createdAt,
            },
          ],
          execution: {
            ...state.execution,
            cases,
          },
        }
      })

      await persistRunCase(runId, runCaseId, {
        status: executionStatusToBackendStatus(existingCase.status),
        defectId,
        comment: defectData.title,
      })
    },

    navigateToNextCase: () => {
      const { execution, selectedCaseId } = get()
      if (!execution) {
        return
      }

      const filteredCases = get().getFilteredCases()
      const currentIndex = filteredCases.findIndex((caseItem) => caseItem.id === selectedCaseId)
      if (currentIndex < filteredCases.length - 1) {
        set({ selectedCaseId: filteredCases[currentIndex + 1].id })
      }
    },

    navigateToPreviousCase: () => {
      const { execution, selectedCaseId } = get()
      if (!execution) {
        return
      }

      const filteredCases = get().getFilteredCases()
      const currentIndex = filteredCases.findIndex((caseItem) => caseItem.id === selectedCaseId)
      if (currentIndex > 0) {
        set({ selectedCaseId: filteredCases[currentIndex - 1].id })
      }
    },

    setLeftPanelWidth: (width) => {
      set({ leftPanelWidth: Math.max(20, Math.min(60, width)) })
    },

    getFilteredCases: () => {
      const { execution, filter } = get()
      if (!execution) {
        return []
      }

      return execution.cases.filter((caseItem) => {
        if (filter.status?.length && !filter.status.includes(caseItem.status)) return false
        if (filter.assignee?.length && (!caseItem.assignee || !filter.assignee.includes(caseItem.assignee.id))) return false
        if (filter.priority?.length && !filter.priority.includes(caseItem.priority)) return false
        return true
      })
    },

    getSelectedCase: () => {
      const { execution, selectedCaseId } = get()
      if (!execution || !selectedCaseId) {
        return null
      }

      return execution.cases.find((caseItem) => caseItem.id === selectedCaseId) || null
    },
  }
})
