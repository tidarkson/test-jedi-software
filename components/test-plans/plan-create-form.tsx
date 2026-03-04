'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input as InputGroup } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { TestPlan, TestRun } from '@/types'
import { X, Plus, Search } from 'lucide-react'

interface PlanCreateFormProps {
  initialData?: TestPlan
  linkedRuns: TestRun[]
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function PlanCreateForm({
  initialData,
  linkedRuns,
  onSubmit,
  isLoading = false,
}: PlanCreateFormProps) {
  const router = useRouter()
  const [selectedRuns, setSelectedRuns] = React.useState<TestRun[]>(
    initialData?.linkedRuns || []
  )
  const [tags, setTags] = React.useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = React.useState('')
  const [showRunPicker, setShowRunPicker] = React.useState(false)
  const [searchText, setSearchText] = React.useState('')

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      milestone: initialData?.milestone || '',
      status: initialData?.status || 'draft',
    },
  })

  const filteredRuns = linkedRuns.filter((run) =>
    run.name.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleAddRun = (run: TestRun) => {
    if (!selectedRuns.find((r) => r.id === run.id)) {
      setSelectedRuns([...selectedRuns, run])
    }
    setSearchText('')
    setShowRunPicker(false)
  }

  const handleRemoveRun = (runId: string) => {
    setSelectedRuns(selectedRuns.filter((r) => r.id !== runId))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    onSubmit({
      ...data,
      linkedRuns: selectedRuns,
      tags,
    })
  })

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the plan name and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter plan name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter plan description"
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about this test plan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Plan Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Settings</CardTitle>
              <CardDescription>
                Configure milestone and approval status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="milestone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milestone</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Release v2.0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Associate this plan with a specific milestone
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending_approval">
                          Pending Approval
                        </SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="deprecated">Deprecated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Linked Test Runs */}
          <Card>
            <CardHeader>
              <CardTitle>Linked Test Runs</CardTitle>
              <CardDescription>
                Select which test runs to include in this plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRunPicker(!showRunPicker)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Test Run
              </Button>

              {showRunPicker && (
                <div className="space-y-3 rounded-lg border p-4">
                  <div className="relative flex gap-2">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search test runs..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {filteredRuns.length > 0 ? (
                      filteredRuns.map((run) => (
                        <button
                          key={run.id}
                          type="button"
                          onClick={() => handleAddRun(run)}
                          disabled={selectedRuns.some((r) => r.id === run.id)}
                          className="flex w-full items-center justify-between rounded-md border p-2 text-left hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div>
                            <p className="font-medium">{run.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {run.statistics.total} tests
                            </p>
                          </div>
                          {selectedRuns.some((r) => r.id === run.id) && (
                            <Badge variant="outline">Added</Badge>
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No test runs found
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedRuns.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Selected Runs ({selectedRuns.length})
                  </p>
                  <div className="space-y-2">
                    {selectedRuns.map((run) => (
                      <div
                        key={run.id}
                        className="flex items-center justify-between rounded-md border bg-accent/50 p-2"
                      >
                        <div>
                          <p className="font-medium">{run.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {run.statistics.total} tests
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRun(run.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Add tags to categorize this plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <InputGroup
                  placeholder="Enter tag and press Add"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:opacity-70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading}
            >
              {initialData ? 'Update Plan' : 'Create Plan'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
