'use client'

import * as React from 'react'
import { AlertCircle, CheckCircle2, Copy, Eye, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { Webhook } from '@/types/integrations'

interface WebhookTableProps {
  webhooks: Webhook[]
  isLoading?: boolean
  onAdd: () => void
  onEdit: (webhook: Webhook) => void
  onDelete: (webhookId: string) => Promise<void>
  onViewLogs: (webhook: Webhook) => void
}

export function WebhookTable({
  webhooks,
  isLoading = false,
  onAdd,
  onEdit,
  onDelete,
  onViewLogs,
}: WebhookTableProps) {
  const [deletingWebhookId, setDeletingWebhookId] = React.useState<string | null>(null)

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  const getStatusIcon = (webhook: Webhook) => {
    if (webhook.failureCount > 0) {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
    return <CheckCircle2 className="h-4 w-4 text-green-600" />
  }

  const getStatusBadge = (webhook: Webhook) => {
    if (webhook.failureCount > 5) {
      return <Badge variant="destructive">Failed</Badge>
    }
    if (webhook.failureCount > 0) {
      return <Badge variant="secondary">Warning</Badge>
    }
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      setDeletingWebhookId(webhookId)
      await onDelete(webhookId)
    } finally {
      setDeletingWebhookId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Webhooks ({webhooks.length})</h3>
          <p className="text-xs text-muted-foreground">
            Manage webhooks to receive real-time updates about test events
          </p>
        </div>
        <Button onClick={onAdd} className="gap-2" size="sm">
          <Plus className="h-4 w-4" />
          Create Webhook
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2 py-8">
              <p className="text-sm text-muted-foreground">Loading webhooks...</p>
            </div>
          </CardContent>
        </Card>
      ) : webhooks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2 py-8">
              <p className="text-sm text-muted-foreground">No webhooks configured yet</p>
              <Button onClick={onAdd} variant="outline" size="sm">
                Add Webhook
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Last Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell className="max-w-sm">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded truncate">
                        {webhook.url}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyUrl(webhook.url)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 flex-wrap gap-1">
                      {webhook.events.slice(0, 2).map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event.split('_').slice(0, 2).join('_')}
                        </Badge>
                      ))}
                      {webhook.events.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{webhook.events.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {webhook.lastDelivery ? (
                      <span>
                        {new Date(webhook.lastDelivery).toLocaleDateString()}{' '}
                        {new Date(webhook.lastDelivery).toLocaleTimeString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(webhook)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewLogs(webhook)}
                        title="View delivery logs"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(webhook)}
                        title="Edit webhook"
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        disabled={deletingWebhookId === webhook.id}
                        title="Delete webhook"
                      >
                        {deletingWebhookId === webhook.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
