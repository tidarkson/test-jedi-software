'use client'

import * as React from 'react'
import { Plus, Trash2, Clock, Archive, AlertTriangle } from 'lucide-react'
import type { DataRetentionRule, AuditEntityType, RetentionAction } from '@/types/admin'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const entityTypeLabels: Record<AuditEntityType, string> = {
  test_case: 'Test Cases',
  test_suite: 'Test Suites',
  test_run: 'Test Runs',
  project: 'Projects',
  user: 'Users',
  custom_field: 'Custom Fields',
  integration: 'Integrations',
  settings: 'Audit Logs',
}

const actionLabels: Record<RetentionAction, string> = {
  archive: 'Archive',
  delete: 'Delete Permanently',
}

interface RetentionRulesManagerProps {
  rules: DataRetentionRule[]
  onRulesChange: (rules: DataRetentionRule[]) => void
}

export function RetentionRulesManager({ rules, onRulesChange }: RetentionRulesManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [deleteRuleId, setDeleteRuleId] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    name: '',
    entityType: 'test_run' as AuditEntityType,
    olderThanDays: 90,
    action: 'archive' as RetentionAction,
  })

  const resetForm = () => {
    setFormData({
      name: '',
      entityType: 'test_run',
      olderThanDays: 90,
      action: 'archive',
    })
  }

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a rule name')
      return
    }

    const newRule: DataRetentionRule = {
      id: `ret-${Date.now()}`,
      name: formData.name,
      entityType: formData.entityType,
      condition: {
        olderThanDays: formData.olderThanDays,
      },
      action: formData.action,
      isActive: false,
      createdAt: new Date(),
    }

    onRulesChange([...rules, newRule])
    toast.success('Retention rule created')
    setIsCreateOpen(false)
    resetForm()
  }

  const handleToggleActive = (ruleId: string) => {
    const updatedRules = rules.map((r) =>
      r.id === ruleId ? { ...r, isActive: !r.isActive } : r
    )
    onRulesChange(updatedRules)
    
    const rule = rules.find((r) => r.id === ruleId)
    if (rule) {
      toast.success(rule.isActive ? 'Rule deactivated' : 'Rule activated')
    }
  }

  const handleDelete = () => {
    if (deleteRuleId) {
      onRulesChange(rules.filter((r) => r.id !== deleteRuleId))
      toast.success('Retention rule deleted')
      setDeleteRuleId(null)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Data Retention Rules</h3>
            <p className="text-sm text-muted-foreground">
              Automatically archive or delete old data based on rules
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Rule
          </Button>
        </div>

        {rules.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No retention rules defined</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Rule
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={cn(
                  'flex items-center gap-4 rounded-lg border p-4 transition-colors',
                  !rule.isActive && 'bg-muted/50'
                )}
              >
                <Switch
                  checked={rule.isActive}
                  onCheckedChange={() => handleToggleActive(rule.id)}
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{rule.name}</span>
                    {rule.action === 'delete' && (
                      <Badge variant="destructive" className="text-[10px]">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Destructive
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {rule.action === 'archive' ? (
                      <Archive className="mr-1 inline h-3 w-3" />
                    ) : (
                      <Trash2 className="mr-1 inline h-3 w-3" />
                    )}
                    {actionLabels[rule.action]} {entityTypeLabels[rule.entityType].toLowerCase()} older than {rule.condition.olderThanDays} days
                  </div>
                  {rule.lastRunAt && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Last run: {rule.lastRunAt.toLocaleDateString()}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setDeleteRuleId(rule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Retention Rule</DialogTitle>
            <DialogDescription>
              Define conditions for automatically managing old data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Archive Old Test Runs"
              />
            </div>

            <div className="grid gap-2">
              <Label>Entity Type</Label>
              <Select
                value={formData.entityType}
                onValueChange={(value) => setFormData({ ...formData, entityType: value as AuditEntityType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(entityTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="days">Older Than (Days)</Label>
              <Input
                id="days"
                type="number"
                min={1}
                value={formData.olderThanDays}
                onChange={(e) => setFormData({ ...formData, olderThanDays: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Action</Label>
              <Select
                value={formData.action}
                onValueChange={(value) => setFormData({ ...formData, action: value as RetentionAction })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="archive">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      Archive
                    </div>
                  </SelectItem>
                  <SelectItem value="delete">
                    <div className="flex items-center gap-2 text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete Permanently
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {formData.action === 'delete' && (
                <p className="text-xs text-destructive">
                  Warning: Deleted data cannot be recovered.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRuleId} onOpenChange={(open) => { if (!open) setDeleteRuleId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Retention Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this retention rule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
