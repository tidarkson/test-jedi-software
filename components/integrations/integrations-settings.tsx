'use client'

import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  IntegrationGrid,
  JiraConfigDrawer,
  GitHubGitLabConfigDrawer,
  SlackConfigDrawer,
  WebhookTable,
  WebhookFormDrawer,
  WebhookLogsDrawer,
  AutomationImportPanel,
} from '@/components/integrations'
import { Plug, Webhook, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useIntegrationStore } from '@/lib/store/integration-store'
import type { IntegrationType, Webhook as WebhookType } from '@/types/integrations'

export function IntegrationsSettings() {
  const {
    integrations,
    webhooks,
    importRecords,
    connectIntegration,
    disconnectIntegration,
    updateIntegration,
    addWebhook,
    deleteWebhook,
  } = useIntegrationStore()

  // Config dialogs
  const [configDialogOpen, setConfigDialogOpen] = React.useState(false)
  const [configDialogType, setConfigDialogType] = React.useState<IntegrationType | null>(null)
  const [configDialogMode, setConfigDialogMode] = React.useState<'connect' | 'configure'>(
    'connect'
  )

  // Webhook dialogs
  const [webhookFormOpen, setWebhookFormOpen] = React.useState(false)
  const [webhookLogsOpen, setWebhookLogsOpen] = React.useState(false)
  const [selectedWebhook, setSelectedWebhook] = React.useState<WebhookType | undefined>()

  // Import dialog
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)

  const handleConnectIntegration = (type: IntegrationType) => {
    setConfigDialogType(type)
    setConfigDialogMode('connect')
    setConfigDialogOpen(true)
  }

  const handleConfigureIntegration = (type: IntegrationType) => {
    setConfigDialogType(type)
    setConfigDialogMode('configure')
    setConfigDialogOpen(true)
  }

  const handleIntegrationConnect = (config: any) => {
    if (!configDialogType) return

    connectIntegration(configDialogType, config)
    setConfigDialogOpen(false)
    toast.success(`${configDialogType} connected successfully`)
  }

  const handleAddWebhook = () => {
    setSelectedWebhook(undefined)
    setWebhookFormOpen(true)
  }

  const handleEditWebhook = (webhook: WebhookType) => {
    setSelectedWebhook(webhook)
    setWebhookFormOpen(true)
  }

  const handleSaveWebhook = (webhookData: any) => {
    if (selectedWebhook) {
      // Update existing webhook
      toast.success('Webhook updated')
    } else {
      // Create new webhook
      addWebhook(webhookData)
      toast.success('Webhook created')
    }
  }

  const handleDeleteWebhook = (webhookId: string) => {
    deleteWebhook(webhookId)
    toast.success('Webhook deleted')
  }

  const handleViewWebhookLogs = (webhook: WebhookType) => {
    setSelectedWebhook(webhook)
    setWebhookLogsOpen(true)
  }

  const handleImportSuccess = async (data: { runId: string; cases: any[] }) => {
    // Simulate import
    await new Promise((resolve) => setTimeout(resolve, 2000))
    toast.success('Test results imported successfully')
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations" className="gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            <span className="hidden sm:inline">Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="imports" className="gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Imports</span>
          </TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Available Integrations
              </CardTitle>
              <CardDescription>
                Connect third-party tools to enhance your test management workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IntegrationGrid
                integrations={integrations}
                onConnect={handleConnectIntegration}
                onConfigure={handleConfigureIntegration}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Management
              </CardTitle>
              <CardDescription>
                Set up webhooks to receive real-time notifications about test events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebhookTable
                webhooks={webhooks}
                onAdd={handleAddWebhook}
                onEdit={handleEditWebhook}
                onDelete={handleDeleteWebhook}
                onViewLogs={handleViewWebhookLogs}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Imports Tab */}
        <TabsContent value="imports" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Test Results
                </CardTitle>
                <CardDescription>
                  Import automation test results from JSON files or paste raw JSON data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => setImportDialogOpen(true)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2 w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4" />
                  Start Import
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Import Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Imports</p>
                  <p className="text-2xl font-bold">{importRecords.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <p className="text-2xl font-bold text-green-600">
                    {importRecords.filter((r) => r.importStatus === 'completed').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {importRecords.filter((r) => r.importStatus === 'failed').length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {importRecords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Import History</CardTitle>
                <CardDescription>
                  Recent test result imports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {importRecords.map((record) => (
                    <div
                      key={record.id}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{record.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.runName}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            record.importStatus === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.importStatus === 'completed'
                            ? 'Completed'
                            : 'Failed'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {record.importStatus === 'completed'
                          ? `Matched: ${record.matchedCases}/${record.totalCases} • Imported: ${record.importedAt.toLocaleDateString()}`
                          : `Error: ${record.error}`}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Config Drawers */}
      {configDialogType === 'jira' && (
        <JiraConfigDrawer
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          onConnect={handleIntegrationConnect}
          mode={configDialogMode}
          integration={
            integrations.find((i) => i.type === 'jira') as any
          }
        />
      )}

      {configDialogType === 'github' && (
        <GitHubGitLabConfigDrawer
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          onConnect={handleIntegrationConnect}
          mode={configDialogMode}
          type="github"
          integration={
            integrations.find((i) => i.type === 'github') as any
          }
        />
      )}

      {configDialogType === 'gitlab' && (
        <GitHubGitLabConfigDrawer
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          onConnect={handleIntegrationConnect}
          mode={configDialogMode}
          type="gitlab"
          integration={
            integrations.find((i) => i.type === 'gitlab') as any
          }
        />
      )}

      {configDialogType === 'slack' && (
        <SlackConfigDrawer
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          onConnect={handleIntegrationConnect}
          mode={configDialogMode}
          integration={
            integrations.find((i) => i.type === 'slack') as any
          }
        />
      )}

      {/* Webhook Drawers */}
      <WebhookFormDrawer
        open={webhookFormOpen}
        onOpenChange={setWebhookFormOpen}
        onSave={handleSaveWebhook}
        webhook={selectedWebhook}
      />

      <WebhookLogsDrawer
        open={webhookLogsOpen}
        onOpenChange={setWebhookLogsOpen}
        webhook={selectedWebhook}
      />

      {/* Import Dialog */}
      <AutomationImportPanel
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportSuccess}
        importHistory={importRecords}
       />
    </div>
  )
}
