import * as React from 'react'
import { AlertCircle, CheckIcon, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export interface ErrorAlertProps {
  title?: string
  message: string
  variant?: 'error' | 'warning'
  onDismiss?: () => void
  className?: string
}

export interface SuccessAlertProps {
  title?: string
  message: string
  onDismiss?: () => void
  className?: string
}

/**
 * Reusable error alert component for forms and pages
 * Displays API errors and validation messages in a consistent manner
 */
export function ErrorAlert({
  title = 'Error',
  message,
  variant = 'error',
  onDismiss,
  className,
}: ErrorAlertProps) {
  if (!message) return null

  const Icon = variant === 'error' ? AlertCircle : AlertTriangle

  return (
    <Alert variant={variant === 'error' ? 'destructive' : 'default'} className={className}>
      <Icon className="h-4 w-4" />
      <div className="flex flex-col gap-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{message}</AlertDescription>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto text-xs font-medium opacity-70 hover:opacity-100"
        >
          Dismiss
        </button>
      )}
    </Alert>
  )
}

/**
 * Reusable success alert component
 */
export function SuccessAlert({
  title = 'Success',
  message,
  onDismiss,
  className,
}: SuccessAlertProps) {
  if (!message) return null

  return (
    <Alert variant="default" className={`border-green-200 bg-green-50 ${className || ''}`}>
      <CheckIcon className="h-4 w-4 text-green-600" />
      <div className="flex flex-col gap-1">
        {title && <AlertTitle className="text-green-900">{title}</AlertTitle>}
        <AlertDescription className="text-green-800">{message}</AlertDescription>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto text-xs font-medium opacity-70 hover:opacity-100"
        >
          Dismiss
        </button>
      )}
    </Alert>
  )
}
