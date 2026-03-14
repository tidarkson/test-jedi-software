'use client'

import * as React from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox as UICheckbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { DateRangeFilter } from '@/types'
import {
  exportAnalytics,
  getAnalyticsExportStatus,
  resolveDateRangeParams,
} from '@/lib/api/analytics'

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string | null
  dateRange: DateRangeFilter
}

const EXPORT_SECTIONS = [
  { id: 'quality-trends', title: 'Quality Trends', description: 'Pass/Fail trends and failure distribution' },
  { id: 'suite-health', title: 'Suite Health', description: 'Health heatmap and health scores' },
  { id: 'defect-analytics', title: 'Defect Analytics', description: 'Defect leakage and MTTR metrics' },
  { id: 'team-performance', title: 'Team Performance', description: 'Workload and execution velocity' },
]

async function waitFor(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

function triggerDownload(downloadUrl: string): void {
  if (typeof window === 'undefined') {
    return
  }

  const anchor = window.document.createElement('a')
  anchor.href = downloadUrl
  anchor.target = '_blank'
  anchor.rel = 'noopener noreferrer'
  anchor.click()
}

export function ExportModal({ open, onOpenChange, projectId, dateRange }: ExportModalProps) {
  const [format, setFormat] = React.useState<'pdf' | 'xlsx'>('pdf')
  const [selectedSections, setSelectedSections] = React.useState<Set<string>>(
    new Set(EXPORT_SECTIONS.map((s) => s.id))
  )
  const [generateSummary, setGenerateSummary] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)
  const [progressMessage, setProgressMessage] = React.useState<string | null>(null)

  const handleSectionToggle = (sectionId: string) => {
    const newSet = new Set(selectedSections)
    if (newSet.has(sectionId)) {
      newSet.delete(sectionId)
    } else {
      newSet.add(sectionId)
    }
    setSelectedSections(newSet)
  }

  const handleSelectAll = () => {
    if (selectedSections.size === EXPORT_SECTIONS.length) {
      setSelectedSections(new Set())
    } else {
      setSelectedSections(new Set(EXPORT_SECTIONS.map((s) => s.id)))
    }
  }

  const handleExport = async () => {
    if (selectedSections.size === 0) {
      toast.error('Please select at least one section to export')
      return
    }

    if (!projectId) {
      toast.error('Select a project before exporting analytics')
      return
    }

    setIsExporting(true)
    setProgressMessage('Preparing export...')

    try {
      const rangeParams = resolveDateRangeParams(dateRange)

      const exportResponse = await exportAnalytics(projectId, {
        format,
        sections: Array.from(selectedSections),
        filters: {
          startDate: rangeParams.dateFrom,
          endDate: rangeParams.dateTo,
        },
      })

      let downloadUrl = exportResponse.downloadUrl

      if (!downloadUrl && exportResponse.jobId) {
        setProgressMessage('Generating export file...')

        const maxAttempts = 20
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          await waitFor(1500)
          const status = await getAnalyticsExportStatus(exportResponse.jobId)

          if (status.status === 'completed' && status.downloadUrl) {
            downloadUrl = status.downloadUrl
            break
          }

          if (status.status === 'failed') {
            throw new Error(status.error || 'Export generation failed')
          }
        }
      }

      if (!downloadUrl) {
        throw new Error('Export generated without a download link')
      }

      setProgressMessage('Starting download...')
      triggerDownload(downloadUrl)
      toast.success(`Analytics exported as ${format.toUpperCase()}`)
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export analytics'
      toast.error(message)
    } finally {
      setIsExporting(false)
      setProgressMessage(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Analytics
          </DialogTitle>
          <DialogDescription>
            Choose sections and format to export your analytics dashboard
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="sections" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Select Sections</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  {selectedSections.size === EXPORT_SECTIONS.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-2">
                {EXPORT_SECTIONS.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-accent"
                  >
                    <UICheckbox
                      id={section.id}
                      checked={selectedSections.has(section.id)}
                      onCheckedChange={() => handleSectionToggle(section.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={section.id}
                        className="cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {section.title}
                      </Label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="format">Export Format</Label>
                <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">
                      <div className="flex flex-col">
                        <span>PDF Document</span>
                        <span className="text-xs text-muted-foreground">
                          Professional report with charts
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="xlsx">
                      <div className="flex flex-col">
                        <span>Excel Spreadsheet</span>
                        <span className="text-xs text-muted-foreground">
                          Raw data and summary sheets
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <UICheckbox
                    id="summary"
                    checked={generateSummary}
                    onCheckedChange={(checked: any) => setGenerateSummary(checked)}
                  />
                  <Label
                    htmlFor="summary"
                    className="cursor-pointer font-medium"
                  >
                    Generate AI Summary
                  </Label>
                </div>
                {generateSummary && (
                  <p className="text-sm text-muted-foreground pl-6">
                    An executive summary will be generated and included in your export
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-sm text-blue-800">
                  💡 <span className="font-medium">Tip:</span> PDF format is recommended for sharing reports, while Excel is better for further analysis.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview Section */}
        {showPreview && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <h4 className="text-sm font-semibold mb-2">Export Preview</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Format: {format.toUpperCase()}</p>
              <p>Sections: {Array.from(selectedSections).join(', ') || 'None selected'}</p>
              <p>Include Summary: {generateSummary ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide' : 'Preview'}
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedSections.size === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>

        {isExporting && progressMessage ? (
          <p className="text-sm text-muted-foreground">{progressMessage}</p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
