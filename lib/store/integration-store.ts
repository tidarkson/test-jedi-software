'use client'

import { create } from 'zustand'
import { ApiError } from '@/lib/api/errors'
import {
  createNotificationRule,
  createProjectWebhook,
  deleteProjectWebhook,
  disconnectProjectIntegration,
  getJiraOAuthUrl,
  getNotificationRules,
  getProjectIntegrations,
  getProjectWebhooks,
  importAutomationResults,
  updateProjectIntegration,
  updateProjectWebhook,
  type AutomationImportResponse,
  type NotificationRuleDto,
} from '@/lib/api/integrations'
import { useProjectStore } from './project-store'
import type {
  AutomationImportRecord,
  ImportedCase,
  Integration,
  IntegrationStatus,
  IntegrationType,
  SlackNotificationEvent,
  SlackNotificationRule,
  Webhook,
  WebhookEvent,
} from '@/types/integrations'

function now(): Date {
  return new Date()
}

function toDate(value: string | Date | null | undefined): Date | undefined {
  if (!value) return undefined
  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function resolveProjectId(explicitProjectId?: string): string | null {
  if (explicitProjectId) return explicitProjectId
  return useProjectStore.getState().currentProjectId
}

function toIntegrationType(provider: string): IntegrationType | null {
  switch (provider.toUpperCase()) {
    case 'JIRA':
      return 'jira'
    case 'GITHUB':
      return 'github'
    case 'GITLAB':
      return 'gitlab'
    case 'SLACK':
      return 'slack'
    case 'TEAMS':
      return 'teams'
    case 'CI':
      return 'azure_devops'
    default:
      return null
  }
}

function defaultIntegrations(): Integration[] {
  const createdAt = now()

  return [
    {
      id: 'jira',
      type: 'jira',
      name: 'Jira',
      description: 'Track defects and issues in Jira',
      icon: '🔵',
      status: 'disconnected',
      createdAt,
      updatedAt: createdAt,
      config: {
        instanceUrl: '',
        projectId: '',
        projectKey: '',
        autoCreateDefects: false,
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
        },
      },
    },
    {
      id: 'github',
      type: 'github',
      name: 'GitHub',
      description: 'Connect to GitHub repositories and manage PRs',
      icon: '🐙',
      status: 'disconnected',
      createdAt,
      updatedAt: createdAt,
      config: {
        repositories: [],
        branchRules: [],
        prCommentFormat: {
          template: '',
          includePassRate: true,
          includeFailedCases: true,
          includeCoverageMetrics: false,
        },
        statusCheckSettings: {
          enabled: false,
          name: 'Test Suite',
          passThreshold: 80,
        },
      },
    },
    {
      id: 'gitlab',
      type: 'gitlab',
      name: 'GitLab',
      description: 'Integrate with GitLab for CI/CD and reporting',
      icon: '🦊',
      status: 'disconnected',
      createdAt,
      updatedAt: createdAt,
      config: {
        repositories: [],
        branchRules: [],
        prCommentFormat: {
          template: '',
          includePassRate: true,
          includeFailedCases: true,
          includeCoverageMetrics: false,
        },
        statusCheckSettings: {
          enabled: false,
          name: 'Test Suite',
          passThreshold: 80,
        },
      },
    },
    {
      id: 'slack',
      type: 'slack',
      name: 'Slack',
      description: 'Send test notifications to Slack channels',
      icon: '💬',
      status: 'disconnected',
      createdAt,
      updatedAt: createdAt,
      config: {
        connectedChannels: [],
        notificationRules: [],
      },
    },
    {
      id: 'teams',
      type: 'teams',
      name: 'Teams',
      description: 'Send test notifications to Microsoft Teams',
      icon: '👥',
      status: 'disconnected',
      createdAt,
      updatedAt: createdAt,
      config: {
        connectedChannels: [],
        notificationRules: [],
      },
    },
    {
      id: 'azure-devops',
      type: 'azure_devops',
      name: 'Azure DevOps',
      description: 'Integrate with Azure DevOps for boards and pipelines',
      icon: '☁️',
      status: 'disconnected',
      createdAt,
      updatedAt: createdAt,
      config: {
        repositories: [],
        boardIntegration: false,
      },
    },
  ] as Integration[]
}

function toNotificationEvent(event: SlackNotificationEvent): WebhookEvent {
  switch (event) {
    case 'run_started':
      return 'test_run_started'
    case 'run_completed':
      return 'test_run_completed'
    case 'test_failed':
      return 'test_case_failed'
    case 'defect_created':
      return 'defect_created'
    default:
      return 'custom_event'
  }
}

