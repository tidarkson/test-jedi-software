/**
 * ERROR HANDLING IMPLEMENTATION EXAMPLES
 * =====================================
 * 
 * This file contains concrete examples of implementing error handling
 * for different types of operations in Test-Jedi.
 */

// ============================================================================
// EXAMPLE 1: Form with Validation (Authentication, CRUD forms)
// ============================================================================

/*
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useFormErrorHandler } from '@/hooks/use-form-error-handler'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

const mySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
})

type MyFormValues = z.infer<typeof mySchema>

export function MyFormPage() {
  const form = useForm<MyFormValues>({
    resolver: zodResolver(mySchema),
    defaultValues: { name: '', email: '' }
  })

  const { handleError } = useFormErrorHandler(form.setError, {
    onGeneralError: (message) => {
      // Optional: additional handling for general errors
      console.log('Form error:', message)
    }
  })

  const onSubmit = async (values: MyFormValues) => {
    form.clearErrors('root')
    try {
      await submitForm(values)
      // Success handling
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {form.formState.errors.root?.message && (
          <ErrorAlert
            title="Form Error"
            message={form.formState.errors.root.message}
            onDismiss={() => form.clearErrors('root')}
          />
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

//       </form>
//     </Form>
//   )
// }
// */

// ============================================================================
// EXAMPLE 2: Store-Based Operations (Projects, Test Plans, etc.)
// ============================================================================

/*
import { useStoreError } from '@/hooks/use-store-error'
import { ErrorAlert } from '@/components/ui/error-alert'
import { useMyStore } from '@/lib/store/my-store'

export function MyStoreBasedPage() {
  const items = useMyStore((state) => state.items)
  const isLoading = useMyStore((state) => state.isLoading)
  const storeError = useMyStore((state) => state.error)
  const clearError = useMyStore((state) => state.clearError)
  const loadItems = useMyStore((state) => state.loadItems)
  const deleteItem = useMyStore((state) => state.deleteItem)

  const { error: displayError, dismissError } = useStoreError(
    storeError,
    clearError,
    {
      autoHide: false, // Keep error visible until user dismisses
      onError: (message) => console.error('Store error:', message)
    }
  )

  useEffect(() => {
    loadItems().catch(() => {}) // Store handles error internally
  }, [loadItems])

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id)
      // Success handling
    } catch (error) {
      // Error already in store, will be picked up by useStoreError hook
    }
  }

  return (
    <div className="space-y-6">
      {displayError && (
        <ErrorAlert
          title="Operation Failed"
          message={displayError}
          onDismiss={dismissError}
        />
      )}

      {isLoading ? (
        <Skeleton />
      ) : (
        <div>
          {items.map((item) => (
            <div key={item.id}>
              {item.name}
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
*/

// ============================================================================
// EXAMPLE 3: Toast Notifications (For quick feedback on actions)
// ============================================================================

/*
import { toast } from 'sonner'
import { useErrorHandler } from '@/hooks/use-store-error'

export function MyComponent() {
  const { getUserMessage } = useErrorHandler()

  const handleQuickAction = async () => {
    try {
      await performAction()
      toast.success('Action completed successfully')
    } catch (error) {
      toast.error(getUserMessage(error))
    }
  }

  return <button onClick={handleQuickAction}>Perform Action</button>
}
*/

// ============================================================================
// EXAMPLE 4: Zustand Store with Proper Error Handling
// ============================================================================

/*
import { create } from 'zustand'
import { ApiError } from '@/lib/api/errors'
import * as api from '@/lib/api/my-resource'

interface MyStorState {
  items: any[]
  isLoading: boolean
  error: string | null
  
  // Actions
  loadItems: () => Promise<void>
  createItem: (data: any) => Promise<any>
  deleteItem: (id: string) => Promise<void>
  clearError: () => void
}

export const useMyStore = create<MyStoreState>((set) => ({
  items: [],
  isLoading: false,
  error: null,

  loadItems: async () => {
    set({ isLoading: true, error: null })
    try {
      const items = await api.getItems()
      set({ items, isLoading: false })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  createItem: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const newItem = await api.createItem(data)
      set((state) => ({
        items: [...state.items, newItem],
        isLoading: false,
      }))
      return newItem
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await api.deleteItem(id)
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      const apiError = ApiError.fromResponse(error)
      set({ isLoading: false, error: apiError.message })
      throw apiError
    }
  },

  clearError: () => set({ error: null }),
}))
*/

// ============================================================================
// EXAMPLE 5: Component with Loading and Error States
// ============================================================================

/*
import { useEffect, useState } from 'react'
import { ErrorAlert, SuccessAlert } from '@/components/ui/error-alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export function ResourceDetail({ id }: { id: string }) {
  const [resource, setResource] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadResource = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchResource(id)
      setResource(data)
    } catch (err) {
      const apiError = ApiError.fromResponse(err)
      setError(apiError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (data: any) => {
    setError(null)
    setSuccessMessage(null)
    try {
      await updateResource(id, data)
      setSuccessMessage('Resource updated successfully')
      await loadResource()
    } catch (err) {
      const apiError = ApiError.fromResponse(err)
      setError(apiError.message)
    }
  }

  useEffect(() => {
    loadResource()
  }, [id])

  return (
    <div className="space-y-4">
      {error && (
        <ErrorAlert
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {successMessage && (
        <SuccessAlert
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {isLoading ? (
        <Skeleton className="h-32" />
      ) : (
        <div>
//           <Button onClick={() => handleUpdate(newData)}>Update</Button>
//         </div>
//       )}
//     </div>
//   )
// }
// */

export {}
