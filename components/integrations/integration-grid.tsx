'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings2, Plug } from 'lucide-react'
import type { Integration, IntegrationType } from '@/types/integrations'

interface IntegrationGridProps {
  integrations: Integration[]
  isLoading?: boolean
  onConnect: (type: IntegrationType) => void
  onConfigure: (type: IntegrationType) => void
}

const statusColors: Record<string, string> = {
  connected: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  disconnected: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
}

const statusLabels: Record<string, string> = {
  connected: 'Connected',
  disconnected: 'Not Connected',
  error: 'Error',
  pending: 'Pending',
}

export function IntegrationGrid({
  integrations,
  isLoading = false,
  onConnect,
  onConfigure,
}: IntegrationGridProps) {
  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading integrations...</div>
  }

  if (integrations.length === 0) {
    return <div className="text-sm text-muted-foreground">No integrations found for this project.</div>
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {integrations.map((integration) => (
        <Card
          key={integration.id}
          className="flex flex-col transition-all hover:shadow-md"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
                  {integration.icon}
                </div>
                <div>
                  <CardTitle className="text-base">{integration.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {integration.description}
                  </CardDescription>
                </div>
              </div>
              <Badge className={`${statusColors[integration.status]}`}>
                {statusLabels[integration.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col gap-3">
              {integration.status === 'connected' && (
                <div className="space-y-1 rounded-md bg-muted p-2 text-xs">
                  <div>
                    Connected since:{' '}
                    {integration.connectedAt?.toLocaleDateString()}
                  </div>
                  {integration.lastSyncAt && (
                    <div>
                      Last sync: {integration.lastSyncAt.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {integration.status === 'connected' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => onConfigure(integration.type)}
                  >
                    <Settings2 className="h-4 w-4" />
                    Configure
                  </Button>
                ) : (
                  <Button
                    className="flex-1 gap-2"
                    size="sm"
                    onClick={() => onConnect(integration.type)}
                  >
                    <Plug className="h-4 w-4" />
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
