'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { TOKEN_STORAGE_KEY } from '@/lib/api/client'
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '@/lib/api/auth'
import { ApiError } from '@/lib/api/errors'
import type { LoginRequest, RegisterRequest, UserProfile } from '@/lib/api/types/auth'

const AUTH_COOKIE_KEY = 'tj_access_token'
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  clearError: () => void
}

let hasLogoutListener = false
let isProcessingLogout = false

function setAuthCookie(token: string): void {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${AUTH_COOKIE_KEY}=${encodeURIComponent(token)}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; samesite=lax`
}

function clearAuthCookie(): void {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`
}

function clearStoredSession(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  }

  clearAuthCookie()
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })

        try {
          const payload = await loginRequest(credentials)

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.accessToken)
          }

          setAuthCookie(payload.accessToken)
          set({
            user: payload.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const apiError = ApiError.fromResponse(error)
          set({
            isLoading: false,
            error: apiError.message,
            user: null,
            isAuthenticated: false,
          })
          throw apiError
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })

        try {
          const payload = await registerRequest(data)

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.accessToken)
          }

          setAuthCookie(payload.accessToken)
          set({
            user: payload.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const apiError = ApiError.fromResponse(error)
          set({
            isLoading: false,
            error: apiError.message,
            user: null,
            isAuthenticated: false,
          })
          throw apiError
        }
      },

      logout: async () => {
        if (isProcessingLogout) {
          clearStoredSession()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
          return
        }

        isProcessingLogout = true
        set({ isLoading: true, error: null })

        try {
          await logoutRequest()
        } catch {
          // Intentionally ignored so local session is always cleared
        } finally {
          clearStoredSession()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
          isProcessingLogout = false
        }
      },

      loadUser: async () => {
        if (typeof window === 'undefined') {
          return
        }

        const token = window.localStorage.getItem(TOKEN_STORAGE_KEY)

        if (!token) {
          clearStoredSession()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
          return
        }

        setAuthCookie(token)
        set({ isLoading: true, error: null })

        try {
          const user = await getMe()
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const apiError = ApiError.fromResponse(error)
          clearStoredSession()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: apiError.message,
          })
          throw apiError
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'tj-auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

if (typeof window !== 'undefined' && !hasLogoutListener) {
  window.addEventListener('auth:logout', () => {
    void useAuthStore.getState().logout()
  })
  hasLogoutListener = true
}
