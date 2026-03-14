import axios, { type AxiosError } from 'axios'
import type { ApiErrorResponse, ApiFieldError } from './types/common'

export class ApiError extends Error {
  public readonly code: number
  public readonly error: string
  public readonly errors: ApiFieldError[]

  constructor(params: { code: number; error: string; message: string; errors?: ApiFieldError[] }) {
    super(params.message)
    this.name = 'ApiError'
    this.code = params.code
    this.error = params.error
    this.errors = params.errors ?? []
  }

  static fromResponse(axiosError: AxiosError<ApiErrorResponse> | unknown): ApiError {
    if (axios.isAxiosError<ApiErrorResponse>(axiosError)) {
      const response = axiosError.response
      const data = response?.data

      if (data && data.status === 'error') {
        return new ApiError({
          code: typeof data.code === 'number' ? data.code : response?.status ?? 500,
          error: data.error ?? 'API_ERROR',
          message: data.message ?? 'Request failed',
          errors: Array.isArray(data.errors) ? data.errors : [],
        })
      }

      if (response) {
        return new ApiError({
          code: response.status,
          error: 'HTTP_ERROR',
          message: axiosError.message || 'HTTP request failed',
          errors: [],
        })
      }

      return new ApiError({
        code: 0,
        error: 'NETWORK_ERROR',
        message: axiosError.message || 'Network error',
        errors: [],
      })
    }

    if (axiosError instanceof Error) {
      return new ApiError({
        code: 0,
        error: 'UNKNOWN_ERROR',
        message: axiosError.message,
        errors: [],
      })
    }

    return new ApiError({
      code: 0,
      error: 'UNKNOWN_ERROR',
      message: 'Unknown error',
      errors: [],
    })
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError
}
