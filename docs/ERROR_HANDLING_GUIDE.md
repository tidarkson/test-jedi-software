/**
 * ERROR HANDLING GUIDE FOR TEST-JEDI
 * ===================================
 * 
 * This document outlines the comprehensive error handling system implemented
 * for seamless user experience across all features in Test-Jedi.
 * 
 * ## Overview
 * 
 * The error handling system consists of:
 * 1. Error parsing and formatting utilities (lib/utils/error-handling.ts)
 * 2. Reusable error alert components (components/ui/error-alert.tsx)
 * 3. Custom hooks for different contexts:
 *    - useFormErrorHandler: For react-hook-form based forms
 *    - useStoreError: For Zustand store errors
 *    - useErrorHandler: For general error formatting
 * 
 * ## Usage Patterns
 * 
 * ### 1. Form Pages (Login, Register, etc.)
 * 
 * ```tsx
 * import { useForm } from 'react-hook-form'
 * import { useFormErrorHandler } from '@/hooks/use-form-error-handler'
 * import { ErrorAlert } from '@/components/ui/error-alert'
 * 
 * export function MyFormPage() {
 *   const form = useForm<FormValues>({...})
 *   const { handleError } = useFormErrorHandler(form.setError)
 * 
 *   const onSubmit = async (values: FormValues) => {
 *     try {
 *       await submitForm(values)
 *     } catch (error) {
 *       handleError(error) // Automatically sets field and root errors
 *     }
 *   }
 * 
 *   return (
 *     <Form {...form}>
 *       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
 *         {/* Form fields... */}
 *         
 *         {form.formState.errors.root?.message && (
 *           <ErrorAlert
 *             title="Form Error"
 *             message={form.formState.errors.root.message}
 *             onDismiss={() => form.clearErrors('root')}
 *           />
 *         )}
 *       </form>
 *     </Form>
 *   )
 * }
 * ```
 * 
 * ### 2. Store-Based Pages (Projects, etc.)
 * 
 * ```tsx
 * import { useStoreError } from '@/hooks/use-store-error'
 * import { ErrorAlert } from '@/components/ui/error-alert'
 * 
 * export function MyStoreBasedPage() {
 *   const storeError = useMyStore((state) => state.error)
 *   const clearError = useMyStore((state) => state.clearError)
 *   
 *   const { error: displayError, dismissError } = useStoreError(
 *     storeError,
 *     clearError
 *   )
 * 
 *   return (
 *     <div>
 *       {displayError && (
 *         <ErrorAlert
 *           title="Operation Failed"
 *           message={displayError}
 *           onDismiss={dismissError}
 *         />
 *       )}
 *       {/* Page content... */}
 *     </div>
 *   )
 * }
 * ```
 * 
 * ### 3. Toast Notifications (for quick feedback)
 * 
 * ```tsx
 * import { toast } from 'sonner'
 * import { useErrorHandler } from '@/hooks/use-store-error'
 * 
 * export function MyComponent() {
 *   const { getUserMessage } = useErrorHandler()
 * 
 *   const handleAction = async () => {
 *     try {
 *       await performAction()
 *     } catch (error) {
 *       toast.error(getUserMessage(error))
 *     }
 *   }
 * }
 * ```
 * 
 * ## Error Types Handled
 * 
 * ### API Errors (via ApiError class)
 * - **400 Bad Request**: Validation errors with field-level details
 * - **401 Unauthorized**: Authentication failures
 * - **403 Forbidden**: Permission issues
 * - **404 Not Found**: Resource not found
 * - **409 Conflict**: Duplicate resources (e.g., organization name)
 * - **422 Unprocessable Entity**: Invalid data format
 * - **429 Too Many Requests**: Rate limiting
 * - **500+ Server Errors**: Server-side failures
 * 
 * ### Network Errors
 * - Connection failures
 * - Timeout issues
 * 
 * ### Validation Errors
 * - Frontend validation (Zod)
 * - Backend validation (field-specific errors)
 * 
 * ## Components & Utilities
 * 
 * ### ErrorAlert Component
 * Displays errors in a styled alert box
 * 
 * Props:
 * - `message` (required): Error message to display
 * - `title`: Optional alert title
 * - `variant`: 'error' | 'warning'
 * - `onDismiss`: Callback to dismiss alert
 * - `className`: Additional CSS classes
 * 
 * ### SuccessAlert Component
 * Displays success messages in a styled alert box
 * 
 * Props:
 * - `message` (required): Success message
 * - `title`: Optional alert title
 * - `onDismiss`: Callback to dismiss
 * - `className`: Additional CSS classes
 * 
 * ### Utility Functions
 * 
 * #### parseError(error)
 * Parses any error type into standardized ErrorInfo object
 * Returns: { message, code, fieldErrors, isFieldError, isValidationError }
 * 
 * #### getUserFriendlyMessage(errorInfo)
 * Converts error info to user-friendly message
 * 
 * #### handleFormErrors(error, setError)
 * Maps errors to react-hook-form setError calls
 * 
 * #### getFieldError(error, field)
 * Extracts specific field error message
 * 
 * #### isNetworkError(error)
 * Detects network errors
 * 
 * #### isAuthError(error)
 * Detects authentication errors
 * 
 * #### isValidationError(error)
 * Detects validation errors
 * 
 * ## Best Practices
 * 
 * 1. **Always show user-friendly messages**: The error handling system
 *    automatically converts API error codes to readable messages
 * 
 * 2. **Use field-specific errors for forms**: Display validation errors
 *    directly below form fields using react-hook-form's FormMessage
 * 
 * 3. **Show general errors prominently**: Root/general errors should be
 *    displayed in an alert at the top of the page/form
 * 
 * 4. **Provide dismiss actions**: Always include onDismiss to let users
 *    close error alerts
 * 
 * 5. **Log errors for debugging**: Store error responses for support/debugging
 * 
 * 6. **Handle async operations carefully**: Set loading state during requests
 *    and clear error state when retrying
 * 
 * ## Implementation Checklist
 * 
 * For each page/feature that needs error handling:
 * 
 * - [ ] Import error utilities/components
 * - [ ] Wrap API calls in try-catch
 * - [ ] Use appropriate hook for error handling (form/store/general)
 * - [ ] Display error in appropriate component (alert/toast/field)
 * - [ ] Include dismiss/clear actions
 * - [ ] Test with various error scenarios
 * - [ ] Ensure messages are user-friendly
 * 
 * ## Examples by Feature
 * 
 * See the following pages for complete implementations:
 * - Auth (Login/Register): app/login/page.tsx, app/register/page.tsx
 * - Projects: app/projects/page.tsx
 * - Forms with validation: See useFormErrorHandler examples
 * 
 */

export {}