function fromNotificationEvent(event: WebhookEvent): SlackNotificationEvent {
  switch (event) {
    case 'test_run_started':
      return 'run_started'
    case 'test_run_completed':
      return 'run_completed'
    case 'test_case_failed':
      return 'test_failed'
    case 'defect_created':
      return 'defect_created'
    default:
      return 'high_failure_rate'
  }
}

function mapNotificationRules(rules: NotificationRuleDto[], provider: 'SLACK' | 'TEAMS'): SlackNotificationRule[] {
  return rules
    .filter((rule) => rule.provider === provider)
    .map((rule) => ({
      id: rule.id,
      event: fromNotificationEvent(rule.enabledEvents[0] ?? 'custom_event'),
      channels: [
        {
          id: rule.channel,
          name: rule.channel,
          isPrivate: false,
        },
      ],
      enabled: rule.isActive,
    }))
}

async function saveNotificationRules(
  projectId: string,
  provider: 'SLACK' | 'TEAMS',
  rules: SlackNotificationRule[]
): Promise<void> {
  for (const rule of rules) {
    if (!rule.enabled || rule.channels.length === 0) continue

    for (const channel of rule.channels) {
      await createNotificationRule(projectId, {
        provider,
        channel: channel.name,
        enabledEvents: [toNotificationEvent(rule.event)],
        isActive: true,
      })
    }
  }
}

function mapImportCases(result: AutomationImportResponse): ImportedCase[] {
  const matched: ImportedCase[] = Array.from({ length: result.matched }).map((_, index) => ({
    id: `matched-${index + 1}`,
    name: `Matched case ${index + 1}`,
    matched: true,
    existingCaseId: `existing-${index + 1}`,
    status: {
      passed: true,
      failed: false,
      blocked: false,
    },
  }))

  const unmatched: ImportedCase[] = result.unmatchedTitles.map((title, index) => ({
    id: `unmatched-${index + 1}`,
    name: title,
    matched: false,
    status: {
      passed: false,
      failed: true,
      blocked: false,
    },
  }))

  return [...matched, ...unmatched]
}

interface IntegrationState {
  integrations: Integration[]
  selectedIntegration: Integration | null
  webhooks: Webhook[]
  selectedWebhook: Webhook | null
  importRecords: AutomationImportRecord[]
  notificationRules: NotificationRuleDto[]
  activeProjectId: string | null

  configDialogOpen: boolean
  configDialogType: IntegrationType | null
  configDialogMode: 'connect' | 'configure'

  webhookDialogOpen: boolean
  webhookDialogMode: 'create' | 'edit'

  isLoading: boolean
  error: string | null

  loadIntegrations: (projectId: string) => Promise<void>
  loadWebhooks: (projectId: string) => Promise<void>
  loadNotificationRules: (projectId: string) => Promise<void>

  getIntegration: (type: IntegrationType) => Integration | undefined
  updateIntegrationStatus: (type: IntegrationType, status: IntegrationStatus) => void
  connectIntegration: (type: IntegrationType, config: Record<string, unknown>, projectId?: string) => Promise<void>
  disconnectIntegration: (type: IntegrationType, projectId?: string) => Promise<void>
  updateIntegration: (type: IntegrationType, config: Record<string, unknown>, projectId?: string) => Promise<void>

  addWebhook: (
    webhook: Omit<Webhook, 'id' | 'createdAt' | 'updatedAt' | 'deliveries'>,
    projectId?: string
  ) => Promise<void>
  updateWebhook: (webhookId: string, updates: Partial<Webhook>, projectId?: string) => Promise<void>
  deleteWebhook: (webhookId: string, projectId?: string) => Promise<void>
  getWebhookDeliveries: (webhookId: string) => Webhook | undefined

  importAutomationRunResults: (args: {
    projectId?: string
    runId: string
    runName?: string
    fileName: string
    payload: unknown[]
  }) => Promise<AutomationImportResponse>
  addImportRecord: (record: Omit<AutomationImportRecord, 'id' | 'importedAt'>) => void
  updateImportRecord: (recordId: string, updates: Partial<AutomationImportRecord>) => void
  getImportRecord: (recordId: string) => AutomationImportRecord | undefined

  openConfigDialog: (type: IntegrationType, mode?: 'connect' | 'configure') => void
  closeConfigDialog: () => void
  openWebhookDialog: (mode?: 'create' | 'edit', webhook?: Webhook) => void
  closeWebhookDialog: () => void

  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetError: () => void
}

