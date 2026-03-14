import apiClient from './client'
import type { ApiSuccessResponse } from './types/common'
import type {
  AuditAction,
  AuditEntityType,
  AuditLogEntry,
  CustomField,
  CustomFieldAppliesTo,
  CustomFieldOption,
  CustomFieldType,
  DataRetentionRule,
  OrgMember,
  OrgRole,
} from '@/types/admin'

interface AdminApiEnvelope<T> {
  status?: string
  code?: number
  data?: T
}

type MaybeEnvelope<T> = T | ApiSuccessResponse<T> | AdminApiEnvelope<T>

type RawRole = OrgRole | string | null | undefined

type RawMember = Record<string, unknown>
type RawCustomField = Record<string, unknown>
type RawAuditLog = Record<string, unknown>
type RawRetentionRule = Record<string, unknown>

export interface InviteUserPayload {
  email: string
  role: OrgRole
}

export interface AcceptInvitationPayload {
  token: string
  name: string
  password: string
}

export interface CreateCustomFieldPayload {
  name: string
  type: CustomFieldType
  required: boolean
  appliesTo: CustomFieldAppliesTo
  description?: string
  options?: CustomFieldOption[]
  order?: number
}

export interface UpdateCustomFieldPayload extends Partial<CreateCustomFieldPayload> {}

export interface AuditLogFilters {
  userId?: string
  entityType?: AuditEntityType
  action?: AuditAction
  dateFrom?: string
  dateTo?: string
}

export interface CreateRetentionPolicyPayload {
  name: string
  entityType: AuditEntityType
  condition: {
    olderThanDays: number
    status?: string[]
  }
  action: 'archive' | 'delete'
  isActive?: boolean
}

function unwrap<T>(payload: MaybeEnvelope<T>): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as AdminApiEnvelope<T>).data !== undefined
  ) {
    return (payload as AdminApiEnvelope<T>).data as T
  }

  return payload as T
}

function parseDate(value: unknown): Date {
  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  return new Date()
}

function normalizeRole(value: RawRole): OrgRole {
  const normalized = String(value ?? '').toLowerCase()

  if (normalized === 'owner') return 'owner'
  if (normalized === 'admin') return 'admin'
  if (normalized === 'member') return 'member'
  return 'viewer'
}

function normalizeMemberStatus(status: unknown): OrgMember['status'] {
  const normalized = String(status ?? '').toLowerCase()

  if (normalized === 'inactive') {
    return 'inactive'
  }

  if (normalized === 'suspended') {
    return 'suspended'
  }

  return 'active'
}

function normalizeMember(raw: RawMember): OrgMember {
  const email = String(raw.email ?? '')
  const name = String(raw.name ?? email.split('@')[0] ?? 'Unknown User')

  return {
    id: String(raw.id ?? raw.userId ?? ''),
    name,
    email,
    avatar: typeof raw.avatar === 'string' ? raw.avatar : undefined,
    role: normalizeRole(raw.role as RawRole),
    status: normalizeMemberStatus(raw.status),
    lastActiveAt: parseDate(raw.lastActiveAt ?? raw.lastSeenAt ?? raw.updatedAt),
    joinedAt: parseDate(raw.joinedAt ?? raw.createdAt),
  }
}

function normalizeCustomFieldType(value: unknown): CustomFieldType {
  const normalized = String(value ?? '').toLowerCase()

  if (normalized === 'textarea') return 'textarea'
  if (normalized === 'select') return 'select'
  if (normalized === 'multiselect') return 'multiselect'
  if (normalized === 'date') return 'date'
  if (normalized === 'checkbox') return 'checkbox'
  return 'text'
}

function normalizeAppliesTo(value: unknown): CustomFieldAppliesTo {
  const normalized = String(value ?? '').toLowerCase()

  if (normalized === 'run') return 'run'
  if (normalized === 'both') return 'both'
  return 'case'
}

