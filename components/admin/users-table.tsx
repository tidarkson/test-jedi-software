'use client'

import * as React from 'react'
import { MoreHorizontal, Mail, Shield, UserX, Clock } from 'lucide-react'
import type { OrgMember, OrgRole } from '@/types/admin'
import { useAdminStore } from '@/lib/store/admin-store'
import { useAuthStore } from '@/lib/store/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'



const roleColors: Record<OrgRole, string> = {
  owner: 'bg-purple-100 text-purple-700 border-purple-200',
  admin: 'bg-blue-100 text-blue-700 border-blue-200',
  member: 'bg-green-100 text-green-700 border-green-200',
  viewer: 'bg-gray-100 text-gray-600 border-gray-200',
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700',
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function UsersTable() {
  const user = useAuthStore((state) => state.user)
  const {
    users: members,
    loadUsers,
    updateUserRole,
    removeUser,
    isUsersLoading,
    error,
  } = useAdminStore()

  const currentUserId = user?.id || ''
  const orgId = user?.organizationId || ''
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false)
  const [userToRemove, setUserToRemove] = React.useState<OrgMember | null>(null)
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null)
  const [isRemoving, setIsRemoving] = React.useState(false)

  React.useEffect(() => {
    if (!orgId) {
      return
    }

    void loadUsers(orgId).catch((apiError) => {
      toast.error(apiError.message ?? 'Failed to load users')
    })
  }, [loadUsers, orgId])

  const handleRoleChange = async (memberId: string, role: OrgRole) => {
    if (!orgId) {
      toast.error('Missing organization context')
      return
    }

    try {
      setUpdatingUserId(memberId)
      await updateUserRole(orgId, memberId, role)
      toast.success('User role updated')
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : 'Failed to update role'
      toast.error(message)
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleRemoveClick = (member: OrgMember) => {
    setUserToRemove(member)
    setRemoveDialogOpen(true)
  }

  const confirmRemove = async () => {
    if (!userToRemove) {
      return
    }

    if (!orgId) {
      toast.error('Missing organization context')
      return
    }

    try {
      setIsRemoving(true)
      await removeUser(orgId, userToRemove.id)
      toast.success('User removed from organization')
      setRemoveDialogOpen(false)
      setUserToRemove(null)
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : 'Failed to remove user'
      toast.error(message)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">User</TableHead>
              <TableHead className="w-[150px]">Role</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[150px]">Last Active</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isUsersLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Spinner className="h-4 w-4" />
                    Loading users...
                  </div>
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No organization members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
              const isCurrentUser = member.id === currentUserId
              const isOwner = member.role === 'owner'

              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-[10px]">You</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{member.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isOwner ? (
                      <Badge 
                        variant="outline" 
                        className={cn('capitalize', roleColors[member.role])}
                      >
                        <Shield className="mr-1 h-3 w-3" />
                        {member.role}
                      </Badge>
                    ) : (
                      <Select
                        value={member.role}
                        onValueChange={(value) => {
                          void handleRoleChange(member.id, value as OrgRole)
                        }}
                        disabled={isCurrentUser || updatingUserId === member.id}
                      >
                        <SelectTrigger className="h-8 w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={cn('capitalize text-[10px]', statusColors[member.status])}
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(member.lastActiveAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          disabled={isCurrentUser || isOwner || isRemoving}
                          onClick={() => handleRemoveClick(member)}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Remove User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
            )}
          </TableBody>
        </Table>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{userToRemove?.name}</strong> from the organization? 
              They will lose access to all projects and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? 'Removing...' : 'Remove User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
