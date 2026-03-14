'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { completeJiraOAuthCallback } from '@/lib/api/integrations'
import { useIntegrationStore } from '@/lib/store/integration-store'
import { useProjectStore } from '@/lib/store/project-store'

function decodeProjectIdFromState(state: string): string | null {
  try {
    const decoded = JSON.parse(atob(state.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof decoded?.projectId === 'string' ? decoded.projectId : null
  } catch {
    return null
  }
}

function JiraOauthCallbackPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      toast.error('Missing Jira OAuth callback parameters')
      router.replace('/settings')
      return
    }

    const sync = async () => {
      try {
        await completeJiraOAuthCallback(code, state)

        const projectIdFromState = decodeProjectIdFromState(state)
        const currentProjectId = useProjectStore.getState().currentProjectId
        const effectiveProjectId = projectIdFromState ?? currentProjectId

        if (projectIdFromState && projectIdFromState !== currentProjectId) {
          useProjectStore.getState().setCurrentProject(projectIdFromState)
        }

        if (effectiveProjectId) {
          await useIntegrationStore.getState().loadIntegrations(effectiveProjectId)
        }

        toast.success('Jira integration connected successfully')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to complete Jira OAuth callback'
        toast.error(message)
      } finally {
        router.replace('/settings')
      }
    }

    void sync()
  }, [router, searchParams])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Completing Jira OAuth connection...
      </div>
    </div>
  )
}

export default function JiraOauthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Completing Jira OAuth connection...
          </div>
        </div>
      }
    >
      <JiraOauthCallbackPageContent />
    </Suspense>
  )
}