function normalizeCustomFieldOption(option: unknown): CustomFieldOption {
  const candidate = (option ?? {}) as Record<string, unknown>
  const label = String(candidate.label ?? candidate.value ?? '')

  return {
    id: String(candidate.id ?? candidate.value ?? Math.random().toString(36).slice(2)),
    label,
    value: String(candidate.value ?? label),
    color: typeof candidate.color === 'string' ? candidate.color : undefined,
  }
}

function normalizeCustomField(raw: RawCustomField): CustomField {
  const options = Array.isArray(raw.options)
    ? raw.options.map(normalizeCustomFieldOption)
    : undefined

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    type: normalizeCustomFieldType(raw.type),
    required: Boolean(raw.required),
    appliesTo: normalizeAppliesTo(raw.appliesTo),
    description: typeof raw.description === 'string' ? raw.description : undefined,
    options,
    order: typeof raw.order === 'number' ? raw.order : 0,
    createdAt: parseDate(raw.createdAt),
    updatedAt: parseDate(raw.updatedAt),
  }
}

function normalizeAuditAction(value: unknown): AuditAction {
  const normalized = String(value ?? '').toLowerCase() as AuditAction

  const validActions: AuditAction[] = [
    'create',
    'update',
    'delete',
    'archive',
    'restore',
    'assign',
    'unassign',
    'invite',
    'remove',
    'login',
    'logout',
  ]

  if (validActions.includes(normalized)) {
    return normalized
  }

  return 'update'
}

function normalizeAuditEntityType(value: unknown): AuditEntityType {
  const normalized = String(value ?? '').toLowerCase() as AuditEntityType

  const validEntityTypes: AuditEntityType[] = [
    'test_case',
    'test_suite',
    'test_run',
    'project',
    'user',
    'custom_field',
    'integration',
    'settings',
  ]

  if (validEntityTypes.includes(normalized)) {
    return normalized
  }

  return 'settings'
}

function normalizeAuditLogEntry(raw: RawAuditLog): AuditLogEntry {
  return {
    id: String(raw.id ?? ''),
    timestamp: parseDate(raw.timestamp ?? raw.createdAt),
    userId: String(raw.userId ?? ''),
    userName: String(raw.userName ?? raw.actorName ?? 'Unknown User'),
    userEmail: String(raw.userEmail ?? raw.actorEmail ?? ''),
    action: normalizeAuditAction(raw.action),
    entityType: normalizeAuditEntityType(raw.entityType),
    entityId: String(raw.entityId ?? ''),
    entityName: typeof raw.entityName === 'string' ? raw.entityName : undefined,
    changes:
      raw.changes && typeof raw.changes === 'object'
        ? {
            before: ((raw.changes as Record<string, unknown>).before ?? {}) as Record<string, unknown>,
            after: ((raw.changes as Record<string, unknown>).after ?? {}) as Record<string, unknown>,
          }
        : undefined,
    metadata: raw.metadata as Record<string, unknown> | undefined,
    ipAddress: typeof raw.ipAddress === 'string' ? raw.ipAddress : undefined,
  }
}

function normalizeRetentionRule(raw: RawRetentionRule): DataRetentionRule {
  const condition = (raw.condition ?? {}) as Record<string, unknown>

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    entityType: normalizeAuditEntityType(raw.entityType),
    condition: {
      olderThanDays: Number(condition.olderThanDays ?? 0),
      status: Array.isArray(condition.status) ? (condition.status as string[]) : undefined,
    },
    action: String(raw.action ?? '').toLowerCase() === 'delete' ? 'delete' : 'archive',
    isActive: Boolean(raw.isActive),
    lastRunAt: raw.lastRunAt ? parseDate(raw.lastRunAt) : undefined,
    createdAt: parseDate(raw.createdAt),
  }
}

