'use client'

import { create } from 'zustand'
import type { TestStatus } from '@/types'

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
  priority: 'critical' | 'high' | 'medium' | 'low'
  severity: 'blocker' | 'critical' | 'major' | 'minor' | 'trivial'
  type: 'functional' | 'regression' | 'smoke' | 'integration' | 'e2e' | 'performance'
  status: TestStatus
  automationStatus: 'automated' | 'manual' | 'to-automate'
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
  
  // Actions
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

// Initialize with mock data
export function initializeStore(suites: TestSuiteNode[], cases: TestCaseItem[]) {
  useTestRepositoryStore.setState({
    suites,
    cases,
    expandedSuiteIds: new Set(getAllSuiteIds(suites)),
  })
}
