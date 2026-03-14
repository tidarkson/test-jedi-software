import type { TestCaseItem, TestStepItem, TestSuiteNode } from '@/lib/store/test-repository-store'
import type {
  SuiteDto,
  TestCaseCreateRequest,
  TestCaseDto,
  TestCaseStepRequest,
} from '@/lib/api/types/repository'

function toLowercaseEnum(value: string): string {
  return value.toLowerCase()
}

function fromApiStatusToTestStatus(value: string): TestCaseItem['status'] {
  const normalized = value.toLowerCase()

  switch (normalized) {
    case 'passed':
    case 'failed':
    case 'blocked':
    case 'retest':
    case 'skipped':
    case 'na':
    case 'deferred':
      return normalized
    case 'n/a':
      return 'na'
    default:
      // Repository statuses like ACTIVE/DRAFT/ARCHIVED are not execution outcomes.
      return 'na'
  }
}

function toAutomationStatusDto(
  value: TestCaseItem['automationStatus']
): TestCaseCreateRequest['automationStatus'] {
  switch (value) {
    case 'manual':
      return 'MANUAL'
    case 'automated':
      return 'AUTOMATED'
    case 'partially-automated':
      return 'PARTIALLY_AUTOMATED'
    case 'to-automate':
      return 'PENDING_AUTOMATION'
  }
}

function fromAutomationStatusDto(value: TestCaseDto['automationStatus']): TestCaseItem['automationStatus'] {
  switch (value) {
    case 'MANUAL':
      return 'manual'
    case 'AUTOMATED':
      return 'automated'
    case 'PARTIALLY_AUTOMATED':
      return 'partially-automated'
    case 'PENDING_AUTOMATION':
      return 'to-automate'
  }
}

function toUppercaseEnum(value: string): string {
  return value.replace(/-/g, '_').toUpperCase()
}

function assertRequiredString(
  value: string | undefined,
  fieldName: keyof TestCaseCreateRequest
): string {
  if (!value) {
    throw new Error(`Missing required field: ${fieldName}`)
  }

  return value
}

function stepRequestToItem(step: TestCaseStepRequest, index: number, testCaseId: string): TestStepItem {
  return {
    id: `${testCaseId}-step-${index + 1}`,
    order: step.order ?? index + 1,
    action: step.action,
    expectedResult: step.expectedResult,
  }
}

function stepItemToRequest(step: TestStepItem, index: number): TestCaseStepRequest {
  return {
    order: step.order ?? index + 1,
    action: step.action,
    expectedResult: step.expectedResult,
  }
}

export function suiteDtoToNode(dto: SuiteDto): TestSuiteNode {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? undefined,
    parentId: dto.parentSuiteId,
    order: dto.orderIndex,
    isLocked: dto.isLocked,
    isArchived: dto.isArchived,
    caseCount: dto.caseCount,
    failureRate: 0,
    children: [],
  }
}

export function buildSuiteTree(flatSuites: TestSuiteNode[]): TestSuiteNode[] {
  const nodeMap = new Map<string, TestSuiteNode>()

  for (const suite of flatSuites) {
    nodeMap.set(suite.id, {
      ...suite,
      children: [],
    })
  }

  const roots: TestSuiteNode[] = []

  for (const suite of nodeMap.values()) {
    if (suite.parentId && nodeMap.has(suite.parentId)) {
      nodeMap.get(suite.parentId)?.children.push(suite)
      continue
    }

    roots.push(suite)
  }

  const sortNodes = (nodes: TestSuiteNode[]): TestSuiteNode[] =>
    nodes
      .sort((left, right) => left.order - right.order)
      .map((node) => ({
        ...node,
        children: sortNodes(node.children),
      }))

  return sortNodes(roots)
}

export function caseDtoToItem(dto: TestCaseDto): TestCaseItem {
  return {
    id: dto.id,
    suiteId: dto.suiteId,
    title: dto.title,
    description: dto.description ?? undefined,
    preconditions: dto.preconditions ?? undefined,
    postconditions: dto.postconditions ?? undefined,
    priority: toLowercaseEnum(dto.priority) as TestCaseItem['priority'],
    severity: toLowercaseEnum(dto.severity) as TestCaseItem['severity'],
    type: toLowercaseEnum(dto.type) as TestCaseItem['type'],
    automationStatus: fromAutomationStatusDto(dto.automationStatus),
    status: fromApiStatusToTestStatus(dto.status),
    tags: dto.tags ?? [],
    steps: (dto.steps ?? []).map((step, index) => stepRequestToItem(step, index, dto.id)),
    estimatedTime: dto.estimatedTime ?? undefined,
    lastRunDate: null,
    author: '',
    assignee: undefined,
    createdAt: '',
    updatedAt: '',
    history: [],
    comments: [],
  }
}

export function caseItemToCreateRequest(item: Partial<TestCaseItem>): TestCaseCreateRequest {
  const suiteId = assertRequiredString(item.suiteId, 'suiteId')
  const title = assertRequiredString(item.title, 'title')
  const priority = assertRequiredString(item.priority, 'priority')
  const severity = assertRequiredString(item.severity, 'severity')
  const type = assertRequiredString(item.type, 'type')

  return {
    suiteId,
    title,
    description: item.description,
    preconditions: item.preconditions,
    postconditions: item.postconditions,
    priority: toUppercaseEnum(priority) as TestCaseCreateRequest['priority'],
    severity: toUppercaseEnum(severity) as TestCaseCreateRequest['severity'],
    type: toUppercaseEnum(type) as TestCaseCreateRequest['type'],
    automationStatus: item.automationStatus
      ? toAutomationStatusDto(item.automationStatus)
      : undefined,
    tags: item.tags,
    steps: item.steps?.map(stepItemToRequest),
    estimatedTime: item.estimatedTime,
  }
}
