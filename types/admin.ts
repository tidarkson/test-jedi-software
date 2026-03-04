// ============================================
// ADMIN PANEL TYPE DEFINITIONS
// ============================================

// User Role Types
export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer'
export type ProjectRole = 'manager' | 'engineer' | 'viewer'
export type InviteStatus = 'pending' | 'accepted' | 'expired'

// Organization Member
export interface OrgMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: OrgRole
  status: 'active' | 'inactive' | 'suspended'
  lastActiveAt: Date
  joinedAt: Date
}

// Invitation
export interface Invitation {
  id: string
  email: string
  role: OrgRole
  status: InviteStatus
  invitedBy: string
  invitedAt: Date
  expiresAt: Date
}

// Custom Field Types
export type CustomFieldType = 
  | 'text' 
  | 'textarea' 
  | 'select' 
  | 'multiselect' 
  | 'date' 
  | 'checkbox'

export type CustomFieldAppliesTo = 'case' | 'run' | 'both'

export interface CustomFieldOption {
  id: string
  label: string
  value: string
  color?: string
}

export interface CustomField {
  id: string
  name: string
  type: CustomFieldType
  required: boolean
  appliesTo: CustomFieldAppliesTo
  description?: string
  options?: CustomFieldOption[]
  order: number
  createdAt: Date
  updatedAt: Date
}

// Audit Log Types
export type AuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'archive'
  | 'restore'
  | 'assign'
  | 'unassign'
  | 'invite'
  | 'remove'
  | 'login'
  | 'logout'

export type AuditEntityType = 
  | 'test_case'
  | 'test_suite'
  | 'test_run'
  | 'project'
  | 'user'
  | 'custom_field'
  | 'integration'
  | 'settings'

export interface AuditLogEntry {
  id: string
  timestamp: Date
  userId: string
  userName: string
  userEmail: string
  action: AuditAction
  entityType: AuditEntityType
  entityId: string
  entityName?: string
  changes?: {
    before: Record<string, unknown>
    after: Record<string, unknown>
  }
  metadata?: Record<string, unknown>
  ipAddress?: string
}

// Data Retention Rule
export type RetentionAction = 'archive' | 'delete'

export interface DataRetentionRule {
  id: string
  name: string
  entityType: AuditEntityType
  condition: {
    olderThanDays: number
    status?: string[]
  }
  action: RetentionAction
  isActive: boolean
  lastRunAt?: Date
  createdAt: Date
}

// Project Settings
export interface ProjectSettings {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  isArchived: boolean
  members: ProjectMember[]
  customFields: CustomField[]
  createdAt: Date
  updatedAt: Date
}

export interface ProjectMember {
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  role: ProjectRole
  addedAt: Date
}

// Admin Context
export interface AdminContext {
  currentUser: OrgMember | null
  isAdmin: boolean
  isOwner: boolean
  canManageUsers: boolean
  canManageSettings: boolean
  canViewAuditLog: boolean
}
