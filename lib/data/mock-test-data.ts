import type { TestSuiteNode, TestCaseItem, TestStepItem, TestHistoryItem, TestCommentItem } from '@/lib/store/test-repository-store'
import type { TestStatus } from '@/types'

// Generate test suites with hierarchy
export const mockSuites: TestSuiteNode[] = [
  {
    id: 'suite-1',
    name: 'Authentication',
    description: 'User authentication test cases',
    parentId: null,
    order: 0,
    isLocked: false,
    isArchived: false,
    caseCount: 12,
    failureRate: 8.3,
    children: [
      {
        id: 'suite-1-1',
        name: 'Login',
        description: 'Login functionality tests',
        parentId: 'suite-1',
        order: 0,
        isLocked: false,
        isArchived: false,
        caseCount: 6,
        failureRate: 16.7,
        children: [],
      },
      {
        id: 'suite-1-2',
        name: 'Registration',
        description: 'User registration tests',
        parentId: 'suite-1',
        order: 1,
        isLocked: false,
        isArchived: false,
        caseCount: 4,
        failureRate: 0,
        children: [],
      },
      {
        id: 'suite-1-3',
        name: 'Password Reset',
        description: 'Password recovery flow tests',
        parentId: 'suite-1',
        order: 2,
        isLocked: true,
        isArchived: false,
        caseCount: 2,
        failureRate: 0,
        children: [],
      },
    ],
  },
  {
    id: 'suite-2',
    name: 'Dashboard',
    description: 'Dashboard feature tests',
    parentId: null,
    order: 1,
    isLocked: false,
    isArchived: false,
    caseCount: 18,
    failureRate: 5.6,
    children: [
      {
        id: 'suite-2-1',
        name: 'Widgets',
        description: 'Dashboard widget tests',
        parentId: 'suite-2',
        order: 0,
        isLocked: false,
        isArchived: false,
        caseCount: 8,
        failureRate: 12.5,
        children: [],
      },
      {
        id: 'suite-2-2',
        name: 'Analytics',
        description: 'Analytics display tests',
        parentId: 'suite-2',
        order: 1,
        isLocked: false,
        isArchived: false,
        caseCount: 10,
        failureRate: 0,
        children: [],
      },
    ],
  },
  {
    id: 'suite-3',
    name: 'API Integration',
    description: 'API endpoint integration tests',
    parentId: null,
    order: 2,
    isLocked: false,
    isArchived: false,
    caseCount: 24,
    failureRate: 4.2,
    children: [
      {
        id: 'suite-3-1',
        name: 'REST Endpoints',
        description: 'REST API tests',
        parentId: 'suite-3',
        order: 0,
        isLocked: false,
        isArchived: false,
        caseCount: 14,
        failureRate: 7.1,
        children: [
          {
            id: 'suite-3-1-1',
            name: 'GET Requests',
            description: 'GET endpoint tests',
            parentId: 'suite-3-1',
            order: 0,
            isLocked: false,
            isArchived: false,
            caseCount: 6,
            failureRate: 0,
            children: [],
          },
          {
            id: 'suite-3-1-2',
            name: 'POST Requests',
            description: 'POST endpoint tests',
            parentId: 'suite-3-1',
            order: 1,
            isLocked: false,
            isArchived: false,
            caseCount: 8,
            failureRate: 12.5,
            children: [],
          },
        ],
      },
      {
        id: 'suite-3-2',
        name: 'GraphQL',
        description: 'GraphQL query tests',
        parentId: 'suite-3',
        order: 1,
        isLocked: false,
        isArchived: false,
        caseCount: 10,
        failureRate: 0,
        children: [],
      },
    ],
  },
  {
    id: 'suite-4',
    name: 'E2E Workflows',
    description: 'End-to-end user workflow tests',
    parentId: null,
    order: 3,
    isLocked: false,
    isArchived: false,
    caseCount: 15,
    failureRate: 13.3,
    children: [],
  },
  {
    id: 'suite-5',
    name: 'Performance',
    description: 'Performance and load tests',
    parentId: null,
    order: 4,
    isLocked: false,
    isArchived: true,
    caseCount: 8,
    failureRate: 25,
    children: [],
  },
]

// Generate steps for a test case
function generateSteps(count: number): TestStepItem[] {
  const actions = [
    'Navigate to the page',
    'Enter valid credentials',
    'Click the submit button',
    'Verify the response',
    'Check the database',
    'Validate the UI state',
    'Capture screenshot',
    'Log out of the system',
  ]
  
  return Array.from({ length: count }, (_, i) => ({
    id: `step-${i + 1}`,
    order: i + 1,
    action: actions[i % actions.length],
    expectedResult: `Expected result for step ${i + 1}`,
    actualResult: i < count - 1 ? `Actual result matched expected` : undefined,
    status: i < count - 1 ? 'passed' : undefined,
  }))
}

// Generate history for a test case
function generateHistory(caseId: string): TestHistoryItem[] {
  const statuses: TestStatus[] = ['passed', 'passed', 'failed', 'passed', 'blocked', 'passed']
  const runners = ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown']
  
  return Array.from({ length: 5 }, (_, i) => ({
    id: `history-${caseId}-${i + 1}`,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000 * 3).toISOString(),
    status: statuses[i % statuses.length],
    runBy: runners[i % runners.length],
    duration: Math.floor(Math.random() * 120) + 30,
    notes: i === 2 ? 'Flaky test - needs investigation' : undefined,
  }))
}

