'use client'

import * as React from 'react'
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Type,
  AlignLeft,
  List,
  ListChecks,
  Calendar,
  CheckSquare,
  Eye,
} from 'lucide-react'
import type { CustomField, CustomFieldType, CustomFieldAppliesTo, CustomFieldOption } from '@/types/admin'
import { useAdminStore } from '@/lib/store/admin-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'

const fieldTypeIcons: Record<CustomFieldType, React.ElementType> = {
  text: Type,
  textarea: AlignLeft,
  select: List,
  multiselect: ListChecks,
  date: Calendar,
  checkbox: CheckSquare,
}

const fieldTypeLabels: Record<CustomFieldType, string> = {
  text: 'Text',
  textarea: 'Text Area',
  select: 'Dropdown',
  multiselect: 'Multi-select',
  date: 'Date',
  checkbox: 'Checkbox',
}

interface SortableFieldRowProps {
  field: CustomField
  onEdit: (field: CustomField) => void
  onDelete: (fieldId: string) => void
  onPreview: (field: CustomField) => void
}

function SortableFieldRow({ field, onEdit, onDelete, onPreview }: SortableFieldRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Icon = fieldTypeIcons[field.type]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors',
        isDragging && 'opacity-50'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{field.name}</span>
          {field.required && (
            <Badge variant="secondary" className="text-[10px]">Required</Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {fieldTypeLabels[field.type]} - Applies to: {field.appliesTo === 'both' ? 'Cases & Runs' : field.appliesTo === 'case' ? 'Test Cases' : 'Test Runs'}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPreview(field)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(field)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(field.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function CustomFieldsManager() {
  const { customFields: fields, addCustomField, updateCustomField, deleteCustomField, reorderCustomFields } = useAdminStore()
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingField, setEditingField] = React.useState<CustomField | null>(null)
  const [previewField, setPreviewField] = React.useState<CustomField | null>(null)
  const [deleteFieldId, setDeleteFieldId] = React.useState<string | null>(null)

  const [formData, setFormData] = React.useState({
    name: '',
    type: 'text' as CustomFieldType,
    required: false,
    appliesTo: 'case' as CustomFieldAppliesTo,
    description: '',
    options: [] as CustomFieldOption[],
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id)
      const newIndex = fields.findIndex((f) => f.id === over.id)
      const newFields = arrayMove(fields, oldIndex, newIndex)
      reorderCustomFields(newFields.map((f) => f.id))
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'text',
      required: false,
      appliesTo: 'case',
      description: '',
      options: [],
    })
  }

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a field name')
      return
    }

    addCustomField({
      name: formData.name,
      type: formData.type,
      required: formData.required,
      appliesTo: formData.appliesTo,
      description: formData.description,
      options: formData.options.length > 0 ? formData.options : undefined,
      order: fields.length + 1,
    })
    toast.success('Custom field created')
    setIsCreateOpen(false)
    resetForm()
  }

  const handleEdit = (field: CustomField) => {
    setEditingField(field)
    setFormData({
      name: field.name,
      type: field.type,
      required: field.required,
      appliesTo: field.appliesTo,
      description: field.description || '',
      options: field.options || [],
    })
  }

  const handleUpdate = () => {
    if (!editingField || !formData.name.trim()) {
      toast.error('Please enter a field name')
      return
    }

    updateCustomField(editingField.id, {
      name: formData.name,
      type: formData.type,
      required: formData.required,
      appliesTo: formData.appliesTo,
      description: formData.description,
      options: formData.options.length > 0 ? formData.options : undefined,
    })
    toast.success('Custom field updated')
    setEditingField(null)
    resetForm()
  }

  const handleDelete = () => {
    if (deleteFieldId) {
      deleteCustomField(deleteFieldId)
      toast.success('Custom field deleted')
      setDeleteFieldId(null)
    }
  }

  const addOption = () => {
    const newOption: CustomFieldOption = {
      id: `opt-${Date.now()}`,
      label: '',
      value: '',
    }
    setFormData({ ...formData, options: [...formData.options, newOption] })
  }

  const updateOption = (index: number, label: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = {
      ...newOptions[index],
      label,
      value: label.toLowerCase().replace(/\s+/g, '-'),
    }
    setFormData({ ...formData, options: newOptions })
  }

  const removeOption = (index: number) => {
    setFormData({ ...formData, options: formData.options.filter((_, i) => i !== index) })
  }

  const needsOptions = formData.type === 'select' || formData.type === 'multiselect'

  const FieldFormContent = (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Field Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Browser, Environment"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="type">Field Type</Label>
        <Select 
          value={formData.type} 
          onValueChange={(value) => setFormData({ ...formData, type: value as CustomFieldType })}
        >
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(fieldTypeLabels).map(([value, label]) => {
              const Icon = fieldTypeIcons[value as CustomFieldType]
              return (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="appliesTo">Applies To</Label>
        <Select 
          value={formData.appliesTo} 
          onValueChange={(value) => setFormData({ ...formData, appliesTo: value as CustomFieldAppliesTo })}
        >
          <SelectTrigger id="appliesTo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="case">Test Cases Only</SelectItem>
            <SelectItem value="run">Test Runs Only</SelectItem>
            <SelectItem value="both">Both Cases and Runs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Help text for this field"
        />
      </div>

      {needsOptions && (
        <div className="grid gap-2">
          <Label>Options</Label>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <Input
                  value={option.label}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => removeOption(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addOption}>
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Switch
          id="required"
          checked={formData.required}
          onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
        />
        <Label htmlFor="required">Required Field</Label>
      </div>
    </div>
  )

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Custom Fields</h3>
            <p className="text-sm text-muted-foreground">
              Manage custom fields for test cases and test runs
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Field
          </Button>
        </div>

        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Type className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No custom fields defined</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Field
            </Button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {fields.sort((a, b) => a.order - b.order).map((field) => (
                  <SortableFieldRow
                    key={field.id}
                    field={field}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteFieldId(id)}
                    onPreview={setPreviewField}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Field</DialogTitle>
            <DialogDescription>
              Add a new custom field to collect additional information.
            </DialogDescription>
          </DialogHeader>
          {FieldFormContent}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingField} onOpenChange={(open) => { if (!open) { setEditingField(null); resetForm(); }}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Custom Field</DialogTitle>
            <DialogDescription>
              Modify the custom field settings.
            </DialogDescription>
          </DialogHeader>
          {FieldFormContent}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingField(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewField} onOpenChange={(open) => { if (!open) setPreviewField(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Field Preview</DialogTitle>
            <DialogDescription>
              This is how the field will appear in the form.
            </DialogDescription>
          </DialogHeader>
          {previewField && (
            <div className="py-4">
              <Label className="flex items-center gap-1">
                {previewField.name}
                {previewField.required && <span className="text-destructive">*</span>}
              </Label>
              {previewField.description && (
                <p className="mb-2 text-xs text-muted-foreground">{previewField.description}</p>
              )}
              {previewField.type === 'text' && (
                <Input placeholder={`Enter ${previewField.name.toLowerCase()}`} />
              )}
              {previewField.type === 'textarea' && (
                <textarea 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                  rows={3}
                  placeholder={`Enter ${previewField.name.toLowerCase()}`}
                />
              )}
              {previewField.type === 'select' && (
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${previewField.name.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {previewField.options?.map((opt) => (
                      <SelectItem key={opt.id} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {previewField.type === 'multiselect' && (
                <div className="space-y-2 rounded-md border p-3">
                  {previewField.options?.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <Checkbox id={opt.id} />
                      <Label htmlFor={opt.id} className="font-normal">{opt.label}</Label>
                    </div>
                  ))}
                </div>
              )}
              {previewField.type === 'date' && (
                <Input type="date" />
              )}
              {previewField.type === 'checkbox' && (
                <div className="flex items-center gap-2">
                  <Checkbox id="preview-checkbox" />
                  <Label htmlFor="preview-checkbox" className="font-normal">{previewField.name}</Label>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPreviewField(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteFieldId} onOpenChange={(open) => { if (!open) setDeleteFieldId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Field</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this custom field? This action cannot be undone and will remove the field from all test cases and runs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Field
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