export async function getOrgUsers(orgId: string): Promise<OrgMember[]> {
  const response = await apiClient.get<MaybeEnvelope<RawMember[]>>(`/admin/orgs/${orgId}/users`)
  const payload = unwrap(response.data)

  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map(normalizeMember)
}

export async function inviteOrgUser(orgId: string, payload: InviteUserPayload): Promise<void> {
  await apiClient.post<MaybeEnvelope<Record<string, never>>>(`/admin/orgs/${orgId}/users/invite`, payload)
}

export async function updateOrgUserRole(orgId: string, userId: string, role: OrgRole): Promise<void> {
  await apiClient.put<MaybeEnvelope<Record<string, never>>>(`/admin/orgs/${orgId}/users/${userId}/role`, {
    role,
  })
}

export async function deleteOrgUser(orgId: string, userId: string): Promise<void> {
  await apiClient.delete<MaybeEnvelope<Record<string, never>>>(`/admin/orgs/${orgId}/users/${userId}`)
}

export async function acceptInvitation(payload: AcceptInvitationPayload): Promise<void> {
  await apiClient.post<MaybeEnvelope<Record<string, never>>>('/admin/auth/accept-invitation', payload)
}

export async function getCustomFields(orgId: string): Promise<CustomField[]> {
  const response = await apiClient.get<MaybeEnvelope<RawCustomField[]>>(`/admin/orgs/${orgId}/custom-fields`)
  const payload = unwrap(response.data)

  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map(normalizeCustomField)
}

export async function createCustomField(orgId: string, payload: CreateCustomFieldPayload): Promise<CustomField> {
  const response = await apiClient.post<MaybeEnvelope<RawCustomField>>(`/admin/orgs/${orgId}/custom-fields`, payload)
  return normalizeCustomField(unwrap(response.data))
}

export async function updateCustomField(
  orgId: string,
  fieldId: string,
  payload: UpdateCustomFieldPayload,
): Promise<CustomField> {
  const response = await apiClient.put<MaybeEnvelope<RawCustomField>>(
    `/admin/orgs/${orgId}/custom-fields/${fieldId}`,
    payload,
  )

  return normalizeCustomField(unwrap(response.data))
}

export async function deleteCustomField(orgId: string, fieldId: string): Promise<void> {
  await apiClient.delete<MaybeEnvelope<Record<string, never>>>(`/admin/orgs/${orgId}/custom-fields/${fieldId}`)
}

export async function getAuditLogs(orgId: string, filters: AuditLogFilters = {}): Promise<AuditLogEntry[]> {
  const response = await apiClient.get<MaybeEnvelope<RawAuditLog[]>>(`/admin/orgs/${orgId}/audit-logs`, {
    params: {
      userId: filters.userId || undefined,
      entityType: filters.entityType || undefined,
      action: filters.action || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    },
  })

  const payload = unwrap(response.data)

  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map(normalizeAuditLogEntry)
}

export async function exportAuditLogsCsv(orgId: string, filters: AuditLogFilters = {}): Promise<Blob> {
  const response = await apiClient.get<Blob>(`/admin/orgs/${orgId}/audit-logs/export/csv`, {
    params: {
      userId: filters.userId || undefined,
      entityType: filters.entityType || undefined,
      action: filters.action || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    },
    responseType: 'blob',
  })

  return response.data
}

export async function getRetentionPolicies(orgId: string): Promise<DataRetentionRule[]> {
  const response = await apiClient.get<MaybeEnvelope<RawRetentionRule[]>>(`/admin/orgs/${orgId}/retention-policies`)
  const payload = unwrap(response.data)

  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map(normalizeRetentionRule)
}

export async function createRetentionPolicy(
  orgId: string,
  payload: CreateRetentionPolicyPayload,
): Promise<DataRetentionRule> {
  const response = await apiClient.post<MaybeEnvelope<RawRetentionRule>>(
    `/admin/orgs/${orgId}/retention-policies`,
    payload,
  )

  return normalizeRetentionRule(unwrap(response.data))
}
