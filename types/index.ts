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
// Test Plan Types
export type PlanStatus = 'draft' | 'pending_approval' | 'approved' | 'deprecated'

export interface ReadinessMetrics {
  passRateWeight: number
  passRateScore: number
  completionWeight: number
  completionScore: number
  defectWeight: number
  defectPenalty: number
  overallScore: number
}

export interface PlanVersion {
  id: string
  version: number
  createdAt: Date
  createdBy: User
  changes?: string
}

export interface TestPlan {
  id: string
  name: string
  description?: string
  version: number
  status: PlanStatus
  milestone?: string
  linkedRuns: TestRun[]
  tags?: string[]
  readinessScore: number
  readinessMetrics: ReadinessMetrics
  passRate: number
  completionRate: number
  openDefects: number
  totalCases: number
  versions: PlanVersion[]
  createdAt: Date
  updatedAt: Date
  createdBy: User
  approvedBy?: User
}

export interface PassRateTrend {
  date: string
  passRate: number
  totalTests: number
  passedTests: number
}

// Run Dashboard Types
export type RunStatus = 'scheduled' | 'in_progress' | 'closed' | 'paused'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface RunMetrics {
  totalCases: number
  completedCases: number
  remainingCases: number
  passRate: number
  failRate: number
  estimatedTime: number // in minutes
  actualTime: number // in minutes
  defectCount: number
  riskScore: RiskLevel
  statusDistribution: {
    passed: number
    failed: number
    blocked: number
    retest: number
    skipped: number
    untested: number
  }
}

export interface TesterPerformance {
  id: string
  name: string
  assigned: number
  completed: number
  passRate: number
  avgTimePerCase: number // in minutes
  avatar?: string
}

export type ActivityAction = 
  | 'status_changed' 
  | 'case_completed' 
  | 'defect_logged' 
  | 'case_assigned' 
  | 'comment_added'
  | 'run_started'
  | 'run_closed'

export interface ActivityFeedItem {
  id: string
  action: ActivityAction
  actor: User
  description: string
  oldValue?: string | number
  newValue?: string | number
  createdAt: Date
  metadata?: Record<string, unknown>
}

export interface FailureDistributed {
  suiteName: string
  failureCount: number
  passRate: number
}

export interface RunDashboardData {
  id: string
  title: string
  description?: string
  environment: string
  buildNumber: string
  branch?: string
  status: RunStatus
  dueDate?: Date
  metrics: RunMetrics
  testerPerformance: TesterPerformance[]
  failureDistribution: FailureDistributed[]
  activityFeed: ActivityFeedItem[]
  createdBy: User
  createdAt: Date
  updatedAt: Date
}

// Analytics Types
export type DateRange = 'last_7d' | 'last_30d' | 'last_90d' | 'custom'

export interface DateRangeFilter {
  range: DateRange
  startDate?: Date
  endDate?: Date
}

// Quality Trends Tab
export interface PassFailTrend {
  date: string
  passed: number
  failed: number
  passRate: number
}

export interface FailureDistributionData {
  suiteName: string
  value: number
  percentage: number
}

export interface AutomationCoverageTrend {
  week: string
  coverage: number
  automated: number
  manual: number
}

// Suite Health Tab
export interface SuiteHealthHeatmap {
  suiteName: string
  suiteId: string
  failuresByWeek: number[]
  weekLabels: string[]
}

export interface SuiteHealthScore {
  suiteId: string
  suiteName: string
  totalCases: number
  lastRunDate: Date
  passRate: number
  flakyCount: number
  healthScore: number // 0-100
}

// Defect Analytics Tab
export interface DefectLeakageTrend {
  week: string
  leakageRate: number
  defectsLeaked: number
}

export interface DefectStatus {
  week: string
  open: number
  closed: number
}

export interface MTTRMetrics {
  current: number // hours
  average: number // hours
  trend: 'up' | 'down' | 'stable'
}

// Team Performance Tab
export interface WorkloadHeatmap {
  testerName: string
  testerId: string
  executionByDay: number[]
  dayLabels: string[]
}

export interface TesterLeaderboardEntry {
  testerId: string
  testerName: string
  completed: number
  passRate: number
  avgTimePerCase: number
  rank: number
}

export interface ExecutionVelocity {
  date: string
  executedCases: number
  velocity: number // cases per day
}

// Re-export integration types
export type {
  IntegrationType,
  IntegrationStatus,
  BaseIntegration,
  JiraConfiguration,
  JiraIntegration,
  JiraProject,
  GitHubConfiguration,
  GitHubIntegration,
  GitLabConfiguration,
  GitLabIntegration,
  SlackConfiguration,
  SlackIntegration,
  TeamsConfiguration,
  TeamsIntegration,
  AzureDevOpsConfiguration,
  AzureDevOpsIntegration,
  Integration,
  Webhook,
  WebhookEvent,
  WebhookDelivery,
  AutomationImportRecord,
  ImportedCase,
  IntegrationDialogState,
} from './integrations'

// Export Modal
export type ExportFormat = 'pdf' | 'xlsx'

export interface ExportSection {
  id: string
  title: string
  selected: boolean
}

export interface ExportOptions {
  format: ExportFormat
  sections: ExportSection[]
  generateSummary: boolean
  includeCharts: boolean
}

// Analytics Dashboard State
export interface AnalyticsData {
  qualityTrends: {
    passFailTrends: PassFailTrend[]
    failureDistribution: FailureDistributionData[]
    automationCoverage: AutomationCoverageTrend[]
  }
  suiteHealth: {
    heatmaps: SuiteHealthHeatmap[]
    healthScores: SuiteHealthScore[]
  }
  defectAnalytics: {
    leakageTrend: DefectLeakageTrend[]
    defectStatus: DefectStatus[]
    mttr: MTTRMetrics
  }
  teamPerformance: {
    workloadHeatmaps: WorkloadHeatmap[]
    leaderboard: TesterLeaderboardEntry[]
    velocity: ExecutionVelocity[]
  }
}