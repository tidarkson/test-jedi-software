'use client'

import * as React from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
  Quote,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: boolean
}

function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  const buttons = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      label: 'Bold',
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      label: 'Italic',
    },
    {
      icon: Strikethrough,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      label: 'Strikethrough',
    },
    {
      icon: Code,
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
      label: 'Inline Code',
    },
    { separator: true },
    {
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      label: 'Bullet List',
    },
    {
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      label: 'Numbered List',
    },
    {
      icon: Quote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      label: 'Quote',
    },
    { separator: true },
    {
      icon: LinkIcon,
      action: () => {
        const url = window.prompt('Enter URL')
        if (url) {
          editor.chain().focus().setLink({ href: url }).run()
        }
      },
      isActive: editor.isActive('link'),
      label: 'Link',
    },
    { separator: true },
    {
      icon: Undo,
      action: () => editor.chain().focus().undo().run(),
      isActive: false,
      disabled: !editor.can().undo(),
      label: 'Undo',
    },
    {
      icon: Redo,
      action: () => editor.chain().focus().redo().run(),
      isActive: false,
      disabled: !editor.can().redo(),
      label: 'Redo',
    },
  ]

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/30 px-2 py-1.5">
        {buttons.map((button, index) => {
          if ('separator' in button) {
            return (
              <div
                key={`sep-${index}`}
                className="mx-1 h-4 w-px bg-border"
              />
            )
          }

          const Icon = button.icon

          return (
            <Tooltip key={button.label}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  disabled={button.disabled}
                  className={cn(
                    'h-7 w-7 p-0',
                    button.isActive && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {button.label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Write something...',
  className,
  disabled = false,
  error = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
          'prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5',
          '[&_.is-editor-empty:first-child::before]:text-muted-foreground',
          '[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_.is-editor-empty:first-child::before]:float-left',
          '[&_.is-editor-empty:first-child::before]:pointer-events-none',
          '[&_.is-editor-empty:first-child::before]:h-0'
        ),
      },
    },
  })

  // Update editor content when value changes externally
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border border-input bg-background',
        error && 'border-destructive',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
