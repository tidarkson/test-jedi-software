import type {
  OrgMember,
  Invitation,
  CustomField,
  AuditLogEntry,
  DataRetentionRule,
} from '@/types/admin'

// Current logged-in user (simulated as admin/owner)
export const currentUser: OrgMember = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: '/avatars/user.png',
  role: 'owner',
  status: 'active',
  lastActiveAt: new Date(),
  joinedAt: new Date('2024-01-15'),
}

// Organization Members
export const mockOrgMembers: OrgMember[] = [
  currentUser,
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'admin',
    status: 'active',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    joinedAt: new Date('2024-02-01'),
  },
  {
    id: 'user-3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'member',
    status: 'active',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    joinedAt: new Date('2024-03-10'),
  },
  {
    id: 'user-4',
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    role: 'member',
    status: 'active',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    joinedAt: new Date('2024-04-05'),
  },
  {
    id: 'user-5',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    role: 'viewer',
    status: 'inactive',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    joinedAt: new Date('2024-05-20'),
  },
]

// Pending Invitations
export const mockInvitations: Invitation[] = [
  {
    id: 'inv-1',
    email: 'new.member@example.com',
    role: 'member',
    status: 'pending',
    invitedBy: 'John Doe',
    invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
  },
  {
    id: 'inv-2',
    email: 'qa.engineer@example.com',
    role: 'member',
    status: 'pending',
    invitedBy: 'Jane Smith',
    invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6), // 6 days from now
  },
]

// Custom Fields
export const mockCustomFields: CustomField[] = [
  {
    id: 'cf-1',
    name: 'Test Environment',
    type: 'select',
    required: true,
    appliesTo: 'run',
    description: 'Target environment for test execution',
    options: [
      { id: 'opt-1', label: 'Development', value: 'dev', color: '#22c55e' },
      { id: 'opt-2', label: 'Staging', value: 'staging', color: '#f59e0b' },
      { id: 'opt-3', label: 'Production', value: 'prod', color: '#ef4444' },
    ],
    order: 1,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'cf-2',
    name: 'Browser',
    type: 'multiselect',
    required: false,
    appliesTo: 'case',
    description: 'Target browsers for testing',
    options: [
      { id: 'opt-4', label: 'Chrome', value: 'chrome' },
      { id: 'opt-5', label: 'Firefox', value: 'firefox' },
      { id: 'opt-6', label: 'Safari', value: 'safari' },
      { id: 'opt-7', label: 'Edge', value: 'edge' },
    ],
    order: 2,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: 'cf-3',
    name: 'Due Date',
    type: 'date',
    required: false,
    appliesTo: 'case',
    description: 'Expected completion date',
    order: 3,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
  {
    id: 'cf-4',
    name: 'Regression Test',
    type: 'checkbox',
    required: false,
    appliesTo: 'case',
    description: 'Mark if this is a regression test',
    order: 4,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10'),
  },
  {
    id: 'cf-5',
    name: 'Notes',
    type: 'textarea',
    required: false,
    appliesTo: 'both',
    description: 'Additional notes or comments',
    order: 5,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01'),
  },
  {
    id: 'cf-6',
    name: 'Reference ID',
    type: 'text',
    required: false,
    appliesTo: 'case',
    description: 'External reference or ticket ID',
    order: 6,
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-04-15'),
  },
]

// Audit Log Entries
export const mockAuditLog: AuditLogEntry[] = [
  {
    id: 'audit-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    action: 'update',
    entityType: 'test_case',
    entityId: 'tc-123',
    entityName: 'Login Validation Test',
    changes: {
      before: { status: 'draft', priority: 'medium' },
      after: { status: 'active', priority: 'high' },
    },
    ipAddress: '192.168.1.1',
  },
  {
    id: 'audit-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    action: 'create',
    entityType: 'test_run',
    entityId: 'tr-456',
    entityName: 'Sprint 24 Regression',
    changes: {
      before: {},
      after: { name: 'Sprint 24 Regression', environment: 'staging', testCaseCount: 45 },
    },
    ipAddress: '192.168.1.2',
  },
  {
    id: 'audit-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    userId: 'user-3',
    userName: 'Bob Johnson',
    userEmail: 'bob.johnson@example.com',
    action: 'delete',
    entityType: 'test_suite',
    entityId: 'ts-789',
    entityName: 'Deprecated Tests',
    changes: {
      before: { name: 'Deprecated Tests', testCount: 12 },
      after: {},
    },
    ipAddress: '192.168.1.3',
  },
  {
    id: 'audit-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    action: 'invite',
    entityType: 'user',
    entityId: 'inv-1',
    entityName: 'new.member@example.com',
    changes: {
      before: {},
      after: { email: 'new.member@example.com', role: 'member' },
    },
    ipAddress: '192.168.1.1',
  },
  {
    id: 'audit-5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    action: 'update',
    entityType: 'settings',
    entityId: 'settings-1',
    entityName: 'Project Settings',
    changes: {
      before: { defaultPriority: 'medium', autoArchiveDays: 30 },
      after: { defaultPriority: 'high', autoArchiveDays: 60 },
    },
    ipAddress: '192.168.1.2',
  },
  {
    id: 'audit-6',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    userId: 'user-4',
    userName: 'Alice Williams',
    userEmail: 'alice.williams@example.com',
    action: 'create',
    entityType: 'custom_field',
    entityId: 'cf-6',
    entityName: 'Reference ID',
    changes: {
      before: {},
      after: { name: 'Reference ID', type: 'text', required: false },
    },
    ipAddress: '192.168.1.4',
  },
  {
    id: 'audit-7',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    action: 'archive',
    entityType: 'project',
    entityId: 'proj-old',
    entityName: 'Legacy Project',
    changes: {
      before: { isArchived: false },
      after: { isArchived: true },
    },
    ipAddress: '192.168.1.1',
  },
  {
    id: 'audit-8',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    action: 'remove',
    entityType: 'user',
    entityId: 'user-removed',
    entityName: 'removed.user@example.com',
    changes: {
      before: { role: 'viewer', status: 'active' },
      after: {},
    },
    ipAddress: '192.168.1.2',
  },
]

// Data Retention Rules
export const mockRetentionRules: DataRetentionRule[] = [
  {
    id: 'ret-1',
    name: 'Archive Old Test Runs',
    entityType: 'test_run',
    condition: {
      olderThanDays: 90,
      status: ['completed'],
    },
    action: 'archive',
    isActive: true,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ret-2',
    name: 'Delete Archived Projects',
    entityType: 'project',
    condition: {
      olderThanDays: 365,
      status: ['archived'],
    },
    action: 'delete',
    isActive: false,
    createdAt: new Date('2024-02-15'),
  },
  {
    id: 'ret-3',
    name: 'Clean Up Old Audit Logs',
    entityType: 'settings',
    condition: {
      olderThanDays: 180,
    },
    action: 'delete',
    isActive: true,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    createdAt: new Date('2024-03-01'),
  },
]

// Helper to check if user can access admin
export function canAccessAdmin(role: string): boolean {
  return role === 'owner' || role === 'admin'
}

// Helper to format relative time (using ISO format for SSR consistency)
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  // Use consistent date format for SSR/client hydration
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
