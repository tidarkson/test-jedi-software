'use client'

import { create } from 'zustand'
import type { TestStatus } from '@/types'
import {
  getSuites,
  getCases,
  createSuite,
  updateSuite,
  deleteSuite,
  cloneSuite,
  lockSuite,
  archiveSuite,
  createCase,
  updateCase,
  deleteCase,
  bulkCaseOperation,
} from '@/lib/api/repository'
import type { GetCasesFilters } from '@/lib/api/repository'
import type { SuiteCreateRequest, SuiteUpdateRequest, BulkCaseOperationRequest } from '@/lib/api/types/repository'
import type { TestCaseUpdateRequest } from '@/lib/api/types/repository'
import { caseItemToCreateRequest } from '@/lib/api/adapters/repository'
import { ApiError } from '@/lib/api/errors'

// Extended types for the repository
export interface TestSuiteNode {
  id: string
  name: string
  description?: string
  parentId: string | null
  order: number
  isLocked: boolean
  isArchived: boolean
  caseCount: number
  failureRate: number
  children: TestSuiteNode[]
}

export interface TestCaseItem {
  id: string
  suiteId: string
  title: string
  description?: string
  preconditions?: string
  postconditions?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  severity: 'blocker' | 'critical' | 'major' | 'minor' | 'trivial'
  type: 'functional' | 'regression' | 'smoke' | 'integration' | 'e2e' | 'performance' | 'security' | 'usability'
  status: TestStatus
  automationStatus: 'automated' | 'manual' | 'partially-automated' | 'to-automate'
  lastRunDate: string | null
  author: string
  assignee?: string
  tags: string[]
  estimatedTime?: number
  createdAt: string
  updatedAt: string
  steps: TestStepItem[]
  history: TestHistoryItem[]
  comments: TestCommentItem[]
}

export interface TestStepItem {
  id: string
  order: number
  action: string
  expectedResult: string
  actualResult?: string
  status?: TestStatus
}

export interface TestHistoryItem {
  id: string
  date: string
  status: TestStatus
  runBy: string
  duration: number
  notes?: string
}

export interface TestCommentItem {
  id: string
  author: string
  content: string
  createdAt: string
}

export interface FilterState {
  search: string
  priorities: string[]
  severities: string[]
  types: string[]
  automationStatuses: string[]
  statuses: string[]
  tags: string[]
}

function toApiEnum(value: string): string {
  return value.replace(/-/g, '_').toUpperCase()
}

interface TestRepositoryState {
  // Suite state
  suites: TestSuiteNode[]
  selectedSuiteId: string | null
  expandedSuiteIds: Set<string>

  // Case state
  cases: TestCaseItem[]
  selectedCaseIds: Set<string>
  activeCaseId: string | null

  // Filter state
  filters: FilterState

  // Async/loading state
  isLoadingSuites: boolean
  isLoadingCases: boolean
  isBulkOperating: boolean
  error: string | null
  projectId: string | null

  // Sync actions
  setSelectedSuite: (id: string | null) => void
  toggleSuiteExpanded: (id: string) => void
  expandAllSuites: () => void
  collapseAllSuites: () => void
  reorderSuites: (parentId: string | null, orderedIds: string[]) => void
  selectCase: (id: string) => void
  toggleCaseSelection: (id: string) => void
  selectAllCases: () => void
  clearCaseSelection: () => void
  setActiveCase: (id: string | null) => void
  setFilter: (key: keyof FilterState, value: FilterState[keyof FilterState]) => void
  clearFilters: () => void
  clearError: () => void

  // Async suite actions
  loadSuites: (projectId: string) => Promise<void>
  createSuiteAction: (projectId: string, data: SuiteCreateRequest) => Promise<void>
  updateSuiteAction: (projectId: string, id: string, data: SuiteUpdateRequest) => Promise<void>
  deleteSuiteAction: (projectId: string, id: string) => Promise<void>
  cloneSuiteAction: (projectId: string, id: string) => Promise<void>
  lockSuiteAction: (projectId: string, id: string) => Promise<void>
  archiveSuiteAction: (projectId: string, id: string) => Promise<void>

  // Async case actions
  loadCases: (projectId: string, filters?: GetCasesFilters) => Promise<void>
  createCaseAction: (projectId: string, data: Partial<TestCaseItem>) => Promise<TestCaseItem>
  updateCaseAction: (projectId: string, id: string, data: Partial<TestCaseItem>) => Promise<void>
  deleteCaseAction: (projectId: string, id: string) => Promise<void>
  bulkCaseOperationAction: (projectId: string, data: BulkCaseOperationRequest) => Promise<void>

  // Computed
  getFilteredCases: () => TestCaseItem[]
  getSuiteById: (id: string) => TestSuiteNode | undefined
  getCaseById: (id: string) => TestCaseItem | undefined
}

