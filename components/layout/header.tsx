'use client'

import * as React from 'react'
import Link from 'next/link'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface BreadcrumbItem {
  title: string
  href?: string
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[]
  className?: string
}

export function Header({ breadcrumbs = [], className }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = React.useState(false)

  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between border-b border-border bg-surface-base px-4',
        className
      )}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-1">
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
                <AvatarImage src="/avatars/user.png" alt="User" />
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  JD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">John Doe</p>
                <p className="text-xs leading-none text-muted-foreground">
                  john.doe@example.com
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
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
