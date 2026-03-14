import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import { ApiError } from './errors'
import type { ApiSuccessResponse } from './types/common'

export const TOKEN_STORAGE_KEY = 'tj_access_token'
const API_TIMEOUT_MS = 30_000
const REFRESH_PATH = '/auth/refresh'

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

function dispatchLogoutEvent(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.dispatchEvent(new CustomEvent('auth:logout'))
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const refreshClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

async function requestTokenRefresh(): Promise<string> {
  const response = await refreshClient.post<ApiSuccessResponse<{ accessToken: string }>>(REFRESH_PATH)
  const accessToken = response.data?.data?.accessToken

  if (!accessToken) {
    throw new ApiError({
      code: response.status,
      error: 'TOKEN_REFRESH_FAILED',
      message: 'Refresh succeeded but no access token was returned',
      errors: [],
    })
  }

  setAccessToken(accessToken)
  return accessToken
}

let refreshPromise: Promise<string> | null = null

function refreshTokenOnce(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = requestTokenRefresh().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const headers = AxiosHeaders.from(config.headers ?? {})
    headers.set('Content-Type', 'application/json')

    const accessToken = getAccessToken()
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    config.headers = headers
    return config
  },
  (error) => Promise.reject(ApiError.fromResponse(error))
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const statusCode = error.response?.status
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (statusCode === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newToken = await refreshTokenOnce()
        const headers = AxiosHeaders.from(originalRequest.headers ?? {})
        headers.set('Authorization', `Bearer ${newToken}`)
        originalRequest.headers = headers

        return apiClient.request(originalRequest)
      } catch (refreshError) {
        clearAccessToken()
        dispatchLogoutEvent()
        return Promise.reject(ApiError.fromResponse(refreshError))
      }
    }

    return Promise.reject(ApiError.fromResponse(error))
  }
)

export default apiClient
