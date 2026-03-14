import { useCallback } from 'react'
import { UseFormSetError } from 'react-hook-form'
import { handleFormErrors, parseError, getUserFriendlyMessage } from '@/lib/utils/error-handling'

interface UseFormErrorHandlerOptions {
  onFieldError?: (field: string, message: string) => void
  onGeneralError?: (message: string) => void
}

/**
 * Hook for simplified form error handling
 * Automatically handles both field-specific and general errors
 */
export function useFormErrorHandler(
  setError: UseFormSetError<any>,
  options?: UseFormErrorHandlerOptions,
) {
  const handleError = useCallback(
    (error: unknown) => {
      const errorInfo = parseError(error)

      // Notify field-specific errors
      for (const fieldError of errorInfo.fieldErrors) {
        options?.onFieldError?.(fieldError.field, fieldError.message)
        setError(fieldError.field, {
          type: 'server',
          message: fieldError.message,
        })
      }

      // Notify and set general error if no field errors
      if (!errorInfo.isFieldError) {
        const message = getUserFriendlyMessage(errorInfo)
        options?.onGeneralError?.(message)
        setError('root', {
          type: 'server',
          message,
        })
      }
    },
    [setError, options],
  )

  return { handleError }
}
