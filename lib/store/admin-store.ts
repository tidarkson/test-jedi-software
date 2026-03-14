'use client'

import { create } from 'zustand'
import type { OrgMember, Invitation, CustomField, AuditLogEntry, DataRetentionRule } from '@/types/admin'
import { ApiError } from '@/lib/api/errors'
import {
  createCustomField,
  createRetentionPolicy,
  deleteCustomField as deleteCustomFieldRequest,
  deleteOrgUser,
  getAuditLogs,
  getCustomFields,
  getOrgUsers,
  getRetentionPolicies,
  inviteOrgUser,
  updateCustomField as updateCustomFieldRequest,
  updateOrgUserRole,
  type AuditLogFilters,
} from '@/lib/api/admin'

type UserRole = 'owner' | 'admin' | 'member' | 'viewer'

interface AdminState {
  currentUser: OrgMember | null

  users: OrgMember[]
  invitations: Invitation[]
  customFields: CustomField[]
  auditLog: AuditLogEntry[]
  retentionRules: DataRetentionRule[]

  isUsersLoading: boolean
  isCustomFieldsLoading: boolean
  isAuditLogLoading: boolean
  isRetentionRulesLoading: boolean
  error: string | null

  setCurrentUser: (user: OrgMember | null) => void
  clearError: () => void
  isAdmin: () => boolean

  loadUsers: (orgId: string) => Promise<void>
  loadCustomFields: (orgId: string) => Promise<void>
  loadAuditLog: (orgId: string, filters?: AuditLogFilters) => Promise<void>
  loadRetentionRules: (orgId: string) => Promise<void>

  updateUserRole: (orgId: string, userId: string, role: UserRole) => Promise<void>
  removeUser: (orgId: string, userId: string) => Promise<void>

  addInvitation: (orgId: string, invitation: { email: string; role: UserRole; invitedBy?: string }) => Promise<void>
  cancelInvitation: (invitationId: string) => void
  resendInvitation: (invitationId: string) => void

