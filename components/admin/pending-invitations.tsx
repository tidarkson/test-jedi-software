'use client'

import * as React from 'react'
import { Mail, Clock, X, RefreshCw } from 'lucide-react'
import type { Invitation } from '@/types/admin'
import { useAdminStore } from '@/lib/store/admin-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

function formatDate(date: Date): string {
  // Use consistent format for SSR/client hydration
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function getDaysUntilExpiry(expiresAt: Date): number {
  const now = new Date()
  const diffMs = expiresAt.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function PendingInvitations() {
  const { invitations, resendInvitation, cancelInvitation } = useAdminStore()
  
  if (invitations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Mail className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">No pending invitations</p>
      </div>
    )
  }

  const handleResend = (id: string, email: string) => {
    resendInvitation(id)
    toast.success(`Invitation resent to ${email}`)
  }

  const handleCancel = (id: string) => {
    cancelInvitation(id)
    toast.success('Invitation cancelled')
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Invited By</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => {
            const daysUntilExpiry = getDaysUntilExpiry(invitation.expiresAt)
            const isExpiringSoon = daysUntilExpiry <= 2

            return (
              <TableRow key={invitation.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{invitation.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {invitation.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {invitation.invitedBy}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className={cn(
                      'h-3 w-3',
                      isExpiringSoon ? 'text-warning' : 'text-muted-foreground'
                    )} />
                    <span className={cn(
                      'text-sm',
                      isExpiringSoon ? 'text-warning font-medium' : 'text-muted-foreground'
                    )}>
                      {daysUntilExpiry > 0 
                        ? `${daysUntilExpiry} days left`
                        : 'Expired'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleResend(invitation.id, invitation.email)}
                      title="Resend invitation"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleCancel(invitation.id)}
                      title="Cancel invitation"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
