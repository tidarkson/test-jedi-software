'use client'

import * as React from 'react'
import { DateRange } from '@/types'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface DateRangePickerProps {
  value?: { range: DateRange; startDate?: Date; endDate?: Date }
  onChange: (range: { range: DateRange; startDate?: Date; endDate?: Date }) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [tempStartDate, setTempStartDate] = React.useState<Date | undefined>(value?.startDate)
  const [tempEndDate, setTempEndDate] = React.useState<Date | undefined>(value?.endDate)

  React.useEffect(() => {
    setTempStartDate(value?.startDate)
    setTempEndDate(value?.endDate)
  }, [value?.startDate, value?.endDate])

  const presets = [
    { label: 'Last 7 days', range: 'last_7d' as DateRange },
    { label: 'Last 30 days', range: 'last_30d' as DateRange },
    { label: 'Last 90 days', range: 'last_90d' as DateRange },
    { label: 'Custom', range: 'custom' as DateRange },
  ]

  const getDisplayLabel = () => {
    if (!value) return 'Select date range'
    if (value.range !== 'custom') {
      return presets.find((p) => p.range === value.range)?.label || 'Select date range'
    }
    if (value.startDate && value.endDate) {
      return `${format(value.startDate, 'MMM d')} - ${format(value.endDate, 'MMM d, yyyy')}`
    }
    return 'Custom range'
  }

  const resolvePresetRange = (range: Exclude<DateRange, 'custom'>) => {
    const endDate = new Date()
    const startDate = new Date(endDate)

    const daySpanByRange: Record<Exclude<DateRange, 'custom'>, number> = {
      last_7d: 6,
      last_30d: 29,
      last_90d: 89,
    }

    startDate.setDate(endDate.getDate() - daySpanByRange[range])

    return { range, startDate, endDate }
  }

  const handlePresetClick = (range: DateRange) => {
    if (range === 'custom') {
      setTempStartDate(undefined)
      setTempEndDate(undefined)
      onChange({ range: 'custom' })
    } else {
      onChange(resolvePresetRange(range))
      setIsOpen(false)
    }
  }

  const handleCustomApply = () => {
    if (tempStartDate && tempEndDate) {
      onChange({ range: 'custom', startDate: tempStartDate, endDate: tempEndDate })
      setIsOpen(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-start text-left font-normal', className)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {getDisplayLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            {presets.map((preset) => (
              <Button
                key={preset.range}
                variant={value?.range === preset.range ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handlePresetClick(preset.range)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {value?.range === 'custom' && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <CalendarComponent
                  mode="single"
                  selected={tempStartDate}
                  onSelect={setTempStartDate}
                  disabled={(date) =>
                    tempEndDate ? date > tempEndDate : false
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <CalendarComponent
                  mode="single"
                  selected={tempEndDate}
                  onSelect={setTempEndDate}
                  disabled={(date) =>
                    tempStartDate ? date < tempStartDate : false
                  }
                />
              </div>
              <Button
                onClick={handleCustomApply}
                disabled={!tempStartDate || !tempEndDate}
                className="w-full"
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
