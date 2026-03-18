'use client'

import * as React from 'react'
import Link from 'next/link'
import { Plus, Upload, Download, FolderTree } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Textarea } from '@/components/ui/textarea'
import {
  SuiteTree,
  CaseFilterBar,
  CaseListTable,
  CaseDetailDrawer,
  TestCaseForm,
} from '@/components/test-repository'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { useTestRepositoryStore } from '@/lib/store/test-repository-store'
import type { TestCaseItem, TestSuiteNode } from '@/lib/store/test-repository-store'
import { useProjectStore } from '@/lib/store/project-store'
import { Skeleton } from '@/components/ui/skeleton'
import {
  exportRepository,
  importRepository,
  type GetCasesFilters,
} from '@/lib/api/repository'
import type { TestCaseFormData } from '@/components/test-repository/test-case-form'
import { ApiError } from '@/lib/api/errors'

function flattenSuiteOptions(suites: TestSuiteNode[], depth = 0): Array<{ id: string; name: string }> {
  return suites.flatMap((suite) => [
    {
      id: suite.id,
      name: `${depth > 0 ? `${'  '.repeat(depth)}- ` : ''}${suite.name}`,
    },
    ...flattenSuiteOptions(suite.children, depth + 1),
  ])
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.URL.revokeObjectURL(url)
}

