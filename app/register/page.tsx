'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/lib/store/auth-store'
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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { ErrorAlert } from '@/components/ui/error-alert'
import { CheckCircle2, Circle } from 'lucide-react'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const registerSchema = z
  .object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Enter a valid email address'),
    organizationName: z.string().min(1, 'Organization name is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        PASSWORD_REGEX,
        'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)',
      ),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type RegisterFormValues = z.infer<typeof registerSchema>

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { label: 'One number (0-9)', test: (p) => /\d/.test(p) },
  { label: 'One special character (@$!%*?&)', test: (p) => /[@$!%*?&]/.test(p) },
]

function PasswordRequirementsList({ password }: { password: string }) {
  return (
    <div className="space-y-2 rounded-md bg-muted/50 p-3">
      <p className="text-sm font-medium text-foreground">Password must contain:</p>
      <ul className="space-y-1">
        {passwordRequirements.map((req) => {
          const isMet = req.test(password)
          return (
            <li key={req.label} className="flex items-center gap-2 text-sm">
              {isMet ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={isMet ? 'text-green-600' : 'text-muted-foreground'}>
                {req.label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const register = useAuthStore((state) => state.register)
  const clearError = useAuthStore((state) => state.clearError)
  const isLoading = useAuthStore((state) => state.isLoading)
  const authError = useAuthStore((state) => state.error)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, router])

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      organizationName: '',
      password: '',
      confirmPassword: '',
    },
  })

  const { handleError } = useFormErrorHandler(form.setError)

  const onSubmit = async (values: RegisterFormValues) => {
    clearError()
    form.clearErrors('root')

    try {
      await register({
        name: values.name,
        email: values.email,
        organizationName: values.organizationName,
        password: values.password,
      })
      router.push('/dashboard')
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Set up your Test-Jedi account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@company.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." autoComplete="organization" {...field} />
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
                      <Input type="password" placeholder="Create a password" autoComplete="new-password" {...field} />
                    </FormControl>
                    {field.value && <PasswordRequirementsList password={field.value} />}
                    <FormDescription>
                      Your password must be strong to keep your account secure.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(form.formState.errors.root?.message || authError) && (
                <ErrorAlert
                  title="Registration Error"
                  message={form.formState.errors.root?.message ?? authError ?? ''}
                  onDismiss={() => {
                    form.clearErrors('root')
                    clearError()
                  }}
                />
              )}

              <Button type="submit" className="w-full" disabled={isLoading || form.formState.isSubmitting}>
                {isLoading || form.formState.isSubmitting ? (
                  <>
                    <Spinner className="mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>
          </Form>
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
