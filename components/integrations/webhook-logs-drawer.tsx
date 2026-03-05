'use client'

import * as React from 'react'
import { AlertCircle, CheckCircle2, Clock, Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import type { Webhook, WebhookDelivery } from '@/types/integrations'

interface WebhookLogsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  webhook?: Webhook
}

export function WebhookLogsDrawer({
  open,
  onOpenChange,
  webhook,
}: WebhookLogsDrawerProps) {
  const [selectedDelivery, setSelectedDelivery] = React.useState<WebhookDelivery | null>(
    webhook?.deliveries?.[0] || null
  )

  if (!webhook) return null

  const deliveries = webhook.deliveries || []
  const successCount = deliveries.filter((d) => d.status === 'success').length
  const failureCount = deliveries.filter((d) => d.status === 'failed').length
  const pendingCount = deliveries.filter((d) => d.status === 'pending').length

  const handleCopyPayload = (payload: Record<string, unknown>) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    toast.success('Payload copied to clipboard')
  }

  const handleDownloadLogs = () => {
    const data = JSON.stringify(deliveries, null, 2)
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:application/json;charset=utf-8,' + encodeURIComponent(data)
    )
    element.setAttribute('download', `webhook-logs-${webhook.id}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Logs downloaded')
  }

  const getStatusIcon = (status: string) => {
    if (status === 'success') {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    }
    if (status === 'failed') {
      return <AlertCircle className="h-4 w-4 text-red-600" />
    }
    return <Clock className="h-4 w-4 text-yellow-600" />
  }

  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Success
        </Badge>
      )
    }
    if (status === 'failed') {
      return <Badge variant="destructive">Failed</Badge>
    }
    return <Badge variant="secondary">Pending</Badge>
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Webhook Delivery Logs</SheetTitle>
          <SheetDescription>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {webhook.url}
            </code>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Successful</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
                <p className="text-xs text-muted-foreground">
                  {successCount > 0
                    ? `Last: ${
                        deliveries
                          .filter((d) => d.status === 'success')
                          .at(-1)
                          ?.timestamp.toLocaleTimeString()
                      }`
                    : 'No successful deliveries'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{failureCount}</p>
                <p className="text-xs text-muted-foreground">
                  {failureCount > 0
                    ? `Last: ${
                        deliveries
                          .filter((d) => d.status === 'failed')
                          .at(-1)
                          ?.timestamp.toLocaleTimeString()
                      }`
                    : 'No failures'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">
                  Retries: {deliveries.reduce((acc, d) => acc + d.retryAttempt, 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Timeline */}
          {deliveries.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2 py-8">
                  <p className="text-sm text-muted-foreground">No deliveries yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Delivery Timeline</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadLogs}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {deliveries.map((delivery) => (
                  <button
                    key={delivery.id}
                    onClick={() => setSelectedDelivery(delivery)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      selectedDelivery?.id === delivery.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(delivery.status)}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {delivery.timestamp.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Response time: {delivery.responseTime}ms
                            {delivery.retryAttempt > 0 && ` • Retry: ${delivery.retryAttempt}`}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(delivery.status)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Details */}
          {selectedDelivery && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Delivery Details</CardTitle>
                <CardDescription>
                  {selectedDelivery.timestamp.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="payload" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="payload">Request Payload</TabsTrigger>
                    <TabsTrigger value="response">Response</TabsTrigger>
                  </TabsList>

                  <TabsContent value="payload" className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">
                        {String((selectedDelivery.payload as Record<string, any>)?.event || 'Custom Event')}
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyPayload(selectedDelivery.payload)}
                        className="gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </Button>
                    </div>
                    <div className="rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                      <pre>{JSON.stringify(selectedDelivery.payload, null, 2)}</pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="response" className="space-y-2">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Status Code
                        </p>
                        <Badge 
                          variant={selectedDelivery.statusCode === 200 ? 'default' : 'destructive'}
                        >
                          {selectedDelivery.statusCode}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Response Time
                        </p>
                        <p className="text-sm">{selectedDelivery.responseTime}ms</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Response Body
                        </p>
                        <div className="rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                          <pre>
                            {selectedDelivery.response
                              ? JSON.stringify(selectedDelivery.response, null, 2)
                              : 'No response'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
