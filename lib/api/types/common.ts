export interface ApiSuccessResponse<T> {
  status: 'success'
  code: number
  data: T
}

export interface ApiFieldError {
  field?: string
  message: string
  [key: string]: unknown
}

export interface ApiErrorResponse {
  status: 'error'
  code: number
  error: string
  message: string
  errors: ApiFieldError[]
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedData<T> {
  items: T[]
  pagination: PaginationMeta
}

export type SortDirection = 'asc' | 'desc'

export interface SortParam {
  field: string
  direction: SortDirection
}

export type FilterValue = string | number | boolean | null | Array<string | number | boolean>

export interface FilterParam {
  field: string
  value: FilterValue
}

export interface QueryParams {
  page?: number
  pageSize?: number
  search?: string
  sort?: SortParam[]
  filters?: FilterParam[]
}
