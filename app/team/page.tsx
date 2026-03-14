'use client'

import * as React from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { AdminGuard, UsersTable, InviteUserModal, PendingInvitations } from '@/components/admin'
import { useAdminStore } from '@/lib/store/admin-store'
import { useAuthStore } from '@/lib/store/auth-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserPlus, Clock } from 'lucide-react'

export default function TeamPage() {
  const user = useAuthStore((state) => state.user)
  const { users, invitations, loadUsers, isUsersLoading, error } = useAdminStore()
  const orgId = user?.organizationId || ''

  React.useEffect(() => {
    if (!orgId) {
      return
    }

    void loadUsers(orgId)
  }, [loadUsers, orgId])
  
  const breadcrumbs = [
    { title: 'Administration', href: '#' },
    { title: 'Team Management' },
  ]

  const activeUsers = users.filter((member) => member.status === 'active').length
  const pendingInvites = invitations.filter((invite) => invite.status === 'pending').length

  return (
    <AppShell
      sidebar={<Sidebar />}
      header={<Header breadcrumbs={breadcrumbs} />}
    >
      <AdminGuard>
        <div className="h-full overflow-auto p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Team Management</h1>
                <p className="text-sm text-muted-foreground">
                  Manage organization members, roles, and invitations
                </p>
              </div>
              <InviteUserModal />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {isUsersLoading ? 'Loading...' : `${activeUsers} active`}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingInvites}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting acceptance
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Admins</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter((member) => member.role === 'admin' || member.role === 'owner').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    With admin access
                  </p>
                </CardContent>
              </Card>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* Tabs */}
            <Tabs defaultValue="members" className="space-y-4">
              <TabsList>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="invitations">
                  Pending Invitations
                  {pendingInvites > 0 && (
                    <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {pendingInvites}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="members">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Members</CardTitle>
                    <CardDescription>
                      View and manage all members in your organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UsersTable />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="invitations">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                    <CardDescription>
                      Manage pending invitations sent to new members
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PendingInvitations />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </AdminGuard>
    </AppShell>
  )
}
