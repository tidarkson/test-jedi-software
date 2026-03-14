'use client'

import * as React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import {
  GripVertical,
  Plus,
  Trash2,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  File,
  Save,
  Send,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'

// Validation schema
const testStepSchema = z.object({
  id: z.string(),
  action: z.string().min(1, 'Action is required'),
  expectedResult: z.string().min(1, 'Expected result is required'),
  testData: z.string().optional(),
})

const attachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  type: z.enum(['image', 'document', 'other']),
  size: z.number(),
  preview: z.string().optional(),
})

const testCaseFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().optional(),
  preconditions: z.string().optional(),
  postconditions: z.string().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  severity: z.enum(['critical', 'major', 'minor', 'trivial']),
  type: z.enum(['functional', 'regression', 'smoke', 'integration', 'e2e', 'performance', 'security', 'usability']),
  riskLevel: z.enum(['high', 'medium', 'low']),
  automationStatus: z.enum(['manual', 'automated', 'partially-automated', 'to-automate']),
  estimatedTime: z.number().min(0).optional(),
  tags: z.array(z.string()),
  suiteId: z.string().min(1, 'Suite is required'),
  steps: z.array(testStepSchema).min(1, 'At least one step is required'),
  attachments: z.array(attachmentSchema).optional(),
})

export type TestCaseFormData = z.infer<typeof testCaseFormSchema>

interface SuiteOption {
  id: string
  name: string
}

interface TestCaseFormProps {
  initialData?: Partial<TestCaseFormData>
  onSubmit: (data: TestCaseFormData) => void | Promise<void>
  onCancel: () => void
  mode?: 'create' | 'edit'
  suiteOptions?: SuiteOption[]
}

