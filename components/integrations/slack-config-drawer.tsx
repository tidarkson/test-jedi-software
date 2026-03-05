'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { SlackIntegration } from '@/types/integrations'

const messagePreviewTemplates = {
  run_completed: `🎯 Test Run Completed
Run: Sprint 45 - UI Tests
Status: ✅ PASSED
Results: 145/150 (96.7% pass rate)
Duration: 12m 34s`,

  defect_created: `🐛 New Defect Created
Case: User login flow
Priority: High
Environment: Staging
Assigned to: QA Team`,

  test_failed: `❌ Test Failed
Case: Checkout payment processing
Error: Connection timeout
Failure Rate: 3/5 attempts`,

  run_started: `▶️ Test Run Started
Plan: Sprint 45 - Integration Tests
Total Cases: 320
Environment: Staging
Estimated Duration: 45 minutes`,

  high_failure_rate: `⚠️ High Failure Rate Alert
Suite: API Tests
Failure Rate: 45%
Failed: 45/100
Action: Review recent changes`,

  test_passed: `✅ Test Passed
Case: User registration flow
Duration: 2.5s
Environment: Production`,
}

interface SlackConfigDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: (config: any) => void
  integration?: SlackIntegration
  mode?: 'connect' | 'configure'
}

export function SlackConfigDrawer({
  open,
  onOpenChange,
  onConnect,
  integration,
  mode = 'connect',
}: SlackConfigDrawerProps) {
  const [oauthConnected, setOauthConnected] = React.useState(
    mode === 'configure' && integration?.status === 'connected'
  )
  const [isLoading, setIsLoading] = React.useState(false)
  const [connectedChannels, setConnectedChannels] = React.useState(
    integration?.config?.connectedChannels || []
  )
  const [selectedEventPreview, setSelectedEventPreview] = React.useState<
    keyof typeof messagePreviewTemplates
  >('run_completed')
  const [notificationRules, setNotificationRules] = React.useState(
    integration?.config?.notificationRules || []
  )

  const events: Array<keyof typeof messagePreviewTemplates> = [
    'run_completed',
    'test_failed',
    'defect_created',
    'run_started',
    'high_failure_rate',
    'test_passed',
  ]

  const handleOAuthConnect = () => {
    setIsLoading(true)
    setTimeout(() => {
      setOauthConnected(true)
      setConnectedChannels([
        { id: 'C123456', name: 'testing', isPrivate: false },
        { id: 'C789012', name: 'ci-notifications', isPrivate: false },
        { id: 'C345678', name: 'devops', isPrivate: true },
      ])
      setIsLoading(false)
      toast.success('Connected to Slack successfully')
    }, 2000)
  }

  const handleToggleNotification = (event: keyof typeof messagePreviewTemplates) => {
    const existingRule = notificationRules.find((r) => r.event === event)

    if (existingRule) {
      setNotificationRules(
        notificationRules.map((r) =>
          r.event === event ? { ...r, enabled: !r.enabled } : r
        )
      )
    } else {
      setNotificationRules([
        ...notificationRules,
        {
          id: `rule-${Date.now()}`,
          event,
          channels: connectedChannels.slice(0, 1),
          enabled: true,
        },
      ])
    }
  }

  const handleChannelToggle = (
    event: keyof typeof messagePreviewTemplates,
    channelId: string
  ) => {
    const rule = notificationRules.find((r) => r.event === event)
    if (!rule) return

    const updatedChannels = rule.channels.find((c) => c.id === channelId)
      ? rule.channels.filter((c) => c.id !== channelId)
      : [...rule.channels, connectedChannels.find((c) => c.id === channelId)!]

    setNotificationRules(
      notificationRules.map((r) =>
        r.event === event ? { ...r, channels: updatedChannels } : r
      )
    )
  }

  const handleSave = () => {
    const config = {
      workspaceId: 'T123456',
      accessToken: 'slack-token',
      connectedChannels,
      notificationRules,
    }

    onConnect(config)
    onOpenChange(false)
    toast.success('Slack configuration saved')
  }

  const getEventLabel = (event: string) => {
    return event
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configure Slack Integration</SheetTitle>
          <SheetDescription>
            Connect Slack and set up notification rules for test events
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {!oauthConnected && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Step 1: Connect with OAuth</CardTitle>
                <CardDescription>
                  Authenticate with your Slack workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleOAuthConnect}
                  disabled={isLoading}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      💬
                      Connect with Slack
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground pt-3">
                  You will be redirected to Slack to authorize the connection
                </p>
              </CardContent>
            </Card>
          )}

          {oauthConnected && (
            <>
              <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      OAuth connection established
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Channel Selection
                  </CardTitle>
                  <CardDescription>
                    Select channels to receive test notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {connectedChannels.map((channel) => (
                    <div
                      key={channel.id}
                      className="flex items-center gap-2 rounded-lg border p-3"
                    >
                      <Checkbox defaultChecked />
                      <div className="flex-1">
                        <p className="text-sm font-medium">#{channel.name}</p>
                        {channel.isPrivate && (
                          <p className="text-xs text-muted-foreground">
                            Private Channel
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Notification Rules
                  </CardTitle>
                  <CardDescription>
                    Choose which events trigger Slack notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {events.map((event) => {
                    const rule = notificationRules.find((r) => r.event === event)
                    const isEnabled = rule?.enabled ?? false

                    return (
                      <div key={event} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={isEnabled}
                              onCheckedChange={() =>
                                handleToggleNotification(event)
                              }
                            />
                            <label className="text-sm font-medium">
                              {getEventLabel(event)}
                            </label>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelectedEventPreview(event)
                            }
                          >
                            Preview
                          </Button>
                        </div>

                        {isEnabled && rule && connectedChannels.length > 0 && (
                          <div className="ml-6 space-y-2">
                            {connectedChannels.map((channel) => (
                              <div
                                key={channel.id}
                                className="flex items-center gap-2"
                              >
                                <Checkbox
                                  checked={rule.channels.some(
                                    (c) => c.id === channel.id
                                  )}
                                  onCheckedChange={() =>
                                    handleChannelToggle(event, channel.id)
                                  }
                                />
                                <label className="text-xs">
                                  #{channel.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Message Preview
                  </CardTitle>
                  <CardDescription>
                    Preview of {getEventLabel(selectedEventPreview)} notification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted p-4 font-mono text-xs whitespace-pre-wrap break-words">
                    {messagePreviewTemplates[selectedEventPreview]}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2 pt-4 pb-4">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  Save Configuration
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