  addCustomField: (
    orgId: string,
    field: Omit<CustomField, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<void>
  updateCustomField: (orgId: string, fieldId: string, updates: Partial<CustomField>) => Promise<void>
  deleteCustomField: (orgId: string, fieldId: string) => Promise<void>
  reorderCustomFields: (fieldIds: string[]) => void

  addRetentionRule: (orgId: string, rule: Omit<DataRetentionRule, 'id' | 'createdAt'>) => Promise<void>
  updateRetentionRule: (ruleId: string, updates: Partial<DataRetentionRule>) => void
  deleteRetentionRule: (ruleId: string) => void
  toggleRetentionRule: (ruleId: string) => void
}

export const useAdminStore = create<AdminState>((set, get) => ({
  currentUser: null,
  users: [],
  invitations: [],
  customFields: [],
  auditLog: [],
  retentionRules: [],
  isUsersLoading: false,
  isCustomFieldsLoading: false,
  isAuditLogLoading: false,
  isRetentionRulesLoading: false,
  error: null,

  setCurrentUser: (user) => set({ currentUser: user }),
  clearError: () => set({ error: null }),

  isAdmin: () => {
    const { currentUser } = get()
    return currentUser?.role === 'admin' || currentUser?.role === 'owner'
  },

  loadUsers: async (orgId) => {
    set({ isUsersLoading: true, error: null })

    try {
      const users = await getOrgUsers(orgId)
      set({ users, isUsersLoading: false, error: null })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isUsersLoading: false, error: apiError.message })
      throw apiError
    }
  },

  loadCustomFields: async (orgId) => {
    set({ isCustomFieldsLoading: true, error: null })

    try {
      const customFields = await getCustomFields(orgId)
      set({ customFields, isCustomFieldsLoading: false, error: null })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isCustomFieldsLoading: false, error: apiError.message })
      throw apiError
    }
  },

  loadAuditLog: async (orgId, filters) => {
    set({ isAuditLogLoading: true, error: null })

    try {
      const auditLog = await getAuditLogs(orgId, filters)
      set({ auditLog, isAuditLogLoading: false, error: null })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isAuditLogLoading: false, error: apiError.message })
      throw apiError
    }
  },

  loadRetentionRules: async (orgId) => {
    set({ isRetentionRulesLoading: true, error: null })

    try {
      const retentionRules = await getRetentionPolicies(orgId)
      set({ retentionRules, isRetentionRulesLoading: false, error: null })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isRetentionRulesLoading: false, error: apiError.message })
      throw apiError
    }
  },

  updateUserRole: async (orgId, userId, role) => {
    set({ error: null })

    try {
      await updateOrgUserRole(orgId, userId, role)
      set((state) => ({
        users: state.users.map((user) => (user.id === userId ? { ...user, role } : user)),
        error: null,
      }))
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ error: apiError.message })
      throw apiError
    }
  },

  removeUser: async (orgId, userId) => {
    set({ error: null })

    try {
      await deleteOrgUser(orgId, userId)
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
        error: null,
      }))
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ error: apiError.message })
      throw apiError
    }
  },

  addInvitation: async (orgId, invitation) => {
    set({ error: null })

    try {
      await inviteOrgUser(orgId, {
        email: invitation.email,
        role: invitation.role,
      })

      const newInvitation: Invitation = {
        id: `inv-${Date.now()}`,
        email: invitation.email,
        role: invitation.role,
        status: 'pending',
        invitedBy: invitation.invitedBy ?? 'You',
        invitedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }

      set((state) => ({
        invitations: [newInvitation, ...state.invitations],
        error: null,
      }))
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ error: apiError.message })
      throw apiError
    }
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
              invitedAt: new Date(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }
          : inv,
      ),
    }))
  },

  addCustomField: async (orgId, field) => {
    set({ error: null })

    try {
      const createdField = await createCustomField(orgId, {
        name: field.name,
        type: field.type,
        required: field.required,
        appliesTo: field.appliesTo,
        description: field.description,
        options: field.options,
        order: field.order,
      })

      set((state) => ({
        customFields: [...state.customFields, createdField],
        error: null,
      }))
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ error: apiError.message })
      throw apiError
    }
  },

  updateCustomField: async (orgId, fieldId, updates) => {
    set({ error: null })

    try {
      const updatedField = await updateCustomFieldRequest(orgId, fieldId, {
        name: updates.name,
        type: updates.type,
        required: updates.required,
        appliesTo: updates.appliesTo,
        description: updates.description,
        options: updates.options,
        order: updates.order,
      })

      set((state) => ({
        customFields: state.customFields.map((field) => (field.id === fieldId ? updatedField : field)),
        error: null,
      }))
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ error: apiError.message })
      throw apiError
    }
  },

  deleteCustomField: async (orgId, fieldId) => {
    set({ error: null })

    try {
      await deleteCustomFieldRequest(orgId, fieldId)
      set((state) => ({
        customFields: state.customFields.filter((field) => field.id !== fieldId),
        error: null,
      }))
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ error: apiError.message })
      throw apiError
    }
  },

  reorderCustomFields: (fieldIds) => {
    set((state) => ({
      customFields: fieldIds
        .map((id, index) => {
          const field = state.customFields.find((item) => item.id === id)
          return field ? { ...field, order: index } : null
        })
        .filter(Boolean) as CustomField[],
    }))
  },

  addRetentionRule: async (orgId, rule) => {
    set({ error: null })

    try {
      const createdRule = await createRetentionPolicy(orgId, {
        name: rule.name,
        entityType: rule.entityType,
        condition: rule.condition,
        action: rule.action,
        isActive: rule.isActive,
      })

      set((state) => ({
        retentionRules: [...state.retentionRules, createdRule],
        error: null,
      }))
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ error: apiError.message })
      throw apiError
    }
  },

  updateRetentionRule: (ruleId, updates) => {
    set((state) => ({
      retentionRules: state.retentionRules.map((rule) =>
        rule.id === ruleId ? { ...rule, ...updates, updatedAt: new Date() } : rule,
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
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule,
      ),
    }))
  },
}))
