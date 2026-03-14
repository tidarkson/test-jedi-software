'use client'

import { create } from 'zustand'
import { createRun, previewRunCases } from '@/lib/api/runs'
import type { TestSuiteNode, TestCaseItem } from './test-repository-store'

// Types for the wizard
export type RunType = 'manual' | 'automated' | 'mixed'
export type RiskThreshold = 'low' | 'medium' | 'high' | 'critical'
export type CaseIncludeOption = 'all' | 'failed-only' | 'untested-only' | 'high-priority'

export interface Environment {
  id: string
  name: string
  description?: string
}

export interface Milestone {
  id: string
  name: string
  dueDate?: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface RunConfiguration {
  title: string
  runType: RunType
  environmentId: string | null
  newEnvironment?: string
  milestoneId: string | null
  buildNumber: string
  branch: string
  plannedStartDate: Date | null
  dueDate: Date | null
  defaultAssigneeId: string | null
  tags: string[]
  riskThreshold: RiskThreshold
}

export interface CaseSelection {
  selectedSuiteIds: Set<string>
  selectedCaseIds: Set<string>
  excludedCaseIds: Set<string>
  includeOption: CaseIncludeOption
  filters: {
    priorities: string[]
    types: string[]
    automationStatuses: string[]
  }
}

export interface WizardState {
  // Step tracking
  currentStep: number
  completedSteps: Set<number>
  
  // Step 1: Configuration
  configuration: RunConfiguration
  
  // Step 2: Case Selection
  caseSelection: CaseSelection
  previewCount: number
  previewEstimatedMinutes: number
  isPreviewLoading: boolean
  
  // Data (injected from parent)
  projectId: string | null
  suites: TestSuiteNode[]
  cases: TestCaseItem[]
  environments: Environment[]
  milestones: Milestone[]
  teamMembers: TeamMember[]
  
  // Actions
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  markStepComplete: (step: number) => void
  
  // Configuration actions
  updateConfiguration: (updates: Partial<RunConfiguration>) => void
  
  // Case selection actions
  toggleSuiteSelection: (suiteId: string, suites: TestSuiteNode[], cases: TestCaseItem[]) => void
  toggleCaseSelection: (caseId: string) => void
  excludeCase: (caseId: string) => void
  includeCase: (caseId: string) => void
  setIncludeOption: (option: CaseIncludeOption) => void
  setSelectionFilters: (filters: Partial<CaseSelection['filters']>) => void
  clearSelection: () => void
  updatePreview: () => Promise<void>
  submitWizard: (projectId: string) => Promise<string>
  
  // Data setters
  setData: (data: {
    projectId?: string | null
    suites: TestSuiteNode[]
    cases: TestCaseItem[]
    environments: Environment[]
    milestones: Milestone[]
    teamMembers: TeamMember[]
  }) => void
  
  // Computed
  getSelectedCases: () => TestCaseItem[]
  getEstimatedEffort: () => number
  getDuplicateSuites: () => string[]
  getCaseCountBySuite: () => Map<string, number>
  