export const useIntegrationStore = create<IntegrationState>((set, get) => ({
  integrations: defaultIntegrations(),
  selectedIntegration: null,
  webhooks: [],
  selectedWebhook: null,
  importRecords: [],
  notificationRules: [],
  activeProjectId: null,

  configDialogOpen: false,
  configDialogType: null,
  configDialogMode: 'connect',

  webhookDialogOpen: false,
  webhookDialogMode: 'create',

  isLoading: false,
  error: null,

  loadIntegrations: async (projectId) => {
    set({ isLoading: true, error: null, activeProjectId: projectId })

    try {
      const [connections, rules] = await Promise.all([
        getProjectIntegrations(projectId),
        getNotificationRules(projectId),
      ])

      const slackRules = mapNotificationRules(rules, 'SLACK')
      const teamsRules = mapNotificationRules(rules, 'TEAMS')

      const integrations = defaultIntegrations().map((integration) => {
        const connected = connections.find((item) => toIntegrationType(item.provider) === integration.type)

        if (!connected) {
          return integration
        }

        if (integration.type === 'slack') {
          return {
            ...integration,
            id: connected.id,
            status: connected.status,
            connectedAt: connected.status === 'connected' ? toDate(connected.createdAt) : undefined,
            createdAt: toDate(connected.createdAt) ?? integration.createdAt,
            updatedAt: toDate(connected.updatedAt) ?? integration.updatedAt,
            config: {
              ...integration.config,
              ...(connected.config as Partial<typeof integration.config>),
              notificationRules: slackRules,
            },
          } as Integration
        }

        if (integration.type === 'teams') {
          return {
            ...integration,
            id: connected.id,
            status: connected.status,
            connectedAt: connected.status === 'connected' ? toDate(connected.createdAt) : undefined,
            createdAt: toDate(connected.createdAt) ?? integration.createdAt,
            updatedAt: toDate(connected.updatedAt) ?? integration.updatedAt,
            config: {
              ...integration.config,
              ...(connected.config as Partial<typeof integration.config>),
              notificationRules: teamsRules,
            },
          } as Integration
        }

        return {
          ...integration,
          id: connected.id,
          status: connected.status,
          connectedAt: connected.status === 'connected' ? toDate(connected.createdAt) : undefined,
          createdAt: toDate(connected.createdAt) ?? integration.createdAt,
          updatedAt: toDate(connected.updatedAt) ?? integration.updatedAt,
          config: connected.config as any,
        } as Integration
      })

      set({ integrations, notificationRules: rules, isLoading: false, error: null })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  loadWebhooks: async (projectId) => {
    set({ isLoading: true, error: null, activeProjectId: projectId })

    try {
      const data = await getProjectWebhooks(projectId)
      const webhooks: Webhook[] = data.map((item) => ({
        ...item,
        createdAt: toDate(item.createdAt) ?? now(),
        updatedAt: toDate(item.updatedAt) ?? now(),
        lastDelivery: toDate(item.lastDelivery),
        deliveries: item.deliveries.map((delivery) => ({
          ...delivery,
          timestamp: toDate(delivery.timestamp) ?? now(),
        })),
      }))

      set({ webhooks, isLoading: false, error: null })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  loadNotificationRules: async (projectId) => {
    try {
      const rules = await getNotificationRules(projectId)
      set({ notificationRules: rules })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ error: apiError.message })
      throw apiError
    }
  },

  getIntegration: (type) => {
    return get().integrations.find((integration) => integration.type === type)
  },

  updateIntegrationStatus: (type, status) => {
    set((state) => ({
      integrations: state.integrations.map((integration) =>
        integration.type === type ? { ...integration, status } : integration
      ),
    }))
  },

  connectIntegration: async (type, config, projectId) => {
    const resolvedProjectId = resolveProjectId(projectId)
    if (!resolvedProjectId) {
      throw new Error('Project context is required to connect integrations')
    }

    if (type === 'jira') {
      const oauthUrl = getJiraOAuthUrl(resolvedProjectId)
      window.location.href = oauthUrl
      return
    }

    await get().updateIntegration(type, config, resolvedProjectId)
  },

  disconnectIntegration: async (type, projectId) => {
    const resolvedProjectId = resolveProjectId(projectId)
    if (!resolvedProjectId) {
      throw new Error('Project context is required to disconnect integrations')
    }

    set({ isLoading: true, error: null })

    try {
      await disconnectProjectIntegration(resolvedProjectId, type)
      await get().loadIntegrations(resolvedProjectId)
      set({ isLoading: false, error: null })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  updateIntegration: async (type, config, projectId) => {
    const resolvedProjectId = resolveProjectId(projectId)
    if (!resolvedProjectId) {
      throw new Error('Project context is required to update integrations')
    }

    set({ isLoading: true, error: null })

    try {
      await updateProjectIntegration(resolvedProjectId, type, {
        config,
        isActive: true,
      })

      if (type === 'slack' || type === 'teams') {
        const rules = ((config as Record<string, unknown>).notificationRules ?? []) as SlackNotificationRule[]
        await saveNotificationRules(resolvedProjectId, type === 'slack' ? 'SLACK' : 'TEAMS', rules)
      }

      await get().loadIntegrations(resolvedProjectId)
      set({ isLoading: false, error: null })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  addWebhook: async (webhook, projectId) => {
    const resolvedProjectId = resolveProjectId(projectId)
    if (!resolvedProjectId) {
      throw new Error('Project context is required to add webhooks')
    }

    set({ isLoading: true, error: null })

    try {
      await createProjectWebhook(resolvedProjectId, {
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret,
        active: webhook.active,
      })
      await get().loadWebhooks(resolvedProjectId)
      set({ isLoading: false, error: null })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  updateWebhook: async (webhookId, updates, projectId) => {
    const resolvedProjectId = resolveProjectId(projectId)
    if (!resolvedProjectId) {
      throw new Error('Project context is required to update webhooks')
    }

    set({ isLoading: true, error: null })

    try {
      await updateProjectWebhook(resolvedProjectId, webhookId, {
        url: updates.url,
        events: updates.events,
        secret: updates.secret,
        active: updates.active,
      })
      await get().loadWebhooks(resolvedProjectId)
      set({ isLoading: false, error: null })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  deleteWebhook: async (webhookId, projectId) => {
    const resolvedProjectId = resolveProjectId(projectId)
    if (!resolvedProjectId) {
      throw new Error('Project context is required to delete webhooks')
    }

    set({ isLoading: true, error: null })

    try {
      await deleteProjectWebhook(resolvedProjectId, webhookId)
      set((state) => ({
        webhooks: state.webhooks.filter((item) => item.id !== webhookId),
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  getWebhookDeliveries: (webhookId) => {
    return get().webhooks.find((webhook) => webhook.id === webhookId)
  },

  importAutomationRunResults: async ({ projectId, runId, runName, fileName, payload }) => {
    const resolvedProjectId = resolveProjectId(projectId)
    if (!resolvedProjectId) {
      throw new Error('Project context is required to import run results')
    }

    set({ isLoading: true, error: null })

    try {
      const result = await importAutomationResults(resolvedProjectId, runId, {
        results: payload,
      })

      const record: AutomationImportRecord = {
        id: result.importId,
        fileName,
        importStatus: 'completed',
        runId,
        runName: runName ?? `Run ${runId}`,
        totalCases: result.totalResults,
        matchedCases: result.matched,
        unmatchedCases: result.unmatched,
        importedCases: mapImportCases(result),
        importedAt: now(),
      }

      set((state) => ({
        importRecords: [record, ...state.importRecords],
        isLoading: false,
        error: null,
      }))

      return result
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      const failedRecord: AutomationImportRecord = {
        id: `imp-failed-${Date.now()}`,
        fileName,
        importStatus: 'failed',
        runId,
        runName: runName ?? `Run ${runId}`,
        totalCases: payload.length,
        matchedCases: 0,
        unmatchedCases: payload.length,
        importedCases: [],
        importedAt: now(),
        error: apiError.message,
      }

      set((state) => ({
        importRecords: [failedRecord, ...state.importRecords],
        isLoading: false,
        error: apiError.message,
      }))

      throw apiError
    }
  },

  addImportRecord: (record) => {
    const newRecord: AutomationImportRecord = {
      ...record,
      id: `imp-${Date.now()}`,
      importedAt: now(),
    }

    set((state) => ({
      importRecords: [newRecord, ...state.importRecords],
    }))
  },

  updateImportRecord: (recordId, updates) => {
    set((state) => ({
      importRecords: state.importRecords.map((record) =>
        record.id === recordId ? { ...record, ...updates } : record
      ),
    }))
  },

  getImportRecord: (recordId) => {
    return get().importRecords.find((record) => record.id === recordId)
  },

  openConfigDialog: (type, mode = 'connect') => {
    set({
      configDialogOpen: true,
      configDialogType: type,
      configDialogMode: mode,
    })
  },

  closeConfigDialog: () => {
    set({
      configDialogOpen: false,
      configDialogType: null,
    })
  },

  openWebhookDialog: (mode = 'create', webhook) => {
    set({
      webhookDialogOpen: true,
      webhookDialogMode: mode,
      selectedWebhook: webhook ?? null,
    })
  },

  closeWebhookDialog: () => {
    set({
      webhookDialogOpen: false,
      selectedWebhook: null,
    })
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  resetError: () => set({ error: null }),
}))
