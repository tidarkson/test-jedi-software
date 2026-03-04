'use client'

import * as React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { ActivityFeedItem } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Clock,
  Bug,
  Play,
  LogOut,
} from 'lucide-react'

interface RecentActivityFeedProps {
  items: ActivityFeedItem[]
  className?: string
  maxItems?: number
}

const activityConfig = {
  status_changed: {
    icon: RefreshCw,
    label: 'Status Changed',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  case_completed: {
    icon: CheckCircle2,
    label: 'Case Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  defect_logged: {
    icon: Bug,
    label: 'Defect Logged',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  case_assigned: {
    icon: Clock,
    label: 'Case Assigned',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  comment_added: {
    icon: MessageSquare,
    label: 'Comment Added',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  run_started: {
    icon: Play,
    label: 'Run Started',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  run_closed: {
    icon: LogOut,
    label: 'Run Closed',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
  },
}

export function RecentActivityFeed({
  items,
  className,
  maxItems = 10,
}: RecentActivityFeedProps) {
  const displayItems = items.slice(0, maxItems)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Activity</span>
          <span className="text-xs font-normal text-muted-foreground">
            {items.length} total events
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 pr-4">
          {displayItems.length > 0 ? (
            <div className="space-y-4">
              {displayItems.map((item, index) => {
                const config = activityConfig[item.action] || activityConfig.status_changed
                const Icon = config.icon

                return (
                  <div
                    key={item.id}
                    className="flex gap-3 pb-4 last:pb-0"
                  >
                    {/* Timeline dot and line */}
                    <div className="flex flex-col items-center gap-3">
                      <div className={cn('rounded-full p-2', config.bgColor)}>
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>
                      {index < displayItems.length - 1 && (
                        <div className="h-6 w-0.5 bg-border" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1 pt-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs font-semibold">
                                {item.actor.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{item.actor.name}</span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0 mt-1">
                          {config.label}
                        </Badge>
                      </div>

                      {/* Value changes */}
                      {(item.oldValue || item.newValue) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 pl-0">
                          {item.oldValue && (
                            <span className="line-through opacity-75">{item.oldValue}</span>
                          )}
                          {item.oldValue && item.newValue && (
                            <span className="text-muted-foreground">→</span>
                          )}
                          {item.newValue && (
                            <span className="font-medium text-green-600">{item.newValue}</span>
                          )}
                        </div>
                      )}

                      {/* Metadata */}
                      {item.metadata && (
                        <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                          {(item.metadata as any).count && (
                            <Badge variant="secondary" className="text-xs">
                              {(item.metadata as any).count} items
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex h-96 items-center justify-center text-muted-foreground">
              <p className="text-sm">No activity yet</p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {items.length > maxItems && (
          <div className="border-t mt-4 pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Showing {maxItems} of {items.length} events
              <span className="ml-1">
                <a href="#" className="text-primary hover:underline">
                  View all
                </a>
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
