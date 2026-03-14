const tagPool = ['api', 'ui', 'smoke', 'regression', 'critical-path', 'mobile']

export const testRepositoryFilterOptions = {
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
    { label: 'Partially Automated', value: 'partially-automated' },
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
  tags: tagPool.map((tag) => ({
    label: tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' '),
    value: tag,
  })),
}
