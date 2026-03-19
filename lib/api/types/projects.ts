export interface ProjectSettingsDto {
  color?: string | null
  icon?: string | null
  [key: string]: unknown
}

export interface ProjectDto {
  id: string
  name: string
  slug?: string
  description?: string | null
  color?: string | null
  icon?: string | null
  settings?: ProjectSettingsDto | null
  memberCount?: number
  testCaseCount?: number
  activeRunsCount?: number
  lastRunDate?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CreateProjectRequestDto {
  name: string
  description?: string
}

export interface Project {
  id: string
  name: string
  slug?: string
  description?: string
  color?: string
  icon?: string
  memberCount?: number
  testCaseCount?: number
  activeRunsCount?: number
  lastRunDate?: Date | null
}
