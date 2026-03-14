'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { useProjectStore } from '@/lib/store/project-store'
import { useStoreError } from '@/hooks/use-store-error'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Check, FolderKanban, Plus } from 'lucide-react'

export default function ProjectsPage() {
  const projects = useProjectStore((state) => state.projects)
  const currentProjectId = useProjectStore((state) => state.currentProjectId)
  const isLoading = useProjectStore((state) => state.isLoading)
  const storeError = useProjectStore((state) => state.error)
  const clearStoreError = useProjectStore((state) => state.clearError)
  const loadProjects = useProjectStore((state) => state.loadProjects)
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)
  const createProject = useProjectStore((state) => state.createProject)
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [isCreating, setIsCreating] = React.useState(false)

  const breadcrumbs = [
    { title: 'Administration', href: '#' },
    { title: 'Projects' },
  ]

  const { error: displayError, dismissError } = useStoreError(storeError, clearStoreError)

  React.useEffect(() => {
    void loadProjects().catch(() => undefined)
  }, [loadProjects])

  const handleCreateProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error('Project name is required')
      return
    }

    try {
      setIsCreating(true)
      await createProject({
        name: trimmedName,
        description: description.trim() || undefined,
      })
      setName('')
      setDescription('')
      toast.success('Project created and selected')
    } catch {
      // Handled by store error + display
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <AppShell sidebar={<Sidebar />} header={<Header breadcrumbs={breadcrumbs} />}>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="mt-2 text-muted-foreground">
            Create projects and switch your active working context.
          </p>
        </div>

        {displayError && (
          <ErrorAlert
            title="Error"
            message={displayError}
            onDismiss={dismissError}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create New Project
            </CardTitle>
            <CardDescription>
              New projects are available immediately in the header switcher.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleCreateProject}>
              <Input
                placeholder="Project name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isCreating || isLoading}
              />
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isCreating || isLoading}
                rows={3}
              />
              <Button type="submit" disabled={isCreating || isLoading}>
                {isCreating ? 'Creating...' : 'Create Project'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Your Projects</h2>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="flex items-center gap-3 py-6">
                <FolderKanban className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                  No projects yet. Create one to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const isCurrent = project.id === currentProjectId

                return (
                  <Card key={project.id} className={isCurrent ? 'border-primary' : undefined}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        <span className="truncate">{project.name}</span>
                        {isCurrent && (
                          <Badge variant="default" className="gap-1">
                            <Check className="h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant={isCurrent ? 'secondary' : 'outline'}
                        onClick={() => setCurrentProject(project.id)}
                        disabled={isCurrent}
                      >
                        {isCurrent ? 'Current Project' : 'Switch to Project'}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
