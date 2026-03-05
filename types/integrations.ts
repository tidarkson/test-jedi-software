// ============================================
// INTEGRATIONS TYPE DEFINITIONS
// ============================================

// Integration Base Types
export type IntegrationType = 
  | 'jira' 
  | 'github' 
  | 'gitlab' 
  | 'slack' 
  | 'teams' 
  | 'azure_devops'

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending'

export interface BaseIntegration {
  id: string
  type: IntegrationType
  status: IntegrationStatus
  name: string
  description: string
  icon: string
  logo?: string
  connectedAt?: Date
  lastSyncAt?: Date
  createdAt: Date
  updatedAt: Date
}

// JIRA Integration
export type JiraAutoCreateTrigger = 'any_failure' | 'critical_failures_only'

export interface JiraProject {
  id: string
  key: string
  name: string
  description?: string
}

export interface JiraPriorityFieldMapping {
  critical: string
  high: string
  medium: string
  low: string
}

export interface JiraIssueTypeMapping {
  bug: string
  task: string
  epic?: string
}

export interface JiraConfiguration {
  instanceUrl: string
  projectId: string
  projectKey: string
  accessToken?: string
  autoCreateDefects: boolean
  autoCreateTrigger: JiraAutoCreateTrigger
  priorityFieldMapping: JiraPriorityFieldMapping
  issueTypeMapping: JiraIssueTypeMapping
  customFieldMappings?: Record<string, string>
}

export interface JiraIntegration extends BaseIntegration {
  type: 'jira'
  config: JiraConfiguration
}

// GitHub/GitLab Integration (same config structure)
export interface RepositoryConfig {
  owner: string
  name: string
  url: string
  defaultBranch: string
}

export interface BranchMatchingRule {
  id: string
  pattern: string
  description?: string
  enabled: boolean
}

export interface PRCommentFormat {
  template: string
  includePassRate: boolean
  includeFailedCases: boolean
  includeCoverageMetrics: boolean
}

export interface StatusCheckSettings {
  enabled: boolean
  name: string
  targetUrl?: string
  passThreshold: number // percentage
}

export interface GitHubConfiguration {
  accessToken?: string
  repositories: RepositoryConfig[]
  branchRules: BranchMatchingRule[]
  prCommentFormat: PRCommentFormat
  statusCheckSettings: StatusCheckSettings
}

export interface GitHubIntegration extends BaseIntegration {
  type: 'github'
  config: GitHubConfiguration
}

export interface GitLabConfiguration extends GitHubConfiguration {
  groupId?: string
}

export interface GitLabIntegration extends BaseIntegration {
  type: 'gitlab'
  config: GitLabConfiguration
}

// Slack Integration
export type SlackNotificationEvent = 
  | 'run_completed' 
  | 'defect_created' 
  | 'test_failed' 
  | 'test_passed'
  | 'run_started'
  | 'high_failure_rate'

export interface SlackChannel {
  id: string
  name: string
  isPrivate: boolean
}

export interface SlackNotificationRule {
  id: string
  event: SlackNotificationEvent
  channels: SlackChannel[]
  enabled: boolean
}

export interface SlackConfiguration {
  workspaceId?: string
  accessToken?: string
  connectedChannels: SlackChannel[]
  notificationRules: SlackNotificationRule[]
}

export interface SlackIntegration extends BaseIntegration {
  type: 'slack'
  config: SlackConfiguration
}

// Teams Integration (similar to Slack)
export interface TeamsChannel {
  id: string
  name: string
}

export interface TeamsNotificationRule {
  id: string
  event: SlackNotificationEvent
  channels: TeamsChannel[]
  enabled: boolean
}

export interface TeamsConfiguration {
  tenantId?: string
  accessToken?: string
  connectedChannels: TeamsChannel[]
  notificationRules: TeamsNotificationRule[]
}

export interface TeamsIntegration extends BaseIntegration {
  type: 'teams'
  config: TeamsConfiguration
}

// Azure DevOps Integration
export interface AzureDevOpsConfiguration {
  organizationUrl?: string
  accessToken?: string
  projectId?: string
  projectName?: string
  repositories: RepositoryConfig[]
  boardIntegration: boolean
}

export interface AzureDevOpsIntegration extends BaseIntegration {
  type: 'azure_devops'
  config: AzureDevOpsConfiguration
}

// Union type for all integrations
export type Integration = 
  | JiraIntegration 
  | GitHubIntegration 
  | GitLabIntegration 
  | SlackIntegration 
  | TeamsIntegration 
  | AzureDevOpsIntegration

// Webhook Types
export type WebhookEvent = 
  | 'test_run_started' 
  | 'test_run_completed' 
  | 'test_case_failed' 
  | 'defect_created' 
  | 'defect_updated'
  | 'custom_event'

export type WebhookStatus = 'success' | 'failed' | 'pending'

export interface WebhookDelivery {
  id: string
  timestamp: Date
  status: WebhookStatus
  statusCode?: number
  payload: Record<string, unknown>
  response?: Record<string, unknown>
  responseTime: number // ms
  retryAttempt: number
}

export interface Webhook {
  id: string
  url: string
  events: WebhookEvent[]
  secret: string
  active: boolean
  lastDelivery?: Date
  failureCount: number
  deliveries: WebhookDelivery[]
  createdAt: Date
  updatedAt: Date
}

// Automation Import Types
export type ImportStatus = 'draft' | 'in_progress' | 'completed' | 'failed'

export interface ImportedCase {
  id: string
  name: string
  matched: boolean
  existingCaseId?: string
  status: TestStatus
}

export interface TestStatus {
  passed: boolean
  failed: boolean
  blocked: boolean
}

export interface AutomationImportRecord {
  id: string
  fileName: string
  importStatus: ImportStatus
  runId: string
  runName: string
  totalCases: number
  matchedCases: number
  unmatchedCases: number
  importedCases: ImportedCase[]
  importedAt: Date
  error?: string
}

// Configuration Dialog State
export interface IntegrationDialogState {
  type: IntegrationType
  open: boolean
  mode: 'connect' | 'configure'
  integration?: Integration
}

// OAuth State
export interface OAuthState {
  state: string
  integrationId: string
  timestamp: number
}

// Test Connection Result
export interface TestConnectionResult {
  success: boolean
  message: string
  details?: Record<string, unknown>
}
