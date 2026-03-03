'use client'

import * as React from 'react'
import Link from 'next/link'
import { Plus, Upload, Download, FolderTree } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import {
  SuiteTree,
  CaseFilterBar,
  CaseListTable,
  CaseDetailDrawer,
} from '@/components/test-repository'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { useTestRepositoryStore, initializeStore } from '@/lib/store/test-repository-store'
import { mockSuites, mockCases } from '@/lib/data/mock-test-data'

export default function TestRepositoryPage() {
  const { selectedSuiteId, getSuiteById } = useTestRepositoryStore()
  const selectedSuite = selectedSuiteId ? getSuiteById(selectedSuiteId) : null

  // Initialize store with mock data
  React.useEffect(() => {
    initializeStore(mockSuites, mockCases)
  }, [])

  // Build breadcrumbs
  const breadcrumbs = [
    { title: 'Test Management', href: '#' },
    { title: 'Test Repository' },
  ]

  // Add selected suite to breadcrumbs if any
  if (selectedSuite) {
    breadcrumbs.push({ title: selectedSuite.name })
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
            <Button variant="outline" size="sm" className="gap-1.5">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/test-case/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Test Case
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Plus className="mr-2 h-4 w-4" />
                  New Test Suite
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Upload className="mr-2 h-4 w-4" />
                  Import from CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Suite Tree Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
            <SuiteTree />
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
                <CaseListTable />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Case Detail Drawer */}
      <CaseDetailDrawer />
    </AppShell>
  )
}
