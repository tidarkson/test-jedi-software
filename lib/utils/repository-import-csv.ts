import Papa from 'papaparse'
import type {
  RepositoryExportCase,
  RepositoryImportExportPayload,
  TestCaseAutomationStatusDto,
  TestCasePriorityDto,
  TestCaseSeverityDto,
  TestCaseTypeDto,
} from '@/lib/api/types/repository'

export type CsvImportRow = {
  Title?: string
  Description?: string
  Priority?: string
  Severity?: string
  Type?: string
  'Automation Status'?: string
  Steps?: string
  'Expected Result'?: string
  Tags?: string
}

interface CsvToRepositoryOptions {
  projectId: string
  projectName: string
  suiteName?: string
  suiteDescription?: string
}

const ALLOWED_PRIORITY: readonly TestCasePriorityDto[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const ALLOWED_SEVERITY: readonly TestCaseSeverityDto[] = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'TRIVIAL']
const ALLOWED_TYPE: readonly TestCaseTypeDto[] = [
  'FUNCTIONAL',
  'REGRESSION',
  'SMOKE',
  'INTEGRATION',
  'E2E',
  'PERFORMANCE',
  'SECURITY',
  'USABILITY',
]
const ALLOWED_AUTOMATION: readonly TestCaseAutomationStatusDto[] = [
  'MANUAL',
  'AUTOMATED',
  'PARTIALLY_AUTOMATED',
  'PENDING_AUTOMATION',
]

function normalizeEnum<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T
): T {
  const candidate = (value || '').toUpperCase() as T
  return allowed.includes(candidate) ? candidate : fallback
}

function buildCases(rows: CsvImportRow[]): RepositoryExportCase[] {
  return rows
    .filter((row) => row.Title && String(row.Title).trim().length > 0)
    .map((row) => ({
      title: String(row.Title).trim(),
      description: row.Description,
      priority: normalizeEnum(row.Priority, ALLOWED_PRIORITY, 'MEDIUM'),
      severity: normalizeEnum(row.Severity, ALLOWED_SEVERITY, 'MAJOR'),
      type: normalizeEnum(row.Type, ALLOWED_TYPE, 'FUNCTIONAL'),
      automationStatus: normalizeEnum(row['Automation Status'], ALLOWED_AUTOMATION, 'MANUAL'),
      status: 'ACTIVE',
      tags: row.Tags
        ? row.Tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
      steps: row.Steps
        ? row.Steps.split('\n').map((step, index) => ({
            index: index + 1,
            action: step,
            expectedResult: row['Expected Result'] || '',
          }))
        : [],
    }))
}

export function parseCsvToRepositoryPayload(
  csvText: string,
  options: CsvToRepositoryOptions
): RepositoryImportExportPayload {
  const parsed = Papa.parse<CsvImportRow>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
  })

  const cases = buildCases(parsed.data)

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    projectId: options.projectId,
    projectName: options.projectName,
    rootSuites: [
      {
        name: options.suiteName ?? 'Imported Suite',
        description: options.suiteDescription ?? 'Imported from CSV',
        status: 'ACTIVE',
        isLocked: false,
        cases,
        childSuites: [],
      },
    ],
  }
}
