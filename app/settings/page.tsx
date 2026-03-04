'use client'

import * as React from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { AdminGuard, CustomFieldsManager, AuditLogTable, RetentionRulesManager } from '@/components/admin'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, List, History, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const breadcrumbs = [
    { title: 'Administration', href: '#' },
    { title: 'Settings' },
  ]

  return (
    <AppShell
      sidebar={<Sidebar />}
      header={<Header breadcrumbs={breadcrumbs} />}
    >
      <AdminGuard>
        <div className="h-full overflow-auto p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Configure custom fields, view audit logs, and manage data retention
              </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="custom-fields" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none">
                <TabsTrigger value="custom-fields" className="gap-2">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Custom Fields</span>
                </TabsTrigger>
                <TabsTrigger value="audit-log" className="gap-2">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">Audit Log</span>
                </TabsTrigger>
                <TabsTrigger value="retention" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Data Retention</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="custom-fields">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Custom Fields
                    </CardTitle>
                    <CardDescription>
                      Define custom fields for test cases to capture additional metadata specific to your workflow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CustomFieldsManager />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audit-log">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Audit Log
                    </CardTitle>
                    <CardDescription>
                      Track all changes made to test cases, suites, and system settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AuditLogTable />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="retention">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trash2 className="h-5 w-5" />
                      Data Retention
                    </CardTitle>
                    <CardDescription>
                      Configure automatic data cleanup policies to manage storage and compliance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RetentionRulesManager />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </AdminGuard>
    </AppShell>
  )
}