// Sortable Step Component
function SortableStep({
  id,
  index,
  register,
  errors,
  onRemove,
  canRemove,
}: {
  id: string
  index: number
  register: ReturnType<typeof useForm<TestCaseFormData>>['register']
  errors: ReturnType<typeof useForm<TestCaseFormData>>['formState']['errors']
  onRemove: () => void
  canRemove: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex gap-3 rounded-lg border bg-card p-4',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-start pt-2 text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Step Number */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
        {index + 1}
      </div>

      {/* Step Fields */}
      <div className="flex-1 space-y-3">
        <div>
          <Label htmlFor={`steps.${index}.action`} className="text-xs font-medium">
            Action <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id={`steps.${index}.action`}
            {...register(`steps.${index}.action`)}
            placeholder="Describe the action to perform..."
            className={cn(
              'mt-1 min-h-[60px] resize-none',
              errors.steps?.[index]?.action && 'border-destructive'
            )}
          />
          {errors.steps?.[index]?.action && (
            <p className="mt-1 text-xs text-destructive">
              {errors.steps[index]?.action?.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor={`steps.${index}.expectedResult`} className="text-xs font-medium">
            Expected Result <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id={`steps.${index}.expectedResult`}
            {...register(`steps.${index}.expectedResult`)}
            placeholder="Describe the expected outcome..."
            className={cn(
              'mt-1 min-h-[60px] resize-none',
              errors.steps?.[index]?.expectedResult && 'border-destructive'
            )}
          />
          {errors.steps?.[index]?.expectedResult && (
            <p className="mt-1 text-xs text-destructive">
              {errors.steps[index]?.expectedResult?.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor={`steps.${index}.testData`} className="text-xs font-medium">
            Test Data (Optional)
          </Label>
          <Input
            id={`steps.${index}.testData`}
            {...register(`steps.${index}.testData`)}
            placeholder="e.g., username: testuser, password: ****"
            className="mt-1"
          />
        </div>
      </div>

      {/* Remove Button */}
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="flex-shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

// Tag Input Component
function TagInput({
  value,
  onChange,
}: {
  value: string[]
  onChange: (tags: string[]) => void
}) {
  const [inputValue, setInputValue] = React.useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = inputValue.trim()
      if (tag && !value.includes(tag)) {
        onChange([...value, tag])
      }
      setInputValue('')
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="flex min-h-[40px] flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2">
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 text-xs">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="rounded-full hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? 'Add tags...' : ''}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}

// File Upload Component
function FileUploadZone({
  files,
  onFilesChange,
  maxFiles = 20,
  maxSize = 10 * 1024 * 1024, // 10MB
}: {
  files: z.infer<typeof attachmentSchema>[]
  onFilesChange: (files: z.infer<typeof attachmentSchema>[]) => void
  maxFiles?: number
  maxSize?: number
}) {
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return

    const newFiles = Array.from(fileList).slice(0, maxFiles - files.length)

    const processedFiles = newFiles
      .filter((file) => {
        if (file.size > maxSize) {
          toast.error(`${file.name} exceeds the 10MB limit`)
          return false
        }
        return true
      })
      .map((file) => {
        const isImage = file.type.startsWith('image/')
        return {
          id: crypto.randomUUID(),
          name: file.name,
          url: URL.createObjectURL(file),
          type: isImage ? 'image' : file.type.includes('pdf') || file.type.includes('document') ? 'document' : 'other',
          size: file.size,
          preview: isImage ? URL.createObjectURL(file) : undefined,
        } as z.infer<typeof attachmentSchema>
      })

    onFilesChange([...files, ...processedFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        )}
      >
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">Drop files here or click to upload</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Max 10MB per file, {maxFiles} files max
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3"
            >
              {/* Preview/Icon */}
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                  {file.type === 'image' ? (
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  ) : file.type === 'document' ? (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <File className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFile(file.id)}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function TestCaseForm({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
  suiteOptions = [],
}: TestCaseFormProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = React.useState(false)
  const [pendingNavigation, setPendingNavigation] = React.useState<(() => void) | null>(null)
  const [workflowStatus, setWorkflowStatus] = React.useState<'draft' | 'in-review' | 'approved' | 'deprecated'>('draft')

  const defaultValues: TestCaseFormData = {
    title: '',
    description: '',
    preconditions: '',
    postconditions: '',
    priority: 'medium',
    severity: 'minor',
    type: 'functional',
    riskLevel: 'medium',
    automationStatus: 'manual',
    estimatedTime: undefined,
    tags: [],
    suiteId: '',
    steps: [{ id: crypto.randomUUID(), action: '', expectedResult: '', testData: '' }],
    attachments: [],
    ...initialData,
  }

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TestCaseFormData>({
    resolver: zodResolver(testCaseFormSchema),
    defaultValues,
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'steps',
  })

  const watchedTags = watch('tags')
  const watchedAttachments = watch('attachments') || []

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end for steps
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id)
      const newIndex = fields.findIndex((f) => f.id === over.id)
      move(oldIndex, newIndex)
    }
  }

  // Handle form submission
  const onFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data)
  })

  // Handle cancel with unsaved changes check
  const handleCancel = () => {
    if (isDirty) {
      setPendingNavigation(() => onCancel)
      setShowUnsavedWarning(true)
    } else {
      onCancel()
    }
  }

  // Workflow actions
  const handleSubmitForReview = () => {
    setWorkflowStatus('in-review')
    toast.success('Test case submitted for review')
  }

  const handleApprove = () => {
    setWorkflowStatus('approved')
    toast.success('Test case approved')
  }

  // Bulk paste handler for steps
  const handleBulkPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text')
    const lines = text.split('\n').filter((line) => line.trim())
    
    if (lines.length > 1) {
      e.preventDefault()
      lines.forEach((line) => {
        append({
          id: crypto.randomUUID(),
          action: line.trim(),
          expectedResult: '',
          testData: '',
        })
      })
      toast.success(`Added ${lines.length} steps from clipboard`)
    }
  }

  const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    'in-review': 'bg-warning-100 text-warning-700',
    approved: 'bg-success-100 text-success-700',
    deprecated: 'bg-error-100 text-error-700',
  }

  return (
    <>
      <form onSubmit={onFormSubmit} className="space-y-6">
        {/* Header with workflow actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              {mode === 'create' ? 'Create Test Case' : 'Edit Test Case'}
            </h2>
            <Badge
              className={cn('capitalize', statusColors[workflowStatus])}
              style={{
                backgroundColor: workflowStatus === 'in-review' ? '#FEF3C7' : workflowStatus === 'approved' ? '#DCFCE7' : workflowStatus === 'deprecated' ? '#FEE2E2' : undefined,
                color: workflowStatus === 'in-review' ? '#B45309' : workflowStatus === 'approved' ? '#15803D' : workflowStatus === 'deprecated' ? '#B91C1C' : undefined,
              }}
            >
              {workflowStatus.replace('-', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {workflowStatus === 'draft' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSubmitForReview}
              >
                <Send className="mr-1.5 h-4 w-4" />
                Submit for Review
              </Button>
            )}
            {workflowStatus === 'in-review' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApprove}
                className="text-success-700 border-success-300 hover:bg-success-50"
                style={{ color: '#15803D', borderColor: '#86EFAC' }}
              >
                <CheckCircle className="mr-1.5 h-4 w-4" />
                Approve
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Basic Info Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div>
              <Label>Suite <span className="text-destructive">*</span></Label>
              <Select
                value={watch('suiteId')}
                onValueChange={(val) => setValue('suiteId', val, { shouldDirty: true, shouldValidate: true })}
              >
                <SelectTrigger className={cn('mt-1', errors.suiteId && 'border-destructive')}>
                  <SelectValue placeholder="Select a suite" />
                </SelectTrigger>
                <SelectContent>
                  {suiteOptions.map((suite) => (
                    <SelectItem key={suite.id} value={suite.id}>
                      {suite.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.suiteId && (
                <p className="mt-1 text-xs text-destructive">{errors.suiteId.message}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter test case title..."
                className={cn('mt-1', errors.title && 'border-destructive')}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <div className="mt-1">
                <RichTextEditor
                  value={watch('description') || ''}
                  onChange={(val) => setValue('description', val)}
                  placeholder="Describe the test case..."
                />
              </div>
            </div>

            {/* Preconditions & Postconditions */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Preconditions</Label>
                <div className="mt-1">
                  <RichTextEditor
                    value={watch('preconditions') || ''}
                    onChange={(val) => setValue('preconditions', val)}
                    placeholder="List preconditions..."
                  />
                </div>
              </div>
              <div>
                <Label>Postconditions</Label>
                <div className="mt-1">
                  <RichTextEditor
                    value={watch('postconditions') || ''}
                    onChange={(val) => setValue('postconditions', val)}
                    placeholder="List postconditions..."
                  />
                </div>
              </div>
            </div>

            {/* Dropdowns Row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Priority</Label>
                <Select
                  defaultValue={defaultValues.priority}
                  onValueChange={(val) => setValue('priority', val as TestCaseFormData['priority'])}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Severity</Label>
                <Select
                  defaultValue={defaultValues.severity}
                  onValueChange={(val) => setValue('severity', val as TestCaseFormData['severity'])}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="trivial">Trivial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Type</Label>
                <Select
                  defaultValue={defaultValues.type}
                  onValueChange={(val) => setValue('type', val as TestCaseFormData['type'])}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="functional">Functional</SelectItem>
                    <SelectItem value="regression">Regression</SelectItem>
                    <SelectItem value="smoke">Smoke</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="e2e">E2E</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="usability">Usability</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Risk Level</Label>
                <Select
                  defaultValue={defaultValues.riskLevel}
                  onValueChange={(val) => setValue('riskLevel', val as TestCaseFormData['riskLevel'])}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Automation & Time Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Automation Status</Label>
                <Select
                  defaultValue={defaultValues.automationStatus}
                  onValueChange={(val) => setValue('automationStatus', val as TestCaseFormData['automationStatus'])}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automated">Automated</SelectItem>
                    <SelectItem value="partially-automated">Partially Automated</SelectItem>
                    <SelectItem value="to-automate">To Be Automated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estimated Execution Time (minutes)</Label>
                <Input
                  type="number"
                  min={0}
                  {...register('estimatedTime', { valueAsNumber: true })}
                  placeholder="e.g., 15"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="mt-1">
                <TagInput
                  value={watchedTags}
                  onChange={(tags) => setValue('tags', tags)}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Press Enter or comma to add a tag
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Steps Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Test Steps <span className="text-destructive">*</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Drag to reorder steps
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3" onPaste={handleBulkPaste}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field, index) => (
                  <SortableStep
                    key={field.id}
                    id={field.id}
                    index={index}
                    register={register}
                    errors={errors}
                    onRemove={() => remove(index)}
                    canRemove={fields.length > 1}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {errors.steps && !Array.isArray(errors.steps) && (
              <p className="text-xs text-destructive">{errors.steps.message}</p>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  id: crypto.randomUUID(),
                  action: '',
                  expectedResult: '',
                  testData: '',
                })
              }
              className="w-full"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Step
            </Button>
          </CardContent>
        </Card>

        {/* Attachments Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              files={watchedAttachments}
              onFilesChange={(files) => setValue('attachments', files)}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-1.5 h-4 w-4" />
            {mode === 'create' ? 'Create Test Case' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* Unsaved Changes Warning */}
      <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your
              changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsavedWarning(false)}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowUnsavedWarning(false)
                pendingNavigation?.()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