export default function TestRepositoryPage() {
  const currentProjectId = useProjectStore((state) => state.currentProjectId)
  const projects = useProjectStore((state) => state.projects)
  const isProjectsLoading = useProjectStore((state) => state.isLoading)
  const {
    suites,
    selectedSuiteId,
    filters,
    getSuiteById,
    createSuiteAction,
    createCaseAction,
    loadSuites,
    loadCases,
    isLoadingSuites,
    error,
    clearError,
  } = useTestRepositoryStore()
  const [isSuiteDialogOpen, setIsSuiteDialogOpen] = React.useState(false)
  const [isCaseDialogOpen, setIsCaseDialogOpen] = React.useState(false)
  const [suiteName, setSuiteName] = React.useState('')
  const [suiteDescription, setSuiteDescription] = React.useState('')
  const [suiteParentId, setSuiteParentId] = React.useState('root')
  const [isSavingSuite, setIsSavingSuite] = React.useState(false)
  const [isSavingCase, setIsSavingCase] = React.useState(false)
  const [isImporting, setIsImporting] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)
  const importInputRef = React.useRef<HTMLInputElement>(null)

  const selectedSuite = selectedSuiteId ? getSuiteById(selectedSuiteId) : null
  const suiteOptions = React.useMemo(() => flattenSuiteOptions(suites), [suites])

  const caseQueryFilters = React.useMemo<GetCasesFilters>(() => {
    return {
      suiteId: selectedSuiteId ?? undefined,
      search: filters.search || undefined,
      priority: filters.priorities.length > 0 ? filters.priorities as GetCasesFilters['priority'] : undefined,
      severity: filters.severities.length > 0 ? filters.severities as GetCasesFilters['severity'] : undefined,
      type: filters.types.length > 0 ? filters.types as GetCasesFilters['type'] : undefined,
      automationStatus: filters.automationStatuses.length > 0
        ? filters.automationStatuses as GetCasesFilters['automationStatus']
        : undefined,
      status: filters.statuses.length > 0 ? filters.statuses : undefined,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
    }
  }, [
    selectedSuiteId,
    filters.search,
    filters.priorities,
    filters.severities,
    filters.types,
    filters.automationStatuses,
    filters.statuses,
    filters.tags,
  ])

  // Load suite tree on mount
  React.useEffect(() => {
    if (!currentProjectId) {
      return
    }

    loadSuites(currentProjectId)
  }, [currentProjectId, loadSuites])

  // Re-fetch cases whenever suite/filter criteria change
  React.useEffect(() => {
    if (!currentProjectId) {
      return
    }

    loadCases(currentProjectId, caseQueryFilters)
  }, [currentProjectId, loadCases, caseQueryFilters])

  // Surface store errors as toasts
  React.useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const refreshRepositoryData = React.useCallback(async () => {
    if (!currentProjectId) {
      return
    }

    await Promise.all([
      loadSuites(currentProjectId),
      loadCases(currentProjectId, caseQueryFilters),
    ])
  }, [currentProjectId, loadCases, loadSuites, caseQueryFilters])

  const openSuiteDialog = React.useCallback(() => {
    setSuiteName('')
    setSuiteDescription('')
    setSuiteParentId(selectedSuiteId ?? 'root')
    setIsSuiteDialogOpen(true)
  }, [selectedSuiteId])

  const handleCreateSuite = async () => {
    if (!currentProjectId) {
      return
    }

    const normalizedName = suiteName.trim()
    if (!normalizedName) {
      toast.error('Suite name is required')
      return
    }

    setIsSavingSuite(true)
    try {
      await createSuiteAction(currentProjectId, {
        name: normalizedName,
        description: suiteDescription.trim() || undefined,
        parentSuiteId: suiteParentId === 'root' ? undefined : suiteParentId,
      })
      setIsSuiteDialogOpen(false)
      toast.success('Test suite created successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create test suite')
    } finally {
      setIsSavingSuite(false)
    }
  }

  const handleCreateCase = async (data: TestCaseFormData) => {
    if (!currentProjectId) {
      toast.error('Please select a project before creating a test case')
      return
    }

    setIsSavingCase(true)
    try {
      const payload: Partial<TestCaseItem> = {
        ...data,
        steps: data.steps.map((step, index) => ({
          id: step.id,
          order: index + 1,
          action: step.action,
          expectedResult: step.expectedResult,
        })),
      }

      await createCaseAction(currentProjectId, payload)
      await refreshRepositoryData()
      setIsCaseDialogOpen(false)
      toast.success('Test case created successfully')
    } catch (err) {
      if (err instanceof ApiError && err.errors.length > 0) {
        err.errors.forEach((entry) => toast.error(entry.message))
      } else {
        toast.error(err instanceof Error ? err.message : 'Failed to create test case')
      }
      throw err
    } finally {
      setIsSavingCase(false)
    }
  }

  const handleExport = async () => {
    if (!currentProjectId) {
      return
    }

    setIsExporting(true)
    try {
      const repository = await exportRepository(currentProjectId, selectedSuiteId ?? undefined)
      const filenameBase = repository.projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      const scopeSuffix = selectedSuite ? `-${selectedSuite.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''
      downloadJson(`${filenameBase || 'test-repository'}${scopeSuffix}.json`, repository)
      toast.success(selectedSuite ? 'Suite export downloaded' : 'Repository export downloaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export repository')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportButtonClick = () => {
    if (isImporting) {
      return
    }

    importInputRef.current?.click()
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !currentProjectId) {
      return;
    }

    setIsImporting(true);
    try {
      let repository;
      if (file.name.endsWith('.csv')) {
        // Dynamically import papaparse for CSV parsing
        const Papa = (await import('papaparse')).default;
        const text = await file.text();
        const parsed = Papa.parse(text, { header: true });
        // Convert CSV rows to test case objects
        // Allowed enums
        const allowedPriority = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
        const allowedSeverity = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'TRIVIAL'];
        const allowedType = ['FUNCTIONAL', 'REGRESSION', 'SMOKE', 'INTEGRATION', 'E2E', 'PERFORMANCE', 'SECURITY', 'USABILITY'];
        const allowedAutomation = ['MANUAL', 'AUTOMATED', 'PARTIALLY_AUTOMATED', 'PENDING_AUTOMATION'];

        const cases = parsed.data
          .filter((row) => row['Title'] && String(row['Title']).trim().length > 0)
          .map((row, idx) => {
            // Map and validate enums
            const priority = allowedPriority.includes((row['Priority'] || '').toUpperCase()) ? row['Priority'].toUpperCase() : 'MEDIUM';
            const severity = allowedSeverity.includes((row['Severity'] || '').toUpperCase()) ? row['Severity'].toUpperCase() : 'MAJOR';
            const type = allowedType.includes((row['Type'] || '').toUpperCase()) ? row['Type'].toUpperCase() : 'FUNCTIONAL';
            const automationStatus = allowedAutomation.includes((row['Automation Status'] || '').toUpperCase()) ? row['Automation Status'].toUpperCase() : 'MANUAL';
            return {
              title: String(row['Title']).trim(),
              description: row['Description'],
              priority,
              severity,
              type,
              automationStatus,
              status: 'ACTIVE',
              tags: row['Tags'] ? row['Tags'].split(',') : [],
              steps: row['Steps']
                ? row['Steps'].split('\n').map((step, idx) => ({
                    index: idx + 1,
                    action: step,
                    expectedResult: row['Expected Result'] || '',
                  }))
                : [],
            };
          });
        // Compose a minimal valid repository object
        repository = {
          version: 1,
          exportedAt: new Date().toISOString(),
          projectId: currentProjectId,
          projectName: projects.find((p) => p.id === currentProjectId)?.name || '',
          rootSuites: [
            {
              name: 'Imported Suite',
              description: 'Imported from CSV',
              status: 'ACTIVE',
              isLocked: false,
              cases,
              childSuites: [],
            },
          ],
        };
      } else {
        const text = await file.text();
        repository = JSON.parse(text);
      }
      const result = await importRepository(currentProjectId, {
        parentSuiteId: selectedSuiteId ?? undefined,
        repository,
      });
      await refreshRepositoryData();
      toast.success(`Imported ${result.suitesCreated} suites and ${result.casesCreated} test cases`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to import repository file');
    } finally {
      setIsImporting(false);
    }
  };

  // Build breadcrumbs
  const breadcrumbs = [
    { title: 'Test Management', href: '#' },
    { title: 'Test Repository' },
  ]

  // Add selected suite to breadcrumbs if any
  if (selectedSuite) {
    breadcrumbs.push({ title: selectedSuite.name })
  }

  if (isProjectsLoading) {
    return (
      <AppShell
        sidebar={<Sidebar />}
        header={<Header breadcrumbs={breadcrumbs} />}
      >
        <div className="p-6 space-y-3">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </AppShell>
    )
  }

  if (!projects.length || !currentProjectId) {
    return (
      <AppShell
        sidebar={<Sidebar />}
        header={<Header breadcrumbs={breadcrumbs} />}
      >
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Select a project first</h2>
            <p className="mt-2 text-muted-foreground">
              Choose a project before opening the test repository.
            </p>
            <Button asChild className="mt-4">
              <Link href="/projects">Go to Projects</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      sidebar={<Sidebar />}
      header={<Header breadcrumbs={breadcrumbs} />}
    >
      <div className="flex h-full flex-col">
        {/* Page Header */}
        <header className="flex items-center justify-between border-b px-4 py-3 bg-card">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Test Repository</h1>
            </div>
            {selectedSuite && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">
                  {selectedSuite.name}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json,text/csv,.csv"
              className="hidden"
              onChange={handleImportFile}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleImportButtonClick}
              disabled={isImporting}
            >
              <Upload className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={setIsCaseDialogOpen.bind(null, true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Test Case
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={openSuiteDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Test Suite
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleImportButtonClick}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Suite Tree Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
            {isLoadingSuites ? (
              <div className="flex h-full flex-col border-r bg-card p-3 gap-2">
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ) : (
              <SuiteTree projectId={currentProjectId} />
            )}
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Case List Area */}
          <ResizablePanel defaultSize={80}>
            <div className="flex h-full flex-col">
              {/* Filter Bar */}
              <div className="border-b p-4 bg-card">
                <CaseFilterBar />
              </div>

              {/* Table */}
              <div className="flex-1 overflow-hidden">
                <CaseListTable projectId={currentProjectId} />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Case Detail Drawer */}
      <CaseDetailDrawer projectId={currentProjectId} />

      <Dialog open={isSuiteDialogOpen} onOpenChange={setIsSuiteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Test Suite</DialogTitle>
            <DialogDescription>
              Add a new suite to organize repository test cases.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="suite-parent">Parent suite</Label>
              <select
                id="suite-parent"
                value={suiteParentId}
                onChange={(event) => setSuiteParentId(event.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="root">Top level</option>
                {suiteOptions.map((suite) => (
                  <option key={suite.id} value={suite.id}>
                    {suite.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="suite-name">Suite name</Label>
              <Input
                id="suite-name"
                value={suiteName}
                onChange={(event) => setSuiteName(event.target.value)}
                placeholder="Authentication regression suite"
              />
            </div>

            <div>
              <Label htmlFor="suite-description">Description</Label>
              <Textarea
                id="suite-description"
                value={suiteDescription}
                onChange={(event) => setSuiteDescription(event.target.value)}
                placeholder="Capture login, MFA, and password reset coverage."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuiteDialogOpen(false)} disabled={isSavingSuite}>
              Cancel
            </Button>
            <Button onClick={handleCreateSuite} disabled={isSavingSuite}>
              {isSavingSuite ? 'Creating...' : 'Create Suite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCaseDialogOpen} onOpenChange={setIsCaseDialogOpen}>
        <DialogContent className="max-w-5xl p-0 sm:max-w-5xl">
          <div className="max-h-[90vh] overflow-y-auto p-6">
            <TestCaseForm
              mode="create"
              initialData={{ suiteId: selectedSuiteId ?? '' }}
              onSubmit={handleCreateCase}
              onCancel={() => setIsCaseDialogOpen(false)}
              suiteOptions={suiteOptions}
            />
            <div className="mt-4 text-xs text-muted-foreground">
              {isSavingCase ? 'Saving test case...' : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