  // Reset
  reset: () => void
}

const initialConfiguration: RunConfiguration = {
  title: '',
  runType: 'manual',
  environmentId: null,
  milestoneId: null,
  buildNumber: '',
  branch: '',
  plannedStartDate: null,
  dueDate: null,
  defaultAssigneeId: null,
  tags: [],
  riskThreshold: 'medium',
}

const initialCaseSelection: CaseSelection = {
  selectedSuiteIds: new Set(),
  selectedCaseIds: new Set(),
  excludedCaseIds: new Set(),
  includeOption: 'all',
  filters: {
    priorities: [],
    types: [],
    automationStatuses: [],
  },
}

function toApiEnum(value: string): string {
  return value.replace(/-/g, '_').toUpperCase()
}

function toPreviewStatus(includeOption: CaseIncludeOption): string | undefined {
  switch (includeOption) {
    case 'failed-only':
      return 'FAILED'
    case 'untested-only':
      return 'NOT_RUN'
    default:
      return undefined
  }
}

let previewDebounceTimer: ReturnType<typeof setTimeout> | null = null
let latestPreviewCall = 0

// Helper to get all case IDs from a suite and its children
function getAllCaseIdsFromSuite(
  suiteId: string,
  suites: TestSuiteNode[],
  cases: TestCaseItem[]
): string[] {
  const result: string[] = []
  
  // Get cases directly in this suite
  const directCases = cases.filter(c => c.suiteId === suiteId)
  result.push(...directCases.map(c => c.id))
  
  // Find the suite and get children recursively
  const findSuite = (nodes: TestSuiteNode[]): TestSuiteNode | undefined => {
    for (const node of nodes) {
      if (node.id === suiteId) return node
      const found = findSuite(node.children)
      if (found) return found
    }
    return undefined
  }
  
  const suite = findSuite(suites)
  if (suite) {
    const getChildCases = (children: TestSuiteNode[]): void => {
      for (const child of children) {
        const childCases = cases.filter(c => c.suiteId === child.id)
        result.push(...childCases.map(c => c.id))
        getChildCases(child.children)
      }
    }
    getChildCases(suite.children)
  }
  
  return result
}

// Helper to get all child suite IDs
function getAllChildSuiteIds(suiteId: string, suites: TestSuiteNode[]): string[] {
  const result: string[] = []
  
  const findSuite = (nodes: TestSuiteNode[]): TestSuiteNode | undefined => {
    for (const node of nodes) {
      if (node.id === suiteId) return node
      const found = findSuite(node.children)
      if (found) return found
    }
    return undefined
  }
  
  const suite = findSuite(suites)
  if (suite) {
    const collectChildIds = (children: TestSuiteNode[]): void => {
      for (const child of children) {
        result.push(child.id)
        collectChildIds(child.children)
      }
    }
    collectChildIds(suite.children)
  }
  
  return result
}

// Helper to check if a suite is an ancestor of another
function isAncestorOf(
  ancestorId: string,
  descendantId: string,
  suites: TestSuiteNode[]
): boolean {
  const childIds = getAllChildSuiteIds(ancestorId, suites)
  return childIds.includes(descendantId)
}

export const useTestRunWizardStore = create<WizardState>((set, get) => ({
  currentStep: 1,
  completedSteps: new Set(),
  configuration: { ...initialConfiguration },
  caseSelection: {
    ...initialCaseSelection,
    selectedSuiteIds: new Set(),
    selectedCaseIds: new Set(),
    excludedCaseIds: new Set(),
  },
  previewCount: 0,
  previewEstimatedMinutes: 0,
  isPreviewLoading: false,
  projectId: null,
  suites: [],
  cases: [],
  environments: [],
  milestones: [],
  teamMembers: [],

  setStep: (step) => set({ currentStep: step }),
  
  nextStep: () => set((state) => {
    const newCompleted = new Set(state.completedSteps)
    newCompleted.add(state.currentStep)
    return {
      currentStep: Math.min(state.currentStep + 1, 3),
      completedSteps: newCompleted,
    }
  }),
  
  prevStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 1),
  })),
  
  markStepComplete: (step) => set((state) => {
    const newCompleted = new Set(state.completedSteps)
    newCompleted.add(step)
    return { completedSteps: newCompleted }
  }),

  updateConfiguration: (updates) => set((state) => ({
    configuration: { ...state.configuration, ...updates },
  })),

  toggleSuiteSelection: (suiteId, suites, cases) => set((state) => {
    const newSuiteIds = new Set(state.caseSelection.selectedSuiteIds)
    const newCaseIds = new Set(state.caseSelection.selectedCaseIds)
    
    const caseIds = getAllCaseIdsFromSuite(suiteId, suites, cases)
    const childSuiteIds = getAllChildSuiteIds(suiteId, suites)
    
    if (newSuiteIds.has(suiteId)) {
      // Deselect suite and all its cases
      newSuiteIds.delete(suiteId)
      childSuiteIds.forEach(id => newSuiteIds.delete(id))
      caseIds.forEach(id => newCaseIds.delete(id))
    } else {
      // Select suite and all its cases
      newSuiteIds.add(suiteId)
      childSuiteIds.forEach(id => newSuiteIds.add(id))
      caseIds.forEach(id => newCaseIds.add(id))
    }
    
    return {
      caseSelection: {
        ...state.caseSelection,
        selectedSuiteIds: newSuiteIds,
        selectedCaseIds: newCaseIds,
      },
    }
  }),

  toggleCaseSelection: (caseId) => set((state) => {
    const newCaseIds = new Set(state.caseSelection.selectedCaseIds)
    if (newCaseIds.has(caseId)) {
      newCaseIds.delete(caseId)
    } else {
      newCaseIds.add(caseId)
    }
    return {
      caseSelection: {
        ...state.caseSelection,
        selectedCaseIds: newCaseIds,
      },
    }
  }),

  excludeCase: (caseId) => set((state) => {
    const newExcluded = new Set(state.caseSelection.excludedCaseIds)
    const newSelected = new Set(state.caseSelection.selectedCaseIds)
    newExcluded.add(caseId)
    newSelected.delete(caseId)
    return {
      caseSelection: {
        ...state.caseSelection,
        selectedCaseIds: newSelected,
        excludedCaseIds: newExcluded,
      },
    }
  }),

  includeCase: (caseId) => set((state) => {
    const newExcluded = new Set(state.caseSelection.excludedCaseIds)
    const newSelected = new Set(state.caseSelection.selectedCaseIds)
    newExcluded.delete(caseId)
    newSelected.add(caseId)
    return {
      caseSelection: {
        ...state.caseSelection,
        selectedCaseIds: newSelected,
        excludedCaseIds: newExcluded,
      },
    }
  }),

  setIncludeOption: (option) => set((state) => ({
    caseSelection: {
      ...state.caseSelection,
      includeOption: option,
    },
  })),

  setSelectionFilters: (filters) => set((state) => ({
    caseSelection: {
      ...state.caseSelection,
      filters: { ...state.caseSelection.filters, ...filters },
    },
  })),

  clearSelection: () => set((state) => ({
    caseSelection: {
      ...initialCaseSelection,
      selectedSuiteIds: new Set(),
      selectedCaseIds: new Set(),
      excludedCaseIds: new Set(),
    },
    previewCount: 0,
    previewEstimatedMinutes: 0,
    isPreviewLoading: false,
  })),

  updatePreview: async () => {
    const callId = ++latestPreviewCall

    if (previewDebounceTimer) {
      clearTimeout(previewDebounceTimer)
      previewDebounceTimer = null
    }

    set({ isPreviewLoading: true })

    await new Promise<void>((resolve) => {
      previewDebounceTimer = setTimeout(() => {
        previewDebounceTimer = null
        resolve()
      }, 500)
    })

    if (callId !== latestPreviewCall) {
      return
    }

    const state = get()
    const projectId = state.projectId
    const { selectedSuiteIds, selectedCaseIds, excludedCaseIds, includeOption, filters } = state.caseSelection

    const hasSelection = selectedSuiteIds.size > 0 || selectedCaseIds.size > 0
    if (!projectId || !hasSelection) {
      set({
        previewCount: 0,
        previewEstimatedMinutes: 0,
        isPreviewLoading: false,
      })
      return
    }

    const apiFilters: Record<string, string> = {}
    const priorityFilter = includeOption === 'high-priority'
      ? 'HIGH'
      : (filters.priorities[0] ? toApiEnum(filters.priorities[0]) : undefined)

    if (priorityFilter) {
      apiFilters.priority = priorityFilter
    }

    if (filters.types[0]) {
      apiFilters.type = toApiEnum(filters.types[0])
    }

    if (filters.automationStatuses[0]) {
      apiFilters.automationStatus = toApiEnum(filters.automationStatuses[0])
    }

    const statusFromInclude = toPreviewStatus(includeOption)
    if (statusFromInclude) {
      apiFilters.status = statusFromInclude
    }

    try {
      const preview = await previewRunCases(projectId, {
        suiteIds: Array.from(selectedSuiteIds),
        caseIds: Array.from(selectedCaseIds),
        excludeIds: Array.from(excludedCaseIds),
        filters: Object.keys(apiFilters).length > 0 ? apiFilters : undefined,
      })

      if (callId !== latestPreviewCall) {
        return
      }

      set({
        previewCount: preview.count,
        previewEstimatedMinutes: preview.estimatedMinutes,
        isPreviewLoading: false,
      })
    } catch {
      if (callId !== latestPreviewCall) {
        return
      }

      set({ isPreviewLoading: false })
    }
  },

  submitWizard: async (projectId) => {
    const state = get()
    const { configuration, caseSelection } = state

    const runTypeMap: Record<RunType, 'MANUAL' | 'AUTOMATED' | 'HYBRID'> = {
      manual: 'MANUAL',
      automated: 'AUTOMATED',
      mixed: 'HYBRID',
    }

    const selectedEnvironment = state.environments.find((environment) => environment.id === configuration.environmentId)

    const createdRun = await createRun(projectId, {
      title: configuration.title,
      type: runTypeMap[configuration.runType],
      environment: configuration.newEnvironment || selectedEnvironment?.name || 'Staging',
      plannedStart: configuration.plannedStartDate?.toISOString(),
      dueDate: configuration.dueDate?.toISOString(),
      milestoneId: configuration.milestoneId || undefined,
      buildNumber: configuration.buildNumber || undefined,
      branch: configuration.branch || undefined,
      defaultAssigneeId: configuration.defaultAssigneeId || undefined,
      caseSelection: {
        suiteIds: Array.from(caseSelection.selectedSuiteIds),
        caseIds: Array.from(caseSelection.selectedCaseIds),
        queryFilters: {
          ...(caseSelection.filters.priorities[0]
            ? { priority: toApiEnum(caseSelection.filters.priorities[0]) }
            : {}),
          ...(caseSelection.filters.types[0]
            ? { type: toApiEnum(caseSelection.filters.types[0]) }
            : {}),
          ...(caseSelection.filters.automationStatuses[0]
            ? { automationStatus: toApiEnum(caseSelection.filters.automationStatuses[0]) }
            : {}),
          ...(toPreviewStatus(caseSelection.includeOption)
            ? { status: toPreviewStatus(caseSelection.includeOption) }
            : {}),
        },
        excludeIds: Array.from(caseSelection.excludedCaseIds),
      },
    })

    get().reset()
    return createdRun.id
  },

  setData: (data) => set(data),

  getSelectedCases: () => {
    const state = get()
    const { selectedCaseIds, excludedCaseIds, includeOption, filters } = state.caseSelection
    
    let filteredCases = state.cases.filter(c => 
      selectedCaseIds.has(c.id) && !excludedCaseIds.has(c.id)
    )
    
    // Apply include option
    switch (includeOption) {
      case 'failed-only':
        filteredCases = filteredCases.filter(c => c.status === 'failed')
        break
      case 'untested-only':
        filteredCases = filteredCases.filter(c => c.status === 'na' || c.status === 'skipped')
        break
      case 'high-priority':
        filteredCases = filteredCases.filter(c => c.priority === 'critical' || c.priority === 'high')
        break
    }
    
    // Apply filters
    if (filters.priorities.length > 0) {
      filteredCases = filteredCases.filter(c => filters.priorities.includes(c.priority))
    }
    if (filters.types.length > 0) {
      filteredCases = filteredCases.filter(c => filters.types.includes(c.type))
    }
    if (filters.automationStatuses.length > 0) {
      filteredCases = filteredCases.filter(c => filters.automationStatuses.includes(c.automationStatus))
    }
    
    return filteredCases
  },

  getEstimatedEffort: () => {
    const selectedCases = get().getSelectedCases()
    return selectedCases.reduce((sum, c) => sum + (c.estimatedTime || 0), 0)
  },

  getDuplicateSuites: () => {
    const state = get()
    const { selectedSuiteIds } = state.caseSelection
    const duplicates: string[] = []
    
    // Check for overlapping suites (ancestor-descendant relationships)
    const selectedArray = Array.from(selectedSuiteIds)
    for (let i = 0; i < selectedArray.length; i++) {
      for (let j = i + 1; j < selectedArray.length; j++) {
        if (isAncestorOf(selectedArray[i], selectedArray[j], state.suites)) {
          if (!duplicates.includes(selectedArray[j])) {
            duplicates.push(selectedArray[j])
          }
        } else if (isAncestorOf(selectedArray[j], selectedArray[i], state.suites)) {
          if (!duplicates.includes(selectedArray[i])) {
            duplicates.push(selectedArray[i])
          }
        }
      }
    }
    
    return duplicates
  },

  getCaseCountBySuite: () => {
    const state = get()
    const selectedCases = state.getSelectedCases()
    const countMap = new Map<string, number>()
    
    for (const testCase of selectedCases) {
      const current = countMap.get(testCase.suiteId) || 0
      countMap.set(testCase.suiteId, current + 1)
    }
    
    return countMap
  },

  reset: () => set({
    currentStep: 1,
    completedSteps: new Set(),
    configuration: { ...initialConfiguration },
    caseSelection: {
      ...initialCaseSelection,
      selectedSuiteIds: new Set(),
      selectedCaseIds: new Set(),
      excludedCaseIds: new Set(),
    },
    previewCount: 0,
    previewEstimatedMinutes: 0,
    isPreviewLoading: false,
  }),
}))

// Mock data for environments, milestones, and team members
export const mockEnvironments: Environment[] = [
  { id: 'env-1', name: 'Development', description: 'Local development environment' },
  { id: 'env-2', name: 'Staging', description: 'Pre-production staging environment' },
  { id: 'env-3', name: 'Production', description: 'Live production environment' },
  { id: 'env-4', name: 'QA', description: 'Quality assurance testing environment' },
]

export const mockMilestones: Milestone[] = [
  { id: 'ms-1', name: 'Sprint 23', dueDate: '2026-03-15' },
  { id: 'ms-2', name: 'Sprint 24', dueDate: '2026-03-29' },
  { id: 'ms-3', name: 'Release v2.5', dueDate: '2026-04-01' },
  { id: 'ms-4', name: 'Q1 2026 Release', dueDate: '2026-03-31' },
]

export const mockTeamMembers: TeamMember[] = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: 'user-3', name: 'Bob Wilson', email: 'bob@example.com' },
  { id: 'user-4', name: 'Alice Brown', email: 'alice@example.com' },
  { id: 'user-5', name: 'Charlie Davis', email: 'charlie@example.com' },
]
