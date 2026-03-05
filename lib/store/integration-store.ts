'use client'

import { create } from 'zustand'
import type { 
  Integration, 
  IntegrationType, 
  IntegrationStatus,
  Webhook,
  WebhookEvent,
  AutomationImportRecord,
} from '@/types/integrations'
import { 
  mockIntegrations, 
  mockWebhooks, 
  mockImportRecords 
} from '@/lib/data/mock-integration-data'

interface IntegrationState {
  // Integrations
  integrations: Integration[]
  selectedIntegration: Integration | null
  
  // Webhooks
  webhooks: Webhook[]
  selectedWebhook: Webhook | null
  
  // Import records
  importRecords: AutomationImportRecord[]
  
  // Dialog state
  configDialogOpen: boolean
  configDialogType: IntegrationType | null
  configDialogMode: 'connect' | 'configure'
  
  // Webhook dialog state
  webhookDialogOpen: boolean
  webhookDialogMode: 'create' | 'edit'
  
  // Loading state
  isLoading: boolean
  error: string | null
  
  // Actions - Integrations
  getIntegration: (type: IntegrationType) => Integration | undefined
  updateIntegrationStatus: (type: IntegrationType, status: IntegrationStatus) => void
  connectIntegration: (type: IntegrationType, config: Record<string, unknown>) => void
  disconnectIntegration: (type: IntegrationType) => void
  updateIntegration: (type: IntegrationType, config: Record<string, unknown>) => void
  
  // Actions - Webhooks
  addWebhook: (webhook: Omit<Webhook, 'id' | 'createdAt' | 'updatedAt' | 'deliveries'>) => void
  updateWebhook: (webhookId: string, updates: Partial<Webhook>) => void
  deleteWebhook: (webhookId: string) => void
  getWebhookDeliveries: (webhookId: string) => Webhook | undefined
  
  // Actions - Import
  addImportRecord: (record: Omit<AutomationImportRecord, 'id' | 'importedAt'>) => void
  updateImportRecord: (recordId: string, updates: Partial<AutomationImportRecord>) => void
  getImportRecord: (recordId: string) => AutomationImportRecord | undefined
  
  // Actions - Dialog
  openConfigDialog: (type: IntegrationType, mode?: 'connect' | 'configure') => void
  closeConfigDialog: () => void
  openWebhookDialog: (mode?: 'create' | 'edit', webhook?: Webhook) => void
  closeWebhookDialog: () => void
  
  // Actions - State
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetError: () => void
}

export const useIntegrationStore = create<IntegrationState>((set, get) => ({
  // Initial state
  integrations: mockIntegrations,
  selectedIntegration: null,
  webhooks: mockWebhooks,
  selectedWebhook: null,
  importRecords: mockImportRecords,
  configDialogOpen: false,
  configDialogType: null,
  configDialogMode: 'connect',
  webhookDialogOpen: false,
  webhookDialogMode: 'create',
  isLoading: false,
  error: null,
  
  // Integration actions
  getIntegration: (type) => {
    const { integrations } = get()
    return integrations.find((i) => i.type === type)
  },
  
  updateIntegrationStatus: (type, status) => {
    set((state) => ({
      integrations: state.integrations.map((i) =>
        i.type === type ? { ...i, status } : i
      ),
    }))
  },
  
  connectIntegration: (type, config) => {
    set((state) => ({
      integrations: state.integrations.map((i) =>
        i.type === type 
          ? ({ 
              ...i, 
              status: 'connected' as IntegrationStatus,
              config: { ...i.config, ...config } as any,
              connectedAt: new Date(),
            } as Integration) 
          : i
      ) as Integration[],
    }))
  },
  
  disconnectIntegration: (type) => {
    set((state) => ({
      integrations: state.integrations.map((i) =>
        i.type === type 
          ? { ...i, status: 'disconnected' as IntegrationStatus } 
          : i
      ),
    }))
  },
  
  updateIntegration: (type, config) => {
    set((state) => ({
      integrations: state.integrations.map((i) =>
        i.type === type 
          ? ({ 
              ...i, 
              config: { ...i.config, ...config } as any,
              updatedAt: new Date(),
            } as Integration) 
          : i
      ) as Integration[],
    }))
  },
  
  // Webhook actions
  addWebhook: (webhook) => {
    const newWebhook: Webhook = {
      ...webhook,
      id: `wh-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      deliveries: [],
    }
    set((state) => ({
      webhooks: [newWebhook, ...state.webhooks],
    }))
  },
  
  updateWebhook: (webhookId, updates) => {
    set((state) => ({
      webhooks: state.webhooks.map((w) =>
        w.id === webhookId 
          ? { ...w, ...updates, updatedAt: new Date() } 
          : w
      ),
    }))
  },
  
  deleteWebhook: (webhookId) => {
    set((state) => ({
      webhooks: state.webhooks.filter((w) => w.id !== webhookId),
    }))
  },
  
  getWebhookDeliveries: (webhookId) => {
    const { webhooks } = get()
    return webhooks.find((w) => w.id === webhookId)
  },
  
  // Import actions
  addImportRecord: (record) => {
    const newRecord: AutomationImportRecord = {
      ...record,
      id: `imp-${Date.now()}`,
      importedAt: new Date(),
    }
    set((state) => ({
      importRecords: [newRecord, ...state.importRecords],
    }))
  },
  
  updateImportRecord: (recordId, updates) => {
    set((state) => ({
      importRecords: state.importRecords.map((r) =>
        r.id === recordId ? { ...r, ...updates } : r
      ),
    }))
  },
  
  getImportRecord: (recordId) => {
    const { importRecords } = get()
    return importRecords.find((r) => r.id === recordId)
  },
  
  // Dialog actions
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
      selectedWebhook: webhook || null,
    })
  },
  
  closeWebhookDialog: () => {
    set({ 
      webhookDialogOpen: false, 
      selectedWebhook: null,
    })
  },
  
  // State actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  resetError: () => set({ error: null }),
}))
