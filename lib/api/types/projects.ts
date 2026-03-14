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
}
