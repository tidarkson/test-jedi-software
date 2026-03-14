import apiClient from './client'
import type { ApiSuccessResponse } from './types/common'
import type { IntegrationType, WebhookEvent } from '@/types/integrations'

export interface IntegrationConnectionDto {
  id: string
  provider: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  config: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
  expiresAt?: string | null
}

export interface IntegrationConfigRequest {
  config?: Record<string, unknown>
  accessToken?: string | null
  refreshToken?: string | null
  expiresAt?: string | null
  isActive?: boolean
}

export interface WebhookDeliveryDto {
  id: string
  timestamp: string
  status: 'success' | 'failed' | 'pending'
  statusCode?: number
  responseTime: number
  retryAttempt: number
  payload: Record<string, unknown>
  response?: Record<string, unknown>
}

export interface WebhookDto {
  id: string
  url: string
  events: WebhookEvent[]
  secret: string
  active: boolean
  lastDelivery?: string
  failureCount: number
  deliveries: WebhookDeliveryDto[]
  createdAt: string
  updatedAt: string
}

export interface WebhookRequest {
  url: string
  events: WebhookEvent[]
  secret: string
  active?: boolean
}

export interface AutomationImportRequest {
  results: unknown[]
}

export interface AutomationImportResponse {
  importId: string
  source: string
  totalResults: number
  matched: number
  unmatched: number
  unmatchedTitles: string[]
  summary: {
    total: number
    passed: number
    failed: number
    skipped: number
    blocked: number
  }
}

