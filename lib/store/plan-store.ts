'use client'

import { create } from 'zustand'
import { ApiError } from '@/lib/api/errors'
import {
  addRunToPlan as addRunToPlanRequest,
  approvePlan as approvePlanRequest,
  createPlan as createPlanRequest,
  getPlan,
  getPlanLinkedRuns,
  getPlanReadiness,
  getPlans,
  getPlanVersions,
  removeRunFromPlan as removeRunFromPlanRequest,
  updatePlan as updatePlanRequest,
} from '@/lib/api/plans'
import { planDtoToTestPlan } from '@/lib/api/adapters/plans'
import type { PlanCreateRequest, PlanUpdateRequest } from '@/lib/api/types/plans'
import type { TestPlan } from '@/types'

interface PlanStoreState {
  plans: TestPlan[]
  currentPlan: TestPlan | null
  isLoading: boolean
  error: string | null
  loadPlans: (projectId: string) => Promise<void>
  loadPlan: (projectId: string, id: string) => Promise<void>
  createPlan: (projectId: string, data: PlanCreateRequest) => Promise<TestPlan>
  updatePlan: (projectId: string, id: string, data: PlanUpdateRequest) => Promise<TestPlan>
  approvePlan: (projectId: string, id: string, comment?: string) => Promise<TestPlan>
  addRunToPlan: (projectId: string, id: string, runId: string) => Promise<void>
  removeRunFromPlan: (projectId: string, id: string, runId: string) => Promise<void>
  clearError: () => void
}

async function buildPlan(projectId: string, id: string): Promise<TestPlan> {
  const [dto, readiness, versions] = await Promise.all([
    getPlan(projectId, id),
    getPlanReadiness(projectId, id).catch(() => ({ score: 0 })),
    getPlanVersions(id).catch(() => []),
  ])

  return planDtoToTestPlan(dto, readiness, getPlanLinkedRuns(dto), versions)
}

export const usePlanStore = create<PlanStoreState>((set, get) => ({
  plans: [],
  currentPlan: null,
  isLoading: false,
  error: null,

  loadPlans: async (projectId) => {
    set({ isLoading: true, error: null })

    try {
      const dtos = await getPlans(projectId)

      const plans = await Promise.all(
        dtos.map(async (dto) => {
          const [readiness, versions] = await Promise.all([
            getPlanReadiness(projectId, dto.id).catch(() => ({ score: dto.metrics?.releaseReadinessScore ?? 0 })),
            getPlanVersions(dto.id).catch(() => []),
          ])

          return planDtoToTestPlan(dto, readiness, getPlanLinkedRuns(dto), versions)
        })
      )

      set({ plans, isLoading: false, error: null })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ plans: [], isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  loadPlan: async (projectId, id) => {
    set({ isLoading: true, error: null })

    try {
      const plan = await buildPlan(projectId, id)
      set({ currentPlan: plan, isLoading: false, error: null })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ currentPlan: null, isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  createPlan: async (projectId, data) => {
    set({ isLoading: true, error: null })

    try {
      const createdDto = await createPlanRequest(projectId, data)

      if (data.runIds && data.runIds.length > 0) {
        await Promise.all(
          data.runIds.map(async (runId) => {
            await addRunToPlanRequest(projectId, createdDto.id, runId)
          })
        )
      }

      const createdPlan = await buildPlan(projectId, createdDto.id)

      set((state) => ({
        plans: [createdPlan, ...state.plans],
        currentPlan: createdPlan,
        isLoading: false,
        error: null,
      }))

      return createdPlan
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  updatePlan: async (projectId, id, data) => {
    set({ isLoading: true, error: null })

    try {
      await updatePlanRequest(projectId, id, data)
      const updatedPlan = await buildPlan(projectId, id)

      set((state) => ({
        plans: state.plans.map((plan) => (plan.id === id ? updatedPlan : plan)),
        currentPlan: state.currentPlan?.id === id ? updatedPlan : state.currentPlan,
        isLoading: false,
        error: null,
      }))

      return updatedPlan
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  approvePlan: async (projectId, id, comment) => {
    set({ isLoading: true, error: null })

    try {
      await approvePlanRequest(projectId, id, { comment })
      const approvedPlan = await buildPlan(projectId, id)

      set((state) => ({
        plans: state.plans.map((plan) => (plan.id === id ? approvedPlan : plan)),
        currentPlan: state.currentPlan?.id === id ? approvedPlan : state.currentPlan,
        isLoading: false,
        error: null,
      }))

      return approvedPlan
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  addRunToPlan: async (projectId, id, runId) => {
    set({ isLoading: true, error: null })

    try {
      await addRunToPlanRequest(projectId, id, runId)
      const updatedPlan = await buildPlan(projectId, id)

      set((state) => ({
        plans: state.plans.map((plan) => (plan.id === id ? updatedPlan : plan)),
        currentPlan: state.currentPlan?.id === id ? updatedPlan : state.currentPlan,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  removeRunFromPlan: async (projectId, id, runId) => {
    set({ isLoading: true, error: null })

    try {
      await removeRunFromPlanRequest(projectId, id, runId)
      const updatedPlan = await buildPlan(projectId, id)

      set((state) => ({
        plans: state.plans.map((plan) => (plan.id === id ? updatedPlan : plan)),
        currentPlan: state.currentPlan?.id === id ? updatedPlan : state.currentPlan,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  clearError: () => set({ error: null }),
}))
