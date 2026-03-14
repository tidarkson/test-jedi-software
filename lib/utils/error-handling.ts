/**
 * Error handling utilities for consistent error messages and field extraction
 */

import { ApiError } from '@/lib/api/errors'
import type { ApiFieldError } from '@/lib/api/types/common'

export interface FormFieldError {
  field: string
  message: string
}

export interface ErrorInfo {
  message: string
  code?: number
  error?: string
  fieldErrors: FormFieldError[]
  isFieldError: boolean
  isValidationError: boolean
}

/**
 * Extract error information from unknown error source
 */
export function parseError(error: unknown): ErrorInfo {
  if (error instanceof ApiError) {
    const fieldErrors = (error.errors ?? []).map((err: ApiFieldError) => ({
      field: err.field,
      message: err.message,
    })) as FormFieldError[]

    return {
      message: error.message,
      code: error.code,
      error: error.error,
      fieldErrors,
      isFieldError: fieldErrors.length > 0,
      isValidationError: error.code === 400,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      fieldErrors: [],
      isFieldError: false,
      isValidationError: false,
    }
  }

  return {
    message: 'An unexpected error occurred. Please try again.',
    fieldErrors: [],
    isFieldError: false,
    isValidationError: false,
  }
}

/**
 * Get user-friendly error message based on error code
 */
export function getUserFriendlyMessage(error: ErrorInfo): string {
  // Use the original message if available, as it's usually user-friendly
  if (error.message) {
    return error.message
  }

  // Fallback messages based on error type
  if (error.code === 400) {
    return 'Please check your input and try again.'
  }

  if (error.code === 401) {
    return 'Your session has expired. Please sign in again.'
  }

  if (error.code === 403) {
    return 'You do not have permission to perform this action.'
  }

  if (error.code === 404) {
    return 'The requested resource was not found.'
  }

  if (error.code === 409) {
    return 'This action conflicts with existing data. Please check and try again.'
  }

  if (error.code === 422) {
    return 'The data you provided is invalid. Please check and try again.'
  }

  if (error.code === 429) {
    return 'Too many requests. Please wait a moment and try again.'
  }

  if (error.code === 500 || error.code === 502 || error.code === 503) {
    return 'Server error. Please try again later or contact support.'
  }

  if (error.code === 0) {
    return 'Network error. Please check your connection and try again.'
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Handle form submission errors
 * Maps field errors to react-hook-form setError
 */
export function handleFormErrors(
  error: unknown,
  setError: (
    field: string,
    error: { type: string; message: string },
  ) => void,
): void {
  const errorInfo = parseError(error)

  // Set field-specific errors first
  for (const fieldError of errorInfo.fieldErrors) {
    setError(fieldError.field, {
      type: 'server',
      message: fieldError.message,
    })
  }

  // Set root error if no field errors or if it's a general error
  if (!errorInfo.isFieldError) {
    const message = getUserFriendlyMessage(errorInfo)
    setError('root', {
      type: 'server',
      message,
    })
  }
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.code === 0
  }
  return false
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.code === 401
  }
  return false
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.code === 400
  }
  return false
}

/**
 * Get a specific field error message
 */
export function getFieldError(error: unknown, field: string): string | null {
  const errorInfo = parseError(error)
  const fieldError = errorInfo.fieldErrors.find((e) => e.field === field)
  return fieldError?.message ?? null
}
