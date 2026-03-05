'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import type { JiraIntegration } from '@/types/integrations'

const jiraConnectionSchema = z.object({
  instanceUrl: z.string().url('Valid Jira instance URL required'),
  projectKey: z.string().min(1, 'Project key required'),
  autoCreateDefects: z.boolean(),
  autoCreateTrigger: z.enum(['any_failure', 'critical_failures_only']),
})

const jiraFieldMappingSchema = z.object({
  criticalPriority: z.string().min(1, 'Critical priority mapping required'),
  highPriority: z.string().min(1, 'High priority mapping required'),
  mediumPriority: z.string().min(1, 'Medium priority mapping required'),
  lowPriority: z.string().min(1, 'Low priority mapping required'),
  bugIssueType: z.string().min(1, 'Bug issue type required'),
  taskIssueType: z.string().min(1, 'Task issue type required'),
})

interface JiraConfigDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: (config: any) => void
  integration?: JiraIntegration
  mode?: 'connect' | 'configure'
}

type JiraConnectionForm = z.infer<typeof jiraConnectionSchema>
type JiraFieldMappingForm = z.infer<typeof jiraFieldMappingSchema>

export function JiraConfigDrawer({
  open,
  onOpenChange,
  onConnect,
  integration,
  mode = 'connect',
}: JiraConfigDrawerProps) {
  const [currentStep, setCurrentStep] = React.useState<'oauth' | 'project' | 'mapping' | 'rules'>('oauth')
  const [oauthConnected, setOauthConnected] = React.useState(
    mode === 'configure' && integration?.status === 'connected'
  )
  const [isLoading, setIsLoading] = React.useState(false)
  const [connectionResult, setConnectionResult] = React.useState<{
    success: boolean
    message: string
  } | null>(null)

  const connectionForm = useForm<JiraConnectionForm>({
    resolver: zodResolver(jiraConnectionSchema),
    defaultValues: {
      instanceUrl: integration?.config?.instanceUrl || '',
      projectKey: integration?.config?.projectKey || '',
      autoCreateDefects: integration?.config?.autoCreateDefects || false,
      autoCreateTrigger: integration?.config?.autoCreateTrigger || 'critical_failures_only',
    },
  })

  const mappingForm = useForm<JiraFieldMappingForm>({
    resolver: zodResolver(jiraFieldMappingSchema),
    defaultValues: {
      criticalPriority: integration?.config?.priorityFieldMapping?.critical || 'Highest',
      highPriority: integration?.config?.priorityFieldMapping?.high || 'High',
      mediumPriority: integration?.config?.priorityFieldMapping?.medium || 'Medium',
      lowPriority: integration?.config?.priorityFieldMapping?.low || 'Low',
      bugIssueType: integration?.config?.issueTypeMapping?.bug || '10000',
      taskIssueType: integration?.config?.issueTypeMapping?.task || '10001',
    },
  })

  const handleOAuthConnect = () => {
    setIsLoading(true)
    // Simulate OAuth flow
    setTimeout(() => {
      setOauthConnected(true)
      setIsLoading(false)
      toast.success('Connected to Jira successfully')
      setCurrentStep('project')
    }, 2000)
  }

  const handleTestConnection = async () => {
    setIsLoading(true)
    try {
      // Simulate API call to test connection
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setConnectionResult({
        success: true,
        message: 'Successfully connected to Jira instance',
      })
      toast.success('Connection test passed')
    } catch (error) {
      setConnectionResult({
        success: false,
        message: 'Failed to connect to Jira instance',
      })
      toast.error('Connection test failed')
    } finally {
      setIsLoading(false)
    }
  }

  const onConnectionSubmit = (data: JiraConnectionForm) => {
    setCurrentStep('mapping')
  }

  const onMappingSubmit = (data: JiraFieldMappingForm) => {
    setCurrentStep('rules')
  }

  const handleSave = () => {
    const connectionData = connectionForm.getValues()
    const mappingData = mappingForm.getValues()

    const config = {
      ...connectionData,
      priorityFieldMapping: {
        critical: mappingData.criticalPriority,
        high: mappingData.highPriority,
        medium: mappingData.mediumPriority,
        low: mappingData.lowPriority,
      },
      issueTypeMapping: {
        bug: mappingData.bugIssueType,
        task: mappingData.taskIssueType,
      },
    }

    onConnect(config)
    onOpenChange(false)
    toast.success('Jira configuration saved')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configure Jira Integration</SheetTitle>
          <SheetDescription>
            {mode === 'connect'
              ? 'Connect your Jira instance and configure defect tracking'
              : 'Update your Jira configuration settings'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {!oauthConnected && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Step 1: Connect with OAuth</CardTitle>
                <CardDescription>Authenticate with your Jira account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 0C5.372 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                      </svg>
                      Connect with OAuth
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  You will be redirected to Jira to authorize the connection
                </p>
              </CardContent>
            </Card>
          )}

          {oauthConnected && (
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
          )}

          {oauthConnected && (
            <Tabs value={currentStep} onValueChange={(value: any) => setCurrentStep(value)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="project">Project</TabsTrigger>
                <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
                <TabsTrigger value="rules">Auto-Create Rules</TabsTrigger>
              </TabsList>

              <TabsContent value="project" className="space-y-4">
                <Form {...connectionForm}>
                  <form
                    onSubmit={connectionForm.handleSubmit(onConnectionSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={connectionForm.control}
                      name="instanceUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jira Instance URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://company.atlassian.net"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Your Jira Cloud or Server instance URL
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={connectionForm.control}
                      name="projectKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Key</FormLabel>
                          <FormControl>
                            <Input placeholder="TEST" {...field} />
                          </FormControl>
                          <FormDescription>
                            The key of the Jira project for defect tracking
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={isLoading}
                        className="flex-1 gap-2"
                      >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Test Connection
                      </Button>
                      <Button type="submit" className="flex-1">
                        Next
                      </Button>
                    </div>

                    {connectionResult && (
                      <Alert
                        variant={connectionResult.success ? 'default' : 'destructive'}
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>
                          {connectionResult.success ? 'Success' : 'Error'}
                        </AlertTitle>
                        <AlertDescription>
                          {connectionResult.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="mapping" className="space-y-4">
                <Form {...mappingForm}>
                  <form
                    onSubmit={mappingForm.handleSubmit(onMappingSubmit)}
                    className="space-y-4"
                  >
                    <div className="space-y-4">
                      <h4 className="font-medium">Priority Field Mapping</h4>

                      <FormField
                        control={mappingForm.control}
                        name="criticalPriority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Critical Priority</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={mappingForm.control}
                        name="highPriority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>High Priority</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={mappingForm.control}
                        name="mediumPriority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medium Priority</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={mappingForm.control}
                        name="lowPriority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Low Priority</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4 pt-4">
                      <h4 className="font-medium">Issue Type Mapping</h4>

                      <FormField
                        control={mappingForm.control}
                        name="bugIssueType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bug Issue Type ID</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={mappingForm.control}
                        name="taskIssueType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Issue Type ID</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep('project')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button type="submit" className="flex-1">
                        Next
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="rules" className="space-y-4">
                <Form {...connectionForm}>
                  <form onSubmit={connectionForm.handleSubmit(handleSave)} className="space-y-4">
                    <FormField
                      control={connectionForm.control}
                      name="autoCreateDefects"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Auto-Create Defects</FormLabel>
                            <FormDescription>
                              Automatically create defects in Jira when test failures occur
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {connectionForm.watch('autoCreateDefects') && (
                      <FormField
                        control={connectionForm.control}
                        name="autoCreateTrigger"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trigger on:</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="any_failure">
                                  Any Test Failure
                                </SelectItem>
                                <SelectItem value="critical_failures_only">
                                  Critical Failures Only
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="flex gap-2 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep('mapping')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button type="submit" className="flex-1" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Configuration'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