export interface NotificationRuleDto {
  id: string
  provider: 'SLACK' | 'TEAMS'
  channel: string
  enabledEvents: WebhookEvent[]
  failureThreshold?: number | null
  settings?: Record<string, unknown>
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface NotificationRuleRequest {
  provider: 'SLACK' | 'TEAMS'
  channel: string
  enabledEvents: WebhookEvent[]
  failureThreshold?: number
  settings?: Record<string, unknown>
  isActive?: boolean
}

const providerMap: Record<IntegrationType, string> = {
  jira: 'JIRA',
  github: 'GITHUB',
  gitlab: 'GITLAB',
  slack: 'SLACK',
  teams: 'TEAMS',
  azure_devops: 'CI',
}

const webhookEventToApiMap: Record<WebhookEvent, string> = {
  test_run_started: 'run.created',
  test_run_completed: 'run.closed',
  test_case_failed: 'case.failed',
  defect_created: 'defect.created',
  defect_updated: 'defect.created',
  custom_event: 'plan.approved',
}

const webhookEventFromApiMap: Record<string, WebhookEvent> = {
  'run.created': 'test_run_started',
  'run.closed': 'test_run_completed',
  'case.failed': 'test_case_failed',
  'defect.created': 'defect_created',
  'plan.approved': 'custom_event',
}

function toApiWebhookEvents(events: WebhookEvent[]): string[] {
  return events.map((event) => webhookEventToApiMap[event] ?? event)
}

function fromApiWebhookEvent(event: string): WebhookEvent {
  return webhookEventFromApiMap[event] ?? 'custom_event'
}

function getRawBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

function buildApiUrl(path: string): string {
  const baseUrl = normalizeBaseUrl(getRawBaseUrl())
  return `${baseUrl}${path}`
}

function mapIntegrationStatus(isActive: boolean): IntegrationConnectionDto['status'] {
  return isActive ? 'connected' : 'disconnected'
}

function mapIntegrationConnection(raw: Record<string, any>): IntegrationConnectionDto {
  return {
    id: String(raw.id),
    provider: String(raw.provider),
    status: mapIntegrationStatus(Boolean(raw.isActive)),
    config: (raw.settings ?? {}) as Record<string, unknown>,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    expiresAt: raw.expiresAt,
  }
}

function mapWebhookDelivery(raw: Record<string, any>): WebhookDeliveryDto {
  const rawStatus = String(raw.status ?? 'pending').toLowerCase()
  const normalizedStatus: WebhookDeliveryDto['status'] =
    rawStatus === 'success' || rawStatus === 'failed' ? rawStatus : 'pending'

  return {
    id: String(raw.id),
    timestamp: String(raw.createdAt ?? new Date().toISOString()),
    status: normalizedStatus,
    statusCode: typeof raw.responseCode === 'number' ? raw.responseCode : undefined,
    responseTime: Number(raw.durationMs ?? 0),
    retryAttempt: Number(raw.attempt ?? 0),
    payload: {
      event: fromApiWebhookEvent(String(raw.event ?? '')),
    },
    response: undefined,
  }
}

function mapWebhook(raw: Record<string, any>): WebhookDto {
  const deliveriesRaw = Array.isArray(raw.deliveries) ? raw.deliveries : []
  const deliveries = deliveriesRaw.map((delivery) => mapWebhookDelivery(delivery as Record<string, any>))

  return {
    id: String(raw.id),
    url: String(raw.url),
    events: (Array.isArray(raw.events) ? raw.events : []).map((event) => fromApiWebhookEvent(String(event))),
    secret: String(raw.secret ?? ''),
    active: Boolean(raw.isActive ?? true),
    lastDelivery: deliveries[0]?.timestamp,
    failureCount: deliveries.filter((delivery) => delivery.status === 'failed').length,
    deliveries,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
  }
}

function mapNotificationRule(raw: Record<string, any>): NotificationRuleDto {
  const provider = String(raw.provider ?? 'SLACK').toUpperCase() as NotificationRuleDto['provider']

  return {
    id: String(raw.id),
    provider: provider === 'TEAMS' ? 'TEAMS' : 'SLACK',
    channel: String(raw.channel ?? ''),
    enabledEvents: (Array.isArray(raw.enabledEvents) ? raw.enabledEvents : []).map((event) =>
      fromApiWebhookEvent(String(event))
    ),
    failureThreshold: typeof raw.failureThreshold === 'number' ? raw.failureThreshold : null,
    settings: (raw.settings ?? {}) as Record<string, unknown>,
    isActive: Boolean(raw.isActive ?? true),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

function toIntegrationProvider(type: IntegrationType): string {
  return providerMap[type]
}

export async function getProjectIntegrations(projectId: string): Promise<IntegrationConnectionDto[]> {
  const response = await apiClient.get<ApiSuccessResponse<unknown[]>>(`/projects/${projectId}/integrations`)
  const payload = Array.isArray(response.data.data) ? response.data.data : []
  return payload.map((item) => mapIntegrationConnection(item as Record<string, any>))
}

export async function updateProjectIntegration(
  projectId: string,
  provider: IntegrationType,
  request: IntegrationConfigRequest
): Promise<IntegrationConnectionDto> {
  const providerName = toIntegrationProvider(provider)

  const body = {
    provider: providerName,
    settings: request.config ?? {},
    accessToken: request.accessToken,
    refreshToken: request.refreshToken,
    expiresAt: request.expiresAt,
    isActive: request.isActive ?? true,
  }

  try {
    const directResponse = await apiClient.put<ApiSuccessResponse<unknown>>(
      `/projects/${projectId}/integrations/${providerName}`,
      body
    )
    return mapIntegrationConnection(directResponse.data.data as Record<string, any>)
  } catch {
    const fallbackResponse = await apiClient.put<ApiSuccessResponse<unknown>>(
      `/projects/${projectId}/integrations`,
      body
    )
    return mapIntegrationConnection(fallbackResponse.data.data as Record<string, any>)
  }
}

export async function disconnectProjectIntegration(projectId: string, provider: IntegrationType): Promise<void> {
  const providerName = toIntegrationProvider(provider)
  await apiClient.delete(`/projects/${projectId}/integrations/${providerName}`)
}

export function getJiraOAuthUrl(projectId: string): string {
  const query = new URLSearchParams({ projectId }).toString()
  return buildApiUrl(`/integrations/jira/connect?${query}`)
}

export async function completeJiraOAuthCallback(code: string, state: string): Promise<void> {
  await apiClient.get('/integrations/jira/callback', {
    params: { code, state },
  })
}

export async function getProjectWebhooks(projectId: string): Promise<WebhookDto[]> {
  const response = await apiClient.get<ApiSuccessResponse<unknown[]>>(`/projects/${projectId}/webhooks`)
  const payload = Array.isArray(response.data.data) ? response.data.data : []
  return payload.map((item) => mapWebhook(item as Record<string, any>))
}

export async function createProjectWebhook(projectId: string, request: WebhookRequest): Promise<WebhookDto> {
  const response = await apiClient.post<ApiSuccessResponse<unknown>>(`/projects/${projectId}/webhooks`, {
    url: request.url,
    secret: request.secret,
    events: toApiWebhookEvents(request.events),
    isActive: request.active ?? true,
  })

  return mapWebhook(response.data.data as Record<string, any>)
}

export async function updateProjectWebhook(
  projectId: string,
  webhookId: string,
  request: Partial<WebhookRequest>
): Promise<WebhookDto> {
  const body: Record<string, unknown> = {}

  if (request.url !== undefined) body.url = request.url
  if (request.secret !== undefined) body.secret = request.secret
  if (request.events !== undefined) body.events = toApiWebhookEvents(request.events)
  if (request.active !== undefined) body.isActive = request.active

  try {
    const response = await apiClient.patch<ApiSuccessResponse<unknown>>(
      `/projects/${projectId}/webhooks/${webhookId}`,
      body
    )
    return mapWebhook(response.data.data as Record<string, any>)
  } catch {
    const response = await apiClient.put<ApiSuccessResponse<unknown>>(
      `/projects/${projectId}/webhooks/${webhookId}`,
      body
    )
    return mapWebhook(response.data.data as Record<string, any>)
  }
}

export async function deleteProjectWebhook(projectId: string, webhookId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/webhooks/${webhookId}`)
}

export async function importAutomationResults(
  projectId: string,
  runId: string,
  request: AutomationImportRequest
): Promise<AutomationImportResponse> {
  const response = await apiClient.post<ApiSuccessResponse<AutomationImportResponse>>(
    `/projects/${projectId}/runs/${runId}/import-results`,
    request
  )

  return response.data.data
}

export async function getNotificationRules(projectId: string): Promise<NotificationRuleDto[]> {
  const response = await apiClient.get<ApiSuccessResponse<unknown[]>>(`/projects/${projectId}/notification-rules`)
  const payload = Array.isArray(response.data.data) ? response.data.data : []
  return payload.map((item) => mapNotificationRule(item as Record<string, any>))
}

export async function createNotificationRule(
  projectId: string,
  request: NotificationRuleRequest
): Promise<NotificationRuleDto> {
  const response = await apiClient.post<ApiSuccessResponse<unknown>>(
    `/projects/${projectId}/notification-rules`,
    {
      provider: request.provider,
      channel: request.channel,
      enabledEvents: toApiWebhookEvents(request.enabledEvents),
      failureThreshold: request.failureThreshold,
      settings: request.settings,
      isActive: request.isActive ?? true,
    }
  )

  return mapNotificationRule(response.data.data as Record<string, any>)
}
