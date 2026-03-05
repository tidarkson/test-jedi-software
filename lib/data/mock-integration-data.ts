import type {
  Integration,
  Webhook,
  WebhookDelivery,
  AutomationImportRecord,
  ImportedCase,
} from '@/types/integrations'

// Jira Integration
export const jiraIntegration: Integration = {
  id: 'jira-1',
  type: 'jira',
  name: 'Jira',
  description: 'Track defects and issues in Jira',
  icon: '🔵',
  logo: 'https://www.atlassian.com/blog/jira',
  status: 'connected',
  connectedAt: new Date('2025-01-15'),
  lastSyncAt: new Date('2025-03-05T10:30:00'),
  createdAt: new Date('2025-01-15'),
  updatedAt: new Date('2025-03-05'),
  config: {
    instanceUrl: 'https://company.atlassian.net',
    projectId: 'proj-123',
    projectKey: 'TEST',
    accessToken: 'jira-token-xxxx',
    autoCreateDefects: true,
    autoCreateTrigger: 'critical_failures_only',
    priorityFieldMapping: {
      critical: 'Highest',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    issueTypeMapping: {
      bug: '10000',
      task: '10001',
      epic: '10002',
    },
    customFieldMappings: {
      severity: 'customfield_10000',
      component: 'customfield_10001',
    },
  },
}

// GitHub Integration
export const githubIntegration: Integration = {
  id: 'github-1',
  type: 'github',
  name: 'GitHub',
  description: 'Connect to GitHub repositories and manage PRs',
  icon: '🐙',
  logo: 'https://github.com',
  status: 'connected',
  connectedAt: new Date('2025-02-01'),
  lastSyncAt: new Date('2025-03-04T14:20:00'),
  createdAt: new Date('2025-02-01'),
  updatedAt: new Date('2025-03-05'),
  config: {
    accessToken: 'github-token-xxxx',
    repositories: [
      {
        owner: 'company',
        name: 'test-automation',
        url: 'https://github.com/company/test-automation',
        defaultBranch: 'main',
      },
      {
        owner: 'company',
        name: 'ui-tests',
        url: 'https://github.com/company/ui-tests',
        defaultBranch: 'develop',
      },
    ],
    branchRules: [
      {
        id: 'rule-1',
        pattern: 'release/*',
        description: 'Release branches',
        enabled: true,
      },
      {
        id: 'rule-2',
        pattern: 'hotfix/*',
        description: 'Hotfix branches',
        enabled: true,
      },
    ],
    prCommentFormat: {
      template: 'Test Results: {passRate}% pass rate\nFailed: {failedCount}\nPassed: {passedCount}',
      includePassRate: true,
      includeFailedCases: true,
      includeCoverageMetrics: true,
    },
    statusCheckSettings: {
      enabled: true,
      name: 'Test Suite',
      targetUrl: 'https://test-jedi.example.com/runs',
      passThreshold: 80,
    },
  },
}

// GitLab Integration
export const gitlabIntegration: Integration = {
  id: 'gitlab-1',
  type: 'gitlab',
  name: 'GitLab',
  description: 'Integrate with GitLab for CI/CD and reporting',
  icon: '🦊',
  logo: 'https://gitlab.com',
  status: 'disconnected',
  createdAt: new Date('2025-01-20'),
  updatedAt: new Date('2025-03-05'),
  config: {
    accessToken: undefined,
    repositories: [],
    branchRules: [],
    prCommentFormat: {
      template: '',
      includePassRate: false,
      includeFailedCases: false,
      includeCoverageMetrics: false,
    },
    statusCheckSettings: {
      enabled: false,
      name: 'Test Suite',
      passThreshold: 80,
    },
    groupId: undefined,
  },
}

// Slack Integration
export const slackIntegration: Integration = {
  id: 'slack-1',
  type: 'slack',
  name: 'Slack',
  description: 'Send test notifications to Slack channels',
  icon: '💬',
  logo: 'https://slack.com',
  status: 'connected',
  connectedAt: new Date('2025-02-10'),
  lastSyncAt: new Date('2025-03-05T09:15:00'),
  createdAt: new Date('2025-02-10'),
  updatedAt: new Date('2025-03-05'),
  config: {
    workspaceId: 'T123456',
    accessToken: 'slack-token-xxxx',
    connectedChannels: [
      { id: 'C123456', name: 'testing', isPrivate: false },
      { id: 'C789012', name: 'ci-notifications', isPrivate: false },
    ],
    notificationRules: [
      {
        id: 'rule-1',
        event: 'run_completed',
        channels: [{ id: 'C123456', name: 'testing', isPrivate: false }],
        enabled: true,
      },
      {
        id: 'rule-2',
        event: 'high_failure_rate',
        channels: [{ id: 'C789012', name: 'ci-notifications', isPrivate: false }],
        enabled: true,
      },
      {
        id: 'rule-3',
        event: 'defect_created',
        channels: [{ id: 'C123456', name: 'testing', isPrivate: false }],
        enabled: false,
      },
    ],
  },
}

// Teams Integration
export const teamsIntegration: Integration = {
  id: 'teams-1',
  type: 'teams',
  name: 'Teams',
  description: 'Send test notifications to Microsoft Teams',
  icon: '👥',
  logo: 'https://teams.microsoft.com',
  status: 'disconnected',
  createdAt: new Date('2025-01-25'),
  updatedAt: new Date('2025-03-05'),
  config: {
    tenantId: undefined,
    accessToken: undefined,
    connectedChannels: [],
    notificationRules: [],
  },
}

// Azure DevOps Integration
export const azureIntegration: Integration = {
  id: 'azure-1',
  type: 'azure_devops',
  name: 'Azure DevOps',
  description: 'Integrate with Azure DevOps for boards and pipelines',
  icon: '☁️',
  logo: 'https://dev.azure.com',
  status: 'pending',
  createdAt: new Date('2025-02-20'),
  updatedAt: new Date('2025-03-05'),
  config: {
    organizationUrl: undefined,
    accessToken: undefined,
    projectId: undefined,
    projectName: undefined,
    repositories: [],
    boardIntegration: false,
  },
}

export const mockIntegrations: Integration[] = [
  jiraIntegration,
  githubIntegration,
  gitlabIntegration,
  slackIntegration,
  teamsIntegration,
  azureIntegration,
]

// Mock Webhooks
const mockDeliveries: WebhookDelivery[] = [
  {
    id: 'del-1',
    timestamp: new Date('2025-03-05T10:20:00'),
    status: 'success',
    statusCode: 200,
    payload: {
      event: 'test_run_completed',
      runId: 'run-123',
      totalTests: 150,
      passed: 145,
      failed: 5,
    },
    response: {
      success: true,
      processedAt: '2025-03-05T10:20:05Z',
    },
    responseTime: 150,
    retryAttempt: 0,
  },
  {
    id: 'del-2',
    timestamp: new Date('2025-03-05T09:50:00'),
    status: 'success',
    statusCode: 200,
    payload: {
      event: 'test_run_completed',
      runId: 'run-122',
      totalTests: 120,
      passed: 118,
      failed: 2,
    },
    response: {
      success: true,
      processedAt: '2025-03-05T09:50:08Z',
    },
    responseTime: 210,
    retryAttempt: 0,
  },
  {
    id: 'del-3',
    timestamp: new Date('2025-03-04T16:30:00'),
    status: 'failed',
    statusCode: 500,
    payload: {
      event: 'test_run_completed',
      runId: 'run-121',
      totalTests: 100,
      passed: 95,
      failed: 5,
    },
    response: {
      error: 'Internal Server Error',
    },
    responseTime: 5000,
    retryAttempt: 2,
  },
]

export const mockWebhooks: Webhook[] = [
  {
    id: 'wh-1',
    url: 'https://api.example.com/webhooks/test-runs',
    events: ['test_run_completed', 'test_run_started'],
    secret: 'secret-key-1234',
    active: true,
    lastDelivery: new Date('2025-03-05T10:20:00'),
    failureCount: 0,
    deliveries: mockDeliveries,
    createdAt: new Date('2025-02-15'),
    updatedAt: new Date('2025-03-05'),
  },
  {
    id: 'wh-2',
    url: 'https://analytics.example.com/events',
    events: ['test_case_failed', 'defect_created'],
    secret: 'secret-key-5678',
    active: true,
    lastDelivery: new Date('2025-03-05T08:00:00'),
    failureCount: 1,
    deliveries: [
      {
        id: 'del-4',
        timestamp: new Date('2025-03-05T08:00:00'),
        status: 'success',
        statusCode: 200,
        payload: {
          event: 'test_case_failed',
          caseId: 'case-456',
          runId: 'run-120',
        },
        response: {
          success: true,
        },
        responseTime: 120,
        retryAttempt: 0,
      },
    ],
    createdAt: new Date('2025-02-20'),
    updatedAt: new Date('2025-03-05'),
  },
  {
    id: 'wh-3',
    url: 'https://external.example.com/test-notifications',
    events: ['test_run_completed'],
    secret: 'secret-key-9012',
    active: false,
    failureCount: 5,
    deliveries: [],
    createdAt: new Date('2025-03-01'),
    updatedAt: new Date('2025-03-05'),
  },
]

// Mock Import Records
const mockImportedCases: ImportedCase[] = [
  {
    id: 'case-1',
    name: 'User login with valid credentials',
    matched: true,
    existingCaseId: 'tc-001',
    status: { passed: true, failed: false, blocked: false },
  },
  {
    id: 'case-2',
    name: 'User login with invalid password',
    matched: true,
    existingCaseId: 'tc-002',
    status: { passed: true, failed: false, blocked: false },
  },
  {
    id: 'case-3',
    name: 'API response validation',
    matched: false,
    status: { passed: true, failed: false, blocked: false },
  },
  {
    id: 'case-4',
    name: 'Database connection timeout',
    matched: false,
    status: { passed: false, failed: true, blocked: false },
  },
  {
    id: 'case-5',
    name: 'Checkout process with credit card',
    matched: true,
    existingCaseId: 'tc-045',
    status: { passed: true, failed: false, blocked: false },
  },
]

export const mockImportRecords: AutomationImportRecord[] = [
  {
    id: 'import-1',
    fileName: 'test-results-2025-03-05.json',
    importStatus: 'completed',
    runId: 'run-125',
    runName: 'Sprint 45 - UI Tests',
    totalCases: 5,
    matchedCases: 3,
    unmatchedCases: 2,
    importedCases: mockImportedCases,
    importedAt: new Date('2025-03-05T11:30:00'),
  },
  {
    id: 'import-2',
    fileName: 'test-results-2025-03-04.json',
    importStatus: 'completed',
    runId: 'run-124',
    runName: 'Sprint 45 - API Tests',
    totalCases: 8,
    matchedCases: 7,
    unmatchedCases: 1,
    importedCases: mockImportedCases.slice(0, 3),
    importedAt: new Date('2025-03-04T16:15:00'),
  },
  {
    id: 'import-3',
    fileName: 'test-results-2025-03-03.json',
    importStatus: 'failed',
    runId: 'run-123',
    runName: 'Sprint 45 - Integration Tests',
    totalCases: 0,
    matchedCases: 0,
    unmatchedCases: 0,
    importedCases: [],
    importedAt: new Date('2025-03-03T10:00:00'),
    error: 'Invalid JSON format: Expected array of test cases',
  },
]
