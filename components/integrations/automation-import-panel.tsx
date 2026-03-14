'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertCircle, CheckCircle2, Upload, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import type { AutomationImportResponse } from '@/lib/api/integrations'
import type { AutomationImportRecord, ImportedCase } from '@/types/integrations'

const importFormSchema = z.object({
  runId: z.string().min(1, 'Please select a test run'),
  importMethod: z.enum(['file', 'json']),
})

interface AutomationImportPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (data: {
    runId: string
    runName?: string
    payload: unknown[]
    fileName: string
  }) => Promise<AutomationImportResponse>
  importHistory: AutomationImportRecord[]
  testRuns?: Array<{ id: string; name: string }>
}

type ImportFormData = z.infer<typeof importFormSchema>

export function AutomationImportPanel({
  open,
  onOpenChange,
  onImport,
  importHistory,
  testRuns = [
    { id: 'run-1', name: 'Sprint 45 - UI Tests' },
    { id: 'run-2', name: 'Sprint 45 - API Tests' },
    { id: 'run-3', name: 'Sprint 45 - Integration Tests' },
  ],
}: AutomationImportPanelProps) {
  const [importStep, setImportStep] = React.useState<'select' | 'preview' | 'confirm'>(
    'select'
  )
  const [uploadedCases, setUploadedCases] = React.useState<ImportedCase[]>([])
  const [rawPayload, setRawPayload] = React.useState<unknown[]>([])
  const [fileName, setFileName] = React.useState('')
  const [importResult, setImportResult] = React.useState<AutomationImportResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const form = useForm<ImportFormData>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      runId: '',
      importMethod: 'file',
    },
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const data = JSON.parse(content)

        const normalizedPayload = Array.isArray(data)
          ? data
          : Array.isArray((data as Record<string, unknown>)?.results)
            ? ((data as Record<string, unknown>).results as unknown[])
            : []

        if (normalizedPayload.length === 0) {
          toast.error('No results found in uploaded JSON payload')
          return
        }

        setRawPayload(normalizedPayload)
        setImportResult(null)
        setUploadedCases(
          normalizedPayload.map((item, index) => {
            const row = item as Record<string, unknown>
            const status = String(row.status ?? 'FAILED').toLowerCase()
            return {
              id: String(row.id ?? `case-${index + 1}`),
              name: String(row.name ?? row.title ?? `Case ${index + 1}`),
              matched: false,
              status: {
                passed: status === 'passed',
                failed: status === 'failed',
                blocked: status === 'blocked',
              },
            }
          })
        )
        setImportStep('preview')
        toast.success('File parsed successfully')
      } catch (error) {
        toast.error('Failed to parse JSON file')
      }
    }

    reader.readAsText(file)
  }

  const handleJsonPaste = (value: string) => {
    if (!value.trim()) return

    try {
      const parsed = JSON.parse(value)
      const normalizedPayload = Array.isArray(parsed)
        ? parsed
        : Array.isArray((parsed as Record<string, unknown>)?.results)
          ? ((parsed as Record<string, unknown>).results as unknown[])
          : []

      if (normalizedPayload.length === 0) {
        toast.error('No results found in pasted JSON payload')
        return
      }

      setRawPayload(normalizedPayload)
      setImportResult(null)
      setUploadedCases(
        normalizedPayload.map((item, index) => {
          const row = item as Record<string, unknown>
          const status = String(row.status ?? 'FAILED').toLowerCase()
          return {
            id: String(row.id ?? `case-${index + 1}`),
            name: String(row.name ?? row.title ?? `Case ${index + 1}`),
            matched: false,
            status: {
              passed: status === 'passed',
              failed: status === 'failed',
              blocked: status === 'blocked',
            },
          }
        })
      )
      setFileName('pasted-data.json')
      setImportStep('preview')
      toast.success('JSON parsed successfully')
    } catch (error) {
      toast.error('Invalid JSON format')
    }
  }

  const matchedCount = importResult?.matched ?? uploadedCases.filter((c) => c.matched).length
  const unmatchedCount = importResult?.unmatched ?? uploadedCases.filter((c) => !c.matched).length
  const matchedCases = uploadedCases.filter((c) => c.matched)
  const unmatchedCases = uploadedCases.filter((c) => !c.matched)

  const handleImport = async () => {
    const runId = form.getValues('runId')
    if (!runId || rawPayload.length === 0) {
      toast.error('Please select a test run and upload test results')
      return
    }

    setIsLoading(true)
    try {
      const runName = testRuns.find((run) => run.id === runId)?.name
      const response = await onImport({
        runId,
        runName,
        payload: rawPayload,
        fileName,
      })
      setImportResult(response)
      setIsLoading(false)
      toast.success('Test results imported successfully')
    } catch (error) {
      setIsLoading(false)
      toast.error('Failed to import test results')
    }
  }

  const resetForm = () => {
    setImportStep('select')
    setUploadedCases([])
    setRawPayload([])
    setImportResult(null)
    setFileName('')
    form.reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Test Results</DialogTitle>
          <DialogDescription>
            Upload JSON test results and preview matched cases before importing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Select Run */}
          {(importStep === 'select' || importStep === 'preview') && (
            <Form {...form}>
              <FormField
                control={form.control}
                name="runId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Run</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a test run to import into" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {testRuns.map((run) => (
                          <SelectItem key={run.id} value={run.id}>
                            {run.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Imported results will be associated with this test run
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          )}

          {/* Upload Step */}
          {importStep === 'select' && (
            <div className="space-y-4">
              <Tabs defaultValue="file">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">Upload File</TabsTrigger>
                  <TabsTrigger value="json">Paste JSON</TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Upload JSON File</CardTitle>
                      <CardDescription>
                        Support for test automation results export files
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            Drag and drop your JSON file here
                          </p>
                          <p className="text-sm text-muted-foreground">
                            or click to browse your computer
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Choose File
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".json"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Expected Format</AlertTitle>
                        <AlertDescription>
                          JSON array of test case results with properties: id, name,
                          status (passed/failed/blocked)
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="json" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Paste JSON</CardTitle>
                      <CardDescription>
                        Paste raw JSON test results directly
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder={`[
  {
    "id": "case-1",
    "name": "Test case name",
    "status": {"passed": true, "failed": false, "blocked": false}
  }
]`}
                        className="font-mono text-xs"
                        rows={10}
                        onBlur={(e) => handleJsonPaste(e.target.value)}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Preview Step */}
          {importStep === 'preview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Matched</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {matchedCount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Will be imported
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Unmatched</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-yellow-600">
                      {unmatchedCount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Will create new cases
                    </p>
                  </CardContent>
                </Card>
              </div>

              {unmatchedCount > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Unmatched Cases</AlertTitle>
                  <AlertDescription>
                    {unmatchedCount} cases in the import file don't match
                    existing test cases. New cases will be created automatically.
                  </AlertDescription>
                </Alert>
              )}

              {importResult && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Import Result</AlertTitle>
                  <AlertDescription>
                    Matched {importResult.matched}/{importResult.totalResults}, unmatched {importResult.unmatched}.
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="matched">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="matched">
                    Matched ({matchedCount})
                  </TabsTrigger>
                  <TabsTrigger value="unmatched">
                    Unmatched ({unmatchedCount})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="matched">
                  <Card>
                    <CardContent className="pt-6">
                      {matchedCases.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">
                          No matched cases
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table className="text-sm">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Case Name</TableHead>
                                <TableHead>Mapped To</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {matchedCases.map((c) => (
                                <TableRow key={c.id}>
                                  <TableCell className="font-medium">
                                    {c.name}
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground">
                                    {c.existingCaseId}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={
                                        c.status.passed
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }
                                    >
                                      {c.status.passed ? 'Passed' : 'Failed'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="unmatched">
                  <Card>
                    <CardContent className="pt-6">
                      {unmatchedCases.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">
                          No unmatched cases
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {unmatchedCases.map((c) => (
                            <div
                              key={c.id}
                              className="rounded-lg border p-3 text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {c.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    New case will be created
                                  </p>
                                </div>
                                <Badge
                                  className={
                                    c.status.passed
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }
                                >
                                  {c.status.passed ? 'P' : 'F'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Import History */}
          {importStep === 'select' && importHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Imports</CardTitle>
                <CardDescription>Previously imported test results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {importHistory.slice(0, 3).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{record.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.runName} •{' '}
                          {record.importedAt.toLocaleDateString()}
                        </p>
                      </div>
                      {record.importStatus === 'completed' ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {record.matchedCases}/{record.totalCases}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          Failed: {record.error}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (importStep === 'preview') {
                setImportStep('select')
              } else {
                onOpenChange(false)
              }
            }}
          >
            {importStep === 'preview' ? 'Back' : 'Cancel'}
          </Button>
          {importStep === 'select' && (
            <Button variant="secondary" onClick={() => resetForm()}>
              Reset
            </Button>
          )}
          {importStep === 'preview' && (
            <Button onClick={handleImport} disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Import {rawPayload.length} Cases
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
