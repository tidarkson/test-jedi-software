import { useEffect, useState } from 'react'
import { getUserFriendlyMessage, parseError } from '@/lib/utils/error-handling'

interface UseStoreErrorOptions {
  onError?: (message: string) => void
  autoHide?: boolean
  duration?: number
}

/**
 * Hook for managing and displaying store errors
 * Watches store error state and provides user-friendly message
 */
export function useStoreError(
  storeError: string | null,
  clearError: () => void,
  options?: UseStoreErrorOptions,
) {
  const [displayError, setDisplayError] = useState<string | null>(null)

  useEffect(() => {
    if (storeError) {
      setDisplayError(storeError)
      options?.onError?.(storeError)

      if (options?.autoHide) {
        const timeout = setTimeout(() => {
          setDisplayError(null)
          clearError()
        }, options?.duration ?? 5000)

        return () => clearTimeout(timeout)
      }
    }
  }, [storeError, clearError, options])

  const dismissError = () => {
    setDisplayError(null)
    clearError()
  }

  return {
    error: displayError,
    dismissError,
  }
}

/**
 * Hook for extracting and formatting API error messages for UI
 * Converts raw errors into user-friendly messages
 */
export function useErrorHandler() {
  const getUserMessage = (error: unknown): string => {
    const errorInfo = parseError(error)
    return getUserFriendlyMessage(errorInfo)
  }

  return { getUserMessage }
}
