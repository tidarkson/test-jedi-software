// ============================================
// TESTFORGE TYPE DEFINITIONS
// ============================================

// Navigation Types
export interface NavItem {
  title: string
  href: string
  icon?: string
  badge?: string | number
  disabled?: boolean
  children?: NavItem[]
}

export interface BreadcrumbItem {
  title: string
  href?: string
}

// Test Status Types
export type TestStatus = 
  | 'passed' 
  | 'failed' 
  | 'blocked' 
  | 'retest' 
  | 'skipped' 
  | 'na' 
  | 'deferred'

export interface TestCase {
  id: string
  title: string
  description?: string
  status: TestStatus
  priority: 'critical' | 'high' | 'medium' | 'low'
  assignee?: User
  labels?: string[]
  createdAt: Date
  updatedAt: Date
  estimatedTime?: number
  actualTime?: number
  steps?: TestStep[]
}

export interface TestStep {
  id: string
  order: number
  action: string
  expectedResult: string
  actualResult?: string
  status?: TestStatus
  attachments?: Attachment[]
}

export interface TestRun {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  testCases: TestCase[]
  environment?: string
  buildNumber?: string
  startedAt?: Date
  completedAt?: Date
  createdBy: User
  statistics: TestRunStatistics
}

export interface TestRunStatistics {
  total: number
  passed: number
  failed: number
  blocked: number
  retest: number
  skipped: number
  na: number
  deferred: number
  passRate: number
}

export interface TestSuite {
  id: string
  name: string
  description?: string
  testCases: TestCase[]
  parentId?: string
  children?: TestSuite[]
}

// User Types
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'manager' | 'engineer' | 'viewer'
}

// Project Types
export interface Project {
  id: string
  name: string
  key: string
  description?: string
  members: User[]
  testSuites: TestSuite[]
  testRuns: TestRun[]
  createdAt: Date
  updatedAt: Date
}

// Attachment Types
export interface Attachment {
  id: string
  name: string
  url: string
  type: 'image' | 'video' | 'document' | 'other'
  size: number
  uploadedAt: Date
  uploadedBy: User
}

// Component Props Types
export interface PageContainerProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
  children: React.ReactNode
}

export interface DataTableColumn<T> {
  key: keyof T | string
  title: string
  width?: number | string
  sortable?: boolean
  filterable?: boolean
  render?: (value: unknown, row: T) => React.ReactNode
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  loading?: boolean
  selectable?: boolean
  onRowClick?: (row: T) => void
  onSelectionChange?: (selectedRows: T[]) => void
  emptyMessage?: string
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
  }
}

// Filter & Sort Types
export interface FilterOption {
  label: string
  value: string
  count?: number
}

export interface SortOption {
  key: string
  direction: 'asc' | 'desc'
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
