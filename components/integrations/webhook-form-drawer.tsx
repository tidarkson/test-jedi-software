'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Copy, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import type { Webhook, WebhookEvent } from '@/types/integrations'

const webhookFormSchema = z.object({
  url: z.string().url('Valid webhook URL required'),
  secret: z.string().min(8, 'Secret must be at least 8 characters'),
})

const webhookEvents: WebhookEvent[] = [
  'test_run_started',
  'test_run_completed',
  'test_case_failed',
  'defect_created',
  'defect_updated',
  'custom_event',
]

interface WebhookFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (
    webhook: Omit<Webhook, 'id' | 'createdAt' | 'updatedAt' | 'deliveries'>
  ) => Promise<void>
  webhook?: Webhook
}

type WebhookFormData = z.infer<typeof webhookFormSchema>

export function WebhookFormDrawer({
  open,
  onOpenChange,
  onSave,
  webhook,
}: WebhookFormDrawerProps) {
  const [selectedEvents, setSelectedEvents] = React.useState<WebhookEvent[]>(
    webhook?.events || []
  )
  const [showSecret, setShowSecret] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const isEditing = !!webhook

  const form = useForm<WebhookFormData>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      url: webhook?.url || '',
      secret: webhook?.secret || '',
    },
  })

  React.useEffect(() => {
    setSelectedEvents(webhook?.events || [])
    form.reset({
      url: webhook?.url || '',
      secret: webhook?.secret || '',
    })
  }, [webhook, form, open])

  const onSubmit = async (data: WebhookFormData) => {
    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event type')
      return
    }

    setIsLoading(true)
    try {
      await onSave({
        url: data.url,
        secret: data.secret,
        events: selectedEvents,
        active: webhook?.active ?? true,
        failureCount: webhook?.failureCount ?? 0,
      })

      onOpenChange(false)
      toast.success(`Webhook ${isEditing ? 'updated' : 'created'} successfully`)
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  const handleEventToggle = (event: WebhookEvent) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    )
  }

  const handleSelectAll = () => {
    if (selectedEvents.length === webhookEvents.length) {
      setSelectedEvents([])
    } else {
      setSelectedEvents([...webhookEvents])
    }
  }

  const handleCopyUrl = () => {
    const url = form.getValues('url')
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  const handleGenerateSecret = () => {
    const secret = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15)
    form.setValue('secret', secret)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? 'Edit Webhook' : 'Create Webhook'}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update webhook configuration and events'
              : 'Set up a new webhook to receive test event notifications'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Webhook URL</CardTitle>
                <CardDescription>
                  The endpoint where webhook payloads will be sent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder="https://api.example.com/webhooks/test-runs"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleCopyUrl}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormDescription>
                        Must be a valid HTTPS URL with trailing path
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Webhook Validation</AlertTitle>
                  <AlertDescription>
                    Your endpoint will receive a POST request with X-Webhook-Signature
                    header containing an HMAC-SHA256 signature for verification
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Secret</CardTitle>
                <CardDescription>
                  Used to sign webhook requests for secure verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="secret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secret Key</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <div className="relative flex-1">
                            <Input
                              type={showSecret ? 'text' : 'password'}
                              placeholder="Enter or generate a secret"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 -translate-y-1/2"
                              onClick={() => setShowSecret(!showSecret)}
                            >
                              {showSecret ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGenerateSecret}
                        >
                          Generate
                        </Button>
                      </div>
                      <FormDescription>
                        Minimum 8 characters. Use for HMAC verification in your endpoint.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Event Types</CardTitle>
                <CardDescription>
                  Select which events should trigger this webhook
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedEvents.length === webhookEvents.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {selectedEvents.length}{' '}
                    {selectedEvents.length === 1 ? 'event' : 'events'} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {webhookEvents.map((event) => (
                    <div key={event} className="flex items-center gap-2">
                      <Checkbox
                        id={event}
                        checked={selectedEvents.includes(event)}
                        onCheckedChange={() => handleEventToggle(event)}
                      />
                      <label
                        htmlFor={event}
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {event
                          .split('_')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </label>
                      <span className="text-xs text-muted-foreground">
                        {event === 'test_run_started' && 'Fired when a test run begins'}
                        {event === 'test_run_completed' && 'Fired when a test run finishes'}
                        {event === 'test_case_failed' && 'Fired when a test fails'}
                        {event === 'defect_created' && 'Fired when a defect is created'}
                        {event === 'defect_updated' && 'Fired when a defect is updated'}
                        {event === 'custom_event' && 'Fired on custom trigger'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 pt-6 pb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Webhook' : 'Create Webhook'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