// Helper to flatten suites for lookups
function flattenSuites(suites: TestSuiteNode[]): TestSuiteNode[] {
  return suites.reduce<TestSuiteNode[]>((acc, suite) => {
    acc.push(suite)
    if (suite.children.length > 0) {
      acc.push(...flattenSuites(suite.children))
    }
    return acc
  }, [])
}

// Helper to get all suite IDs
function getAllSuiteIds(suites: TestSuiteNode[]): string[] {
  return flattenSuites(suites).map(s => s.id)
}

export const useTestRepositoryStore = create<TestRepositoryState>((set, get) => ({
  suites: [],
  selectedSuiteId: null,
  expandedSuiteIds: new Set(),
  cases: [],
  selectedCaseIds: new Set(),
  activeCaseId: null,
  isLoadingSuites: false,
  isLoadingCases: false,
  isBulkOperating: false,
  error: null,
  projectId: null,
  filters: {
    search: '',
    priorities: [],
    severities: [],
    types: [],
    automationStatuses: [],
    statuses: [],
    tags: [],
  },

  setSelectedSuite: (id) => set({ selectedSuiteId: id, selectedCaseIds: new Set() }),

  toggleSuiteExpanded: (id) => set((state) => {
    const newExpanded = new Set(state.expandedSuiteIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    return { expandedSuiteIds: newExpanded }
  }),

  expandAllSuites: () => set((state) => ({
    expandedSuiteIds: new Set(getAllSuiteIds(state.suites))
  })),

  collapseAllSuites: () => set({ expandedSuiteIds: new Set() }),

  reorderSuites: (parentId, orderedIds) => set((state) => {
    const updateOrder = (suites: TestSuiteNode[]): TestSuiteNode[] => {
      return suites.map(suite => {
        if (suite.parentId === parentId) {
          const newOrder = orderedIds.indexOf(suite.id)
          return { ...suite, order: newOrder >= 0 ? newOrder : suite.order }
        }
        if (suite.children.length > 0) {
          return { ...suite, children: updateOrder(suite.children) }
        }
        return suite
      })
    }
    return { suites: updateOrder(state.suites) }
  }),

  selectCase: (id) => set({ selectedCaseIds: new Set([id]) }),

  toggleCaseSelection: (id) => set((state) => {
    const newSelected = new Set(state.selectedCaseIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    return { selectedCaseIds: newSelected }
  }),

  selectAllCases: () => set((state) => {
    const filteredCases = get().getFilteredCases()
    return { selectedCaseIds: new Set(filteredCases.map(c => c.id)) }
  }),

  clearCaseSelection: () => set({ selectedCaseIds: new Set() }),

  setActiveCase: (id) => set({ activeCaseId: id }),

  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),

  clearFilters: () => set({
    filters: {
      search: '',
      priorities: [],
      severities: [],
      types: [],
      automationStatuses: [],
      statuses: [],
      tags: [],
    }
  }),

  clearError: () => set({ error: null }),

  // ── Async suite actions ─────────────────────────────────────────────────────

  loadSuites: async (projectId) => {
    set({ isLoadingSuites: true, error: null, projectId })
    try {
      const suites = await getSuites(projectId)
      set({
        suites,
        isLoadingSuites: false,
        expandedSuiteIds: new Set(getAllSuiteIds(suites)),
      })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load suites'
      set({ isLoadingSuites: false, error: msg })
    }
  },

  createSuiteAction: async (projectId, data) => {
    set({ error: null })
    try {
      const newSuite = await createSuite(projectId, data)
      // Reload the full tree so tree structure stays consistent
      const suites = await getSuites(projectId)
      set({ suites, expandedSuiteIds: new Set(getAllSuiteIds(suites)) })
      // suppress unused variable lint warning
      void newSuite
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to create suite'
      set({ error: msg })
      throw err
    }
  },

  updateSuiteAction: async (projectId, id, data) => {
    set({ error: null })
    try {
      await updateSuite(projectId, id, data)
      const suites = await getSuites(projectId)
      set({ suites })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update suite'
      set({ error: msg })
      throw err
    }
  },

  deleteSuiteAction: async (projectId, id) => {
    set({ error: null })
    try {
      await deleteSuite(projectId, id)
      const suites = await getSuites(projectId)
      set({ suites, expandedSuiteIds: new Set(getAllSuiteIds(suites)) })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to delete suite'
      set({ error: msg })
      throw err
    }
  },

  cloneSuiteAction: async (projectId, id) => {
    set({ error: null })
    try {
      await cloneSuite(projectId, id)
      const suites = await getSuites(projectId)
      set({ suites, expandedSuiteIds: new Set(getAllSuiteIds(suites)) })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to clone suite'
      set({ error: msg })
      throw err
    }
  },

  lockSuiteAction: async (projectId, id) => {
    set({ error: null })
    try {
      await lockSuite(projectId, id)
      const suites = await getSuites(projectId)
      set({ suites })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to toggle suite lock'
      set({ error: msg })
      throw err
    }
  },

  archiveSuiteAction: async (projectId, id) => {
    set({ error: null })
    try {
      await archiveSuite(projectId, id)
      const suites = await getSuites(projectId)
      set({ suites })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to archive suite'
      set({ error: msg })
      throw err
    }
  },

  // ── Async case actions ──────────────────────────────────────────────────────

  loadCases: async (projectId, filters) => {
    set({ isLoadingCases: true, error: null })
    try {
      const cases = await getCases(projectId, filters)
      set({ cases, isLoadingCases: false })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load cases'
      set({ isLoadingCases: false, error: msg })
    }
  },

  createCaseAction: async (projectId, data) => {
    set({ error: null })
    try {
      const request = caseItemToCreateRequest(data)
      const created = await createCase(projectId, request)
      set((state) => ({ cases: [created, ...state.cases] }))
      return created
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to create test case'
      set({ error: msg })
      throw err
    }
  },

  updateCaseAction: async (projectId, id, data) => {
    set({ error: null })
    try {
      const updatePayload: TestCaseUpdateRequest = {
        title: data.title,
        description: data.description,
        priority: data.priority ? (toApiEnum(data.priority) as TestCaseUpdateRequest['priority']) : undefined,
        severity: data.severity ? (toApiEnum(data.severity) as TestCaseUpdateRequest['severity']) : undefined,
        type: data.type ? (toApiEnum(data.type) as TestCaseUpdateRequest['type']) : undefined,
        automationStatus: data.automationStatus
          ? (toApiEnum(data.automationStatus) as TestCaseUpdateRequest['automationStatus'])
          : undefined,
        tags: data.tags,
        estimatedTime: data.estimatedTime,
        steps: data.steps?.map((step, index) => ({
          order: step.order ?? index + 1,
          action: step.action,
          expectedResult: step.expectedResult,
        })),
      }

      const updated = await updateCase(projectId, id, updatePayload)
      set((state) => ({
        cases: state.cases.map((c) => (c.id === id ? updated : c)),
      }))
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update test case'
      set({ error: msg })
      throw err
    }
  },

  deleteCaseAction: async (projectId, id) => {
    set({ error: null })
    try {
      await deleteCase(projectId, id)
      set((state) => ({
        cases: state.cases.filter((c) => c.id !== id),
        selectedCaseIds: new Set([...state.selectedCaseIds].filter((cid) => cid !== id)),
        activeCaseId: state.activeCaseId === id ? null : state.activeCaseId,
      }))
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to delete test case'
      set({ error: msg })
      throw err
    }
  },

  bulkCaseOperationAction: async (projectId, data) => {
    set({ isBulkOperating: true, error: null })
    try {
      await bulkCaseOperation(projectId, data)
      // Reload cases to reflect server state
      const cases = await getCases(projectId)
      set({ cases, isBulkOperating: false, selectedCaseIds: new Set() })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Bulk operation failed'
      set({ isBulkOperating: false, error: msg })
      throw err
    }
  },

  getFilteredCases: () => {
    const state = get()
    const { selectedSuiteId, cases, filters } = state

    return cases.filter(testCase => {
      // Filter by suite
      if (selectedSuiteId && testCase.suiteId !== selectedSuiteId) {
        return false
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (
          !testCase.title.toLowerCase().includes(searchLower) &&
          !testCase.id.toLowerCase().includes(searchLower) &&
          !testCase.description?.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      // Priority filter
      if (filters.priorities.length > 0 && !filters.priorities.includes(testCase.priority)) {
        return false
      }

      // Severity filter
      if (filters.severities.length > 0 && !filters.severities.includes(testCase.severity)) {
        return false
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(testCase.type)) {
        return false
      }

      // Automation status filter
      if (filters.automationStatuses.length > 0 && !filters.automationStatuses.includes(testCase.automationStatus)) {
        return false
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(testCase.status)) {
        return false
      }

      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => testCase.tags.includes(tag))) {
        return false
      }

      return true
    })
  },

  getSuiteById: (id) => {
    const state = get()
    return flattenSuites(state.suites).find(s => s.id === id)
  },

  getCaseById: (id) => {
    const state = get()
    return state.cases.find(c => c.id === id)
  },
}))

// Initialize with local data (kept for backwards-compat / tests)
export function initializeStore(suites: TestSuiteNode[], cases: TestCaseItem[]) {
  useTestRepositoryStore.setState({
    suites,
    cases,
    expandedSuiteIds: new Set(getAllSuiteIds(suites)),
  })
}
