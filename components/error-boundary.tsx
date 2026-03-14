'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Unhandled application error:', error, errorInfo)
    // TODO: Send error and stack to Sentry/monitoring provider
  }

  private handleTryAgain = (): void => {
    this.setState({ hasError: false })
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <div className="max-w-md space-y-3 text-center">
            <h2 className="text-2xl font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              We hit an unexpected issue while rendering this page.
            </p>
            <Button onClick={this.handleTryAgain}>Try again</Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
