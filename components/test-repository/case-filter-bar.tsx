'use client'

import * as React from 'react'
import { Search, X, Filter, Save, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTestRepositoryStore, type FilterState } from '@/lib/store/test-repository-store'
import { filterOptions } from '@/lib/data/mock-test-data'

interface FilterDropdownProps {
  label: string
  options: { label: string; value: string }[]
  selected: string[]
  onSelectionChange: (values: string[]) => void
}

function FilterDropdown({ label, options, selected, onSelectionChange }: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false)

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onSelectionChange(selected.filter(v => v !== value))
    } else {
      onSelectionChange([...selected, value])
    }
  }

  const handleClear = () => {
    onSelectionChange([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 gap-1.5 border-dashed',
            selected.length > 0 && 'border-primary/50 bg-primary/5'
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          {label}
          {selected.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge variant="secondary" className="h-5 px-1 text-[10px]">
                {selected.length}
              </Badge>
            </>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <div className="p-2 border-b">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            {selected.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleClear}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="max-h-[200px]">
          <div className="p-2 space-y-1">
            {options.map(option => (
              <div
                key={option.value}
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-muted cursor-pointer"
                onClick={() => handleToggle(option.value)}
              >
                <Checkbox
                  id={`filter-${label}-${option.value}`}
                  checked={selected.includes(option.value)}
                  onCheckedChange={() => handleToggle(option.value)}
                  className="pointer-events-none"
                />
                <Label
                  htmlFor={`filter-${label}-${option.value}`}
                  className="flex-1 text-sm cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

export function CaseFilterBar() {
  const { filters, setFilter, clearFilters, getFilteredCases } = useTestRepositoryStore()
  const [searchValue, setSearchValue] = React.useState(filters.search)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>()

  // Debounced search
  React.useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      setFilter('search', searchValue)
    }, 300)
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchValue, setFilter])

  const filteredCases = getFilteredCases()
  
  // Count active filters
  const activeFilterCount =
    filters.priorities.length +
    filters.severities.length +
    filters.types.length +
    filters.automationStatuses.length +
    filters.statuses.length +
    filters.tags.length

  // Get all active filter chips
  const activeChips: { key: keyof FilterState; value: string; label: string }[] = []
  
  filters.priorities.forEach(v => {
    const opt = filterOptions.priorities.find(o => o.value === v)
    if (opt) activeChips.push({ key: 'priorities', value: v, label: `Priority: ${opt.label}` })
  })
  filters.severities.forEach(v => {
    const opt = filterOptions.severities.find(o => o.value === v)
    if (opt) activeChips.push({ key: 'severities', value: v, label: `Severity: ${opt.label}` })
  })
  filters.types.forEach(v => {
    const opt = filterOptions.types.find(o => o.value === v)
    if (opt) activeChips.push({ key: 'types', value: v, label: `Type: ${opt.label}` })
  })
  filters.automationStatuses.forEach(v => {
    const opt = filterOptions.automationStatuses.find(o => o.value === v)
    if (opt) activeChips.push({ key: 'automationStatuses', value: v, label: opt.label })
  })
  filters.statuses.forEach(v => {
    const opt = filterOptions.statuses.find(o => o.value === v)
    if (opt) activeChips.push({ key: 'statuses', value: v, label: `Status: ${opt.label}` })
  })
  filters.tags.forEach(v => {
    const opt = filterOptions.tags.find(o => o.value === v)
    if (opt) activeChips.push({ key: 'tags', value: v, label: `Tag: ${opt.label}` })
  })

  const handleRemoveChip = (chip: { key: keyof FilterState; value: string }) => {
    const currentValues = filters[chip.key] as string[]
    setFilter(chip.key, currentValues.filter(v => v !== chip.value))
  }

  return (
    <div className="space-y-3">
      {/* Search and filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search test cases..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-8 pl-8 pr-8 text-sm"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <FilterDropdown
          label="Priority"
          options={filterOptions.priorities}
          selected={filters.priorities}
          onSelectionChange={(values) => setFilter('priorities', values)}
        />
        <FilterDropdown
          label="Severity"
          options={filterOptions.severities}
          selected={filters.severities}
          onSelectionChange={(values) => setFilter('severities', values)}
        />
        <FilterDropdown
          label="Type"
          options={filterOptions.types}
          selected={filters.types}
          onSelectionChange={(values) => setFilter('types', values)}
        />
        <FilterDropdown
          label="Automation"
          options={filterOptions.automationStatuses}
          selected={filters.automationStatuses}
          onSelectionChange={(values) => setFilter('automationStatuses', values)}
        />
        <FilterDropdown
          label="Status"
          options={filterOptions.statuses}
          selected={filters.statuses}
          onSelectionChange={(values) => setFilter('statuses', values)}
        />
        <FilterDropdown
          label="Tags"
          options={filterOptions.tags}
          selected={filters.tags}
          onSelectionChange={(values) => setFilter('tags', values)}
        />

        {/* Save preset button */}
        <Button variant="outline" size="sm" className="h-8 gap-1.5" disabled={activeFilterCount === 0}>
          <Save className="h-3.5 w-3.5" />
          Save Preset
        </Button>

        {/* Clear all filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Active filters:</span>
          {activeChips.map((chip, idx) => (
            <Badge
              key={`${chip.key}-${chip.value}-${idx}`}
              variant="secondary"
              className="h-6 gap-1 pl-2 pr-1 text-xs font-normal"
            >
              {chip.label}
              <button
                onClick={() => handleRemoveChip(chip)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Results count */}
      <div className="text-xs text-muted-foreground">
        Showing {filteredCases.length} test case{filteredCases.length !== 1 ? 's' : ''}
        {activeFilterCount > 0 && ' (filtered)'}
      </div>
    </div>
  )
}