// Generate comments for a test case
function generateComments(caseId: string): TestCommentItem[] {
  const comments = [
    'This test needs to be updated for the new UI',
    'Added additional validation steps',
    'Confirmed working in staging environment',
    'Blocked by JIRA-1234',
  ]
  const authors = ['John Doe', 'Jane Smith', 'Bob Wilson']
  
  return Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, i) => ({
    id: `comment-${caseId}-${i + 1}`,
    author: authors[i % authors.length],
    content: comments[i % comments.length],
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  }))
}

// Generate test cases
const priorities: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low']
const severities: Array<'blocker' | 'critical' | 'major' | 'minor' | 'trivial'> = ['blocker', 'critical', 'major', 'minor', 'trivial']
const types: Array<'functional' | 'regression' | 'smoke' | 'integration' | 'e2e' | 'performance'> = ['functional', 'regression', 'smoke', 'integration', 'e2e', 'performance']
const statuses: TestStatus[] = ['passed', 'failed', 'blocked', 'retest', 'skipped', 'na', 'deferred']
const automationStatuses: Array<'automated' | 'manual' | 'to-automate'> = ['automated', 'manual', 'to-automate']
const authors = ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown', 'Charlie Davis']
const tagPool = ['smoke', 'regression', 'critical-path', 'api', 'ui', 'mobile', 'desktop', 'performance', 'security']

const testCaseTitles = [
  'Verify user can login with valid credentials',
  'Verify error message for invalid password',
  'Verify remember me functionality',
  'Verify logout redirects to login page',
  'Verify session timeout after inactivity',
  'Verify password complexity requirements',
  'Verify email validation on registration',
  'Verify duplicate email rejection',
  'Verify password reset email delivery',
  'Verify dashboard loads within 3 seconds',
  'Verify widget drag and drop functionality',
  'Verify analytics data accuracy',
  'Verify API response format',
  'Verify rate limiting behavior',
  'Verify authentication token refresh',
  'Verify error handling for network failures',
  'Verify data pagination works correctly',
  'Verify search functionality returns accurate results',
  'Verify filter combinations work together',
  'Verify export functionality generates valid file',
]

// Get all suite IDs (flattened)
function getAllSuiteIds(suites: TestSuiteNode[]): string[] {
  return suites.reduce<string[]>((acc, suite) => {
    acc.push(suite.id)
    if (suite.children.length > 0) {
      acc.push(...getAllSuiteIds(suite.children))
    }
    return acc
  }, [])
}

const allSuiteIds = getAllSuiteIds(mockSuites)

export const mockCases: TestCaseItem[] = Array.from({ length: 50 }, (_, i) => {
  const caseId = `TC-${String(i + 1001).padStart(4, '0')}`
  const suiteId = allSuiteIds[i % allSuiteIds.length]
  const status = statuses[i % statuses.length]
  
  return {
    id: caseId,
    suiteId,
    title: testCaseTitles[i % testCaseTitles.length],
    description: `Detailed description for test case ${caseId}. This test verifies the expected behavior of the system under specific conditions.`,
    priority: priorities[i % priorities.length],
    severity: severities[i % severities.length],
    type: types[i % types.length],
    status,
    automationStatus: automationStatuses[i % automationStatuses.length],
    lastRunDate: status !== 'na' && status !== 'deferred' 
      ? new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString()
      : null,
    author: authors[i % authors.length],
    assignee: i % 3 === 0 ? authors[(i + 1) % authors.length] : undefined,
    tags: [tagPool[i % tagPool.length], tagPool[(i + 3) % tagPool.length]].filter((v, idx, arr) => arr.indexOf(v) === idx),
    estimatedTime: (Math.floor(Math.random() * 10) + 1) * 5,
    createdAt: new Date(Date.now() - (50 - i) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
    steps: generateSteps(Math.floor(Math.random() * 5) + 3),
    history: generateHistory(caseId),
    comments: generateComments(caseId),
  }
})

// Filter options for the UI
export const filterOptions = {
  priorities: [
    { label: 'Critical', value: 'critical' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ],
  severities: [
    { label: 'Blocker', value: 'blocker' },
    { label: 'Critical', value: 'critical' },
    { label: 'Major', value: 'major' },
    { label: 'Minor', value: 'minor' },
    { label: 'Trivial', value: 'trivial' },
  ],
  types: [
    { label: 'Functional', value: 'functional' },
    { label: 'Regression', value: 'regression' },
    { label: 'Smoke', value: 'smoke' },
    { label: 'Integration', value: 'integration' },
    { label: 'E2E', value: 'e2e' },
    { label: 'Performance', value: 'performance' },
  ],
  automationStatuses: [
    { label: 'Automated', value: 'automated' },
    { label: 'Manual', value: 'manual' },
    { label: 'To Automate', value: 'to-automate' },
  ],
  statuses: [
    { label: 'Passed', value: 'passed' },
    { label: 'Failed', value: 'failed' },
    { label: 'Blocked', value: 'blocked' },
    { label: 'Retest', value: 'retest' },
    { label: 'Skipped', value: 'skipped' },
    { label: 'N/A', value: 'na' },
    { label: 'Deferred', value: 'deferred' },
  ],
  tags: tagPool.map(tag => ({ label: tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' '), value: tag })),
}
