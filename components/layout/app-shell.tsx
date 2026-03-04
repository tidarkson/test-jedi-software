'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  className?: string
}

export function AppShell({ children, sidebar, header, className }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  return (
    <AppShellContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed }}>
      <div className={cn('flex h-screen w-screen bg-background', className)}>
        {sidebar && (
          <aside
            className={cn(
              'h-screen flex-shrink-0 border-r border-border bg-sidebar transition-all duration-normal ease-in-out overflow-hidden',
              sidebarCollapsed ? 'w-16' : 'w-60'
            )}
          >
            {sidebar}
          </aside>
        )}
        <div className="flex h-screen flex-1 flex-col">
          {header}
          <main className="relative flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AppShellContext.Provider>
  )
}

// Context for sidebar state
interface AppShellContextValue {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

const AppShellContext = React.createContext<AppShellContextValue | undefined>(undefined)

export function useAppShell() {
  const context = React.useContext(AppShellContext)
  if (!context) {
    throw new Error('useAppShell must be used within an AppShell')
  }
  return context
}
