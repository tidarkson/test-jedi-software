'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Search,
  Bell,
  HelpCircle,
  ChevronRight,
  Moon,
  Sun,
  Settings,
  LogOut,
  User,
  ChevronsUpDown,
  Plus,
  FolderKanban,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/lib/store/auth-store'
import { useProjectStore } from '@/lib/store/project-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'
import { Skeleton } from '@/components/ui/skeleton'

interface BreadcrumbItem {
  title: string
  href?: string
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[]
  className?: string
}

export function Header({ breadcrumbs = [], className }: HeaderProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const isLoading = useAuthStore((state) => state.isLoading)
  const projects = useProjectStore((state) => state.projects)
  const currentProjectId = useProjectStore((state) => state.currentProjectId)
  const isProjectsLoading = useProjectStore((state) => state.isLoading)
  const loadProjects = useProjectStore((state) => state.loadProjects)
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)

  React.useEffect(() => {
    if (!user?.organizationId) {
      return
    }

    void loadProjects().catch(() => undefined)
  }, [user?.organizationId, loadProjects])

  const currentProject = React.useMemo(() => {
    return projects.find((project) => project.id === currentProjectId) ?? null
  }, [projects, currentProjectId])

  const initials = React.useMemo(() => {
    if (!user?.name) {
      return 'U'
    }

    return user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  }, [user?.name])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleProjectSelect = (projectId: string) => {
    setCurrentProject(projectId)
    router.refresh()
  }

  const handleCreateProject = () => {
    router.push('/projects')
  }

  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between border-b border-border bg-surface-base px-4',
        className
      )}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-3">
        {isProjectsLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 max-w-64 justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border"
                    style={currentProject?.color ? { backgroundColor: currentProject.color } : undefined}
                  >
                    {currentProject?.icon ? (
                      <span className="text-[11px] leading-none">{currentProject.icon}</span>
                    ) : (
                      <FolderKanban className="h-3 w-3" />
                    )}
                  </div>
                  <span className="truncate text-sm">
                    {currentProject?.name ?? 'Select Project'}
                  </span>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="start">
              <DropdownMenuLabel>Projects</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => handleProjectSelect(project.id)}
                  className="flex items-center gap-2"
                >
                  <div
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border"
                    style={project.color ? { backgroundColor: project.color } : undefined}
                  >
                    {project.icon ? (
                      <span className="text-[11px] leading-none">{project.icon}</span>
                    ) : (
                      <FolderKanban className="h-3 w-3" />
                    )}
                  </div>
                  <span className="truncate">{project.name}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCreateProject}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Create New Project</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{item.title}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : (
          <span className="text-sm font-medium text-foreground">Dashboard</span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          {searchOpen ? (
            <div className="flex items-center">
              <Input
                type="search"
                placeholder="Search tests, suites, runs..."
                className="w-64"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="h-8 w-8"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          )}
        </div>

        {/* Help */}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            5
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || undefined} alt="User" />
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name ?? 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email ?? ''}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout} disabled={isLoading}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
