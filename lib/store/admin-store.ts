'use client'

import { create } from 'zustand'
import type { OrgMember, Invitation, CustomField, AuditLogEntry, DataRetentionRule } from '@/types/admin'
import { currentUser, mockOrgMembers, mockInvitations, mockCustomFields, mockAuditLog, mockRetentionRules } from '@/lib/data/mock-admin-data'

type UserRole = 'owner' | 'admin' | 'member' | 'viewer'

interface AdminState {
  // Current user (for role-based access)
  currentUser: OrgMember | null
  
  // Users management
  users: OrgMember[]
  invitations: Invitation[]
  
  // Custom fields
  customFields: CustomField[]
  
  // Audit log
  auditLog: AuditLogEntry[]
  
  // Retention rules
  retentionRules: DataRetentionRule[]
  
  // Actions
  setCurrentUser: (user: OrgMember | null) => void
  isAdmin: () => boolean
  
  // User actions
  updateUserRole: (userId: string, role: UserRole) => void
  removeUser: (userId: string) => void
  
  // Invitation actions
  addInvitation: (invitation: Omit<Invitation, 'id' | 'invitedAt' | 'expiresAt'>) => void
  cancelInvitation: (invitationId: string) => void
  resendInvitation: (invitationId: string) => void
  
  // Custom field actions
  addCustomField: (field: Omit<CustomField, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void
  updateCustomField: (fieldId: string, updates: Partial<CustomField>) => void
  deleteCustomField: (fieldId: string) => void
  reorderCustomFields: (fieldIds: string[]) => void
  
  // Retention rule actions
  addRetentionRule: (rule: Omit<DataRetentionRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void
  updateRetentionRule: (ruleId: string, updates: Partial<DataRetentionRule>) => void
  deleteRetentionRule: (ruleId: string) => void
  toggleRetentionRule: (ruleId: string) => void
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // Initial state - set current user as admin for demo
  currentUser: currentUser,
  users: mockOrgMembers,
  invitations: mockInvitations,
  customFields: mockCustomFields,
  auditLog: mockAuditLog,
  retentionRules: mockRetentionRules,
  
  // Current user actions
  setCurrentUser: (user) => set({ currentUser: user }),
  
  isAdmin: () => {
    const { currentUser } = get()
    return currentUser?.role === 'admin' || currentUser?.role === 'owner'
  },
  
  // User management actions
  updateUserRole: (userId, role) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, role } : user
      ),
    }))
  },
  
  removeUser: (userId) => {
    set((state) => ({
      users: state.users.filter((user) => user.id !== userId),
    }))
  },
  
  // Invitation actions
  addInvitation: (invitation) => {
    const newInvitation: Invitation = {
      ...invitation,
      id: `inv-${Date.now()}`,
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
    set((state) => ({
      invitations: [newInvitation, ...state.invitations],
    }))
  },
  
  cancelInvitation: (invitationId) => {
    set((state) => ({
      invitations: state.invitations.filter((inv) => inv.id !== invitationId),
    }))
  },
  
  resendInvitation: (invitationId) => {
    set((state) => ({
      invitations: state.invitations.map((inv) =>
        inv.id === invitationId
          ? {
              ...inv,
              invitedAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            }
          : inv
      ),
    }))
  },
  
  // Custom field actions
  addCustomField: (field) => {
    const { currentUser, customFields } = get()
    const newField: CustomField = {
      ...field,
      id: `cf-${Date.now()}`,
      order: customFields.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'unknown',
    }
    set((state) => ({
      customFields: [...state.customFields, newField],
    }))
  },
  
  updateCustomField: (fieldId, updates) => {
    set((state) => ({
      customFields: state.customFields.map((field) =>
        field.id === fieldId
          ? { ...field, ...updates, updatedAt: new Date().toISOString() }
          : field
      ),
    }))
  },
  
  deleteCustomField: (fieldId) => {
    set((state) => ({
      customFields: state.customFields.filter((field) => field.id !== fieldId),
    }))
  },
  
  reorderCustomFields: (fieldIds) => {
    set((state) => ({
      customFields: fieldIds.map((id, index) => {
        const field = state.customFields.find((f) => f.id === id)
        return field ? { ...field, order: index } : null
      }).filter(Boolean) as CustomField[],
    }))
  },
  
  // Retention rule actions
  addRetentionRule: (rule) => {
    const { currentUser } = get()
    const newRule: DataRetentionRule = {
      ...rule,
      id: `rr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'unknown',
    }
    set((state) => ({
      retentionRules: [...state.retentionRules, newRule],
    }))
  },
  
  updateRetentionRule: (ruleId, updates) => {
    set((state) => ({
      retentionRules: state.retentionRules.map((rule) =>
        rule.id === ruleId
          ? { ...rule, ...updates, updatedAt: new Date().toISOString() }
          : rule
      ),
    }))
  },
  
  deleteRetentionRule: (ruleId) => {
    set((state) => ({
      retentionRules: state.retentionRules.filter((rule) => rule.id !== ruleId),
    }))
  },
  
  toggleRetentionRule: (ruleId) => {
    set((state) => ({
      retentionRules: state.retentionRules.map((rule) =>
        rule.id === ruleId
          ? { ...rule, isActive: !rule.isActive }
          : rule
      ),
    }))
  },
}))
