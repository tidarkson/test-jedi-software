export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
  organizationName: string
}

export type UserRole = 'admin' | 'manager' | 'engineer' | 'viewer'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  organizationId?: string
  avatar?: string
}

export interface AuthResponse {
  user: UserProfile
  accessToken: string
}

export interface RawUserProfile {
  id?: string
  userId?: string
  email: string
  name: string
  role?: string
  roles?: string[]
  organizationId?: string
  avatar?: string
  avatarUrl?: string
}

export interface RawAuthResponse {
  user: RawUserProfile
  accessToken: string
}
