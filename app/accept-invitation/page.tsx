'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { acceptInvitation } from '@/lib/api/admin'
import { useFormErrorHandler } from '@/hooks/use-form-error-handler'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

const acceptInvitationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type AcceptInvitationFormValues = z.infer<typeof acceptInvitationSchema>

function AcceptInvitationPageContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAccepted, setIsAccepted] = useState(false)

  const form = useForm<AcceptInvitationFormValues>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      name: '',
      password: '',
    },
  })

  const { handleError } = useFormErrorHandler(form.setError)

  const onSubmit = async (values: AcceptInvitationFormValues) => {
    form.clearErrors('root')

    if (!token) {
      form.setError('root', {
        message: 'Invitation token is missing. Please use the invitation link from your email.',
      })
      return
    }

    try {
      setIsSubmitting(true)
      await acceptInvitation({
        token,
        name: values.name,
        password: values.password,
      })

      setIsAccepted(true)
      toast.success('Invitation accepted. You can now sign in.')
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Accept invitation</CardTitle>
          <CardDescription>Complete your profile to join the organization.</CardDescription>
        </CardHeader>
        <CardContent>
          {isAccepted ? (
            <div className="space-y-3 text-sm">
              <p className="text-foreground">Your invitation has been accepted successfully.</p>
              <p className="text-muted-foreground">Use your email and password to sign in.</p>
              <Button asChild className="w-full">
                <Link href="/login">Go to sign in</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create your password"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root?.message && (
                  <ErrorAlert
                    title="Invitation Error"
                    message={form.formState.errors.root.message}
                    onDismiss={() => form.clearErrors('root')}
                  />
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting || form.formState.isSubmitting}>
                  {isSubmitting || form.formState.isSubmitting ? (
                    <>
                      <Spinner className="mr-2" />
                      Accepting invitation...
                    </>
                  ) : (
                    'Accept invitation'
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
          <Spinner className="h-5 w-5" />
        </main>
      }
    >
      <AcceptInvitationPageContent />
    </Suspense>
  )
}
