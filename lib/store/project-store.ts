'use client'

import { create } from 'zustand'
import { ApiError } from '@/lib/api/errors'
import {
  createProject as createProjectRequest,
  getProjectDefectCount,
  getProjectRunCount,
  getProjects,
} from '@/lib/api/projects'
import type { Project } from '@/lib/api/types/projects'
import { useAuthStore } from './auth-store'

const PROJECT_STORAGE_KEY = 'tj_current_project'

function getStoredProjectId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(PROJECT_STORAGE_KEY)
}

function setStoredProjectId(projectId: string | null): void {
  if (typeof window === 'undefined') {
    return
  }

  if (!projectId) {
    window.localStorage.removeItem(PROJECT_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(PROJECT_STORAGE_KEY, projectId)
}

interface ProjectStoreState {
  projects: Project[]
  currentProjectId: string | null
  sidebarCounts: {
    activeRuns: number
    openDefects: number
    isLoading: boolean
  }
  isLoading: boolean
  error: string | null
  loadProjects: () => Promise<void>
  loadSidebarCounts: (projectId: string) => Promise<void>
  setCurrentProject: (id: string | null) => void
  createProject: (data: { name: string; description?: string }) => Promise<Project>
  clearError: () => void
}

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  projects: [],
  currentProjectId: null,
  sidebarCounts: {
    activeRuns: 0,
    openDefects: 0,
    isLoading: false,
  },
  isLoading: false,
  error: null,

  loadProjects: async () => {
    const organizationId = useAuthStore.getState().user?.organizationId

    if (!organizationId) {
      set({
        projects: [],
        currentProjectId: null,
        sidebarCounts: {
          activeRuns: 0,
          openDefects: 0,
          isLoading: false,
        },
        isLoading: false,
        error: null,
      })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const projects = await getProjects(organizationId)
      const activeProjectId = get().currentProjectId ?? getStoredProjectId()
      const isCurrentProjectValid = !!activeProjectId && projects.some((project) => project.id === activeProjectId)
      const nextProjectId = isCurrentProjectValid ? activeProjectId : (projects[0]?.id ?? null)

      setStoredProjectId(nextProjectId)
      set({
        projects,
        currentProjectId: nextProjectId,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({
        isLoading: false,
        error: apiError.message,
      })
      throw apiError
    }
  },

  setCurrentProject: (id) => {
    setStoredProjectId(id)
    set({ currentProjectId: id, error: null })
  },

  loadSidebarCounts: async (projectId) => {
    set((state) => ({
      sidebarCounts: {
        ...state.sidebarCounts,
        isLoading: true,
      },
    }))

    try {
      const [activeRuns, openDefects] = await Promise.all([
        getProjectRunCount(projectId),
        getProjectDefectCount(projectId),
      ])

      set({
        sidebarCounts: {
          activeRuns,
          openDefects,
          isLoading: false,
        },
      })
    } catch {
      set({
        sidebarCounts: {
          activeRuns: 0,
          openDefects: 0,
          isLoading: false,
        },
      })
    }
  },

  clearError: () => {
    set({ error: null })
  },

  createProject: async (data) => {
    const organizationId = useAuthStore.getState().user?.organizationId

    if (!organizationId) {
      const apiError = new ApiError({
        code: 400,
        error: 'ORG_CONTEXT_MISSING',
        message: 'Unable to create project without organization context',
        errors: [],
      })
      set({ error: apiError.message })
      throw apiError
    }

    set({ isLoading: true, error: null })

    try {
      const createdProject = await createProjectRequest(organizationId, data)
      const nextProjects = [...get().projects, createdProject]

      setStoredProjectId(createdProject.id)
      set({
        projects: nextProjects,
        currentProjectId: createdProject.id,
        isLoading: false,
        error: null,
      })

      return createdProject
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({
        isLoading: false,
        error: apiError.message,
      })
      throw apiError
    }
  },
}))
