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
import { AlertCircle, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import type { GitHubIntegration, GitLabIntegration } from '@/types/integrations'

interface GitHubGitLabConfigDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: (config: any) => void
  integration?: GitHubIntegration | GitLabIntegration
  mode?: 'connect' | 'configure'
  type?: 'github' | 'gitlab'
}

export function GitHubGitLabConfigDrawer({
  open,
  onOpenChange,
  onConnect,
  integration,
  mode = 'connect',
  type = 'github',
}: GitHubGitLabConfigDrawerProps) {
  const [oauthConnected, setOauthConnected] = React.useState(
    mode === 'configure' && integration?.status === 'connected'
  )
  const [isLoading, setIsLoading] = React.useState(false)
  const [repositories, setRepositories] = React.useState(
    integration?.config?.repositories || []
  )
  const [branchRules, setBranchRules] = React.useState(
    integration?.config?.branchRules || []
  )
  const [newBranchPattern, setNewBranchPattern] = React.useState('')

  const handleOAuthConnect = () => {
    setIsLoading(true)
    setTimeout(() => {
      setOauthConnected(true)
      setIsLoading(false)
      toast.success(`Connected to ${type === 'github' ? 'GitHub' : 'GitLab'} successfully`)
    }, 2000)
  }

  const handleAddBranchRule = () => {
    if (!newBranchPattern.trim()) {
      toast.error('Please enter a branch pattern')
      return
    }

    const newRule = {
      id: `rule-${Date.now()}`,
      pattern: newBranchPattern,
      enabled: true,
    }

    setBranchRules([...branchRules, newRule])
    setNewBranchPattern('')
    toast.success('Branch rule added')
  }

  const handleRemoveBranchRule = (ruleId: string) => {
    setBranchRules(branchRules.filter((r) => r.id !== ruleId))
    toast.success('Branch rule removed')
  }

  const handleSave = () => {
    const config = {
      accessToken: 'oauth-token',
      repositories,
      branchRules,
      prCommentFormat: {
        template:
          'Test Results: {passRate}% pass rate\nFailed: {failedCount}\nPassed: {passedCount}',
        includePassRate: true,
        includeFailedCases: true,
        includeCoverageMetrics: true,
      },
      statusCheckSettings: {
        enabled: true,
        name: 'Test Suite',
        targetUrl: 'https://test-runs.example.com',
        passThreshold: 80,
      },
    }

    if (type === 'gitlab') {
      const gitlabConfig = { ...config, groupId: undefined }
      onConnect(gitlabConfig)
    } else {
      onConnect(config)
    }

    onOpenChange(false)
    toast.success(`${type === 'github' ? 'GitHub' : 'GitLab'} configuration saved`)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            Configure {type === 'github' ? 'GitHub' : 'GitLab'} Integration
          </SheetTitle>
          <SheetDescription>
            Connect your {type === 'github' ? 'GitHub' : 'GitLab'} repositories and configure automated
            testing
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {!oauthConnected && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Step 1: Connect with OAuth</CardTitle>
                <CardDescription>
                  Authenticate with your {type === 'github' ? 'GitHub' : 'GitLab'} account
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
                      {type === 'github' ? '🐙' : '🦊'}
                      Connect with{' '}
                      {type === 'github' ? 'GitHub' : 'GitLab'}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground pt-3">
                  You will be redirected to{' '}
                  {type === 'github' ? 'GitHub' : 'GitLab'} to authorize
                  the connection
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

              <Tabs defaultValue="repositories">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="repositories">Repositories</TabsTrigger>
                  <TabsTrigger value="branches">Branches</TabsTrigger>
                  <TabsTrigger value="pr-comments">PR Comments</TabsTrigger>
                </TabsList>

                <TabsContent value="repositories" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Connected Repositories</CardTitle>
                      <CardDescription>
                        Select repositories to enable test integrations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {repositories.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">
                          No repositories connected yet. Available repositories will appear here
                          after OAuth.
                        </p>
                      ) : (
                        repositories.map((repo) => (
                          <div
                            key={repo.url}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {repo.owner}/{repo.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Default: {repo.defaultBranch}
                              </p>
                            </div>
                            <Checkbox defaultChecked />
                          </div>
                        ))
                      )}

                      <Button variant="outline" className="w-full gap-2 mt-2">
                        <Plus className="h-4 w-4" />
                        Add Repository
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="branches" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Branch Matching Rules</CardTitle>
                      <CardDescription>
                        Define patterns for branches to monitor
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="branch-pattern">Branch Pattern</Label>
                        <div className="flex gap-2">
                          <Input
                            id="branch-pattern"
                            placeholder="e.g., feature/*, release/*, main"
                            value={newBranchPattern}
                            onChange={(e) =>
                              setNewBranchPattern(e.target.value)
                            }
                          />
                          <Button
                            type="button"
                            onClick={handleAddBranchRule}
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Use * as wildcard (e.g., feature/*)
                        </p>
                      </div>

                      {branchRules.length > 0 && (
                        <div className="space-y-2 pt-4">
                          <Label>Active Rules</Label>
                          <div className="space-y-2">
                            {branchRules.map((rule) => (
                              <div
                                key={rule.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    defaultChecked={rule.enabled}
                                  />
                                  <code className="text-sm">
                                    {rule.pattern}
                                  </code>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveBranchRule(
                                      rule.id
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pr-comments" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        PR Comment Format
                      </CardTitle>
                      <CardDescription>
                        Configure how test results appear in pull requests
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Include Pass Rate</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Include Failed Cases</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Include Coverage Metrics</Label>
                          <Switch defaultChecked />
                        </div>
                      </div>

                      <div className="pt-4">
                        <Label className="mb-2 block">Preview</Label>
                        <div className="rounded-lg bg-muted p-3">
                          <pre className="text-xs whitespace-pre-wrap break-words">
                            Test Results: 92% pass rate{'\n'}
                            Failed: 8{'\n'}
                            Passed: 92{'\n'}
                            Coverage: 78%
                          </pre>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Label className="flex items-center gap-2 mb-2">
                          Status Checks
                        </Label>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="font-normal">
                              Enable Status Checks
                            </Label>
                            <Switch defaultChecked />
                          </div>
                          <Input
                            placeholder="Pass Threshold (%)"
                            type="number"
                            defaultValue={80}
                            min={0}
                            max={100}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
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
