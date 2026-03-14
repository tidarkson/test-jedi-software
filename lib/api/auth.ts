import apiClient, { clearAccessToken, setAccessToken } from './client'
import { ApiError } from './errors'
import type { ApiSuccessResponse } from './types/common'
import type {
  AuthResponse,
  LoginRequest,
  RawAuthResponse,
  RawUserProfile,
  RegisterRequest,
  UserProfile,
  UserRole,
} from './types/auth'

function normalizeUserRole(role: string): UserRole {
  const normalizedRole = role.toLowerCase()

  switch (normalizedRole) {
    case 'qa_lead':
    case 'qa_engineer':
    case 'admin':
      return 'admin'
    case 'manager':
      return 'manager'
    case 'developer':
    case 'tester':
    case 'engineer':
      return 'engineer'
    case 'viewer':
      return 'viewer'
    case 'owner':
      return 'admin'
    default:
      return 'viewer'
  }
}

function normalizeUserProfile(user: RawUserProfile): UserProfile {
  const rawRole = user.role ?? user.roles?.[0] ?? 'viewer'

  return {
    id: user.id ?? user.userId ?? '',
    email: user.email,
    name: user.name,
    organizationId: user.organizationId,
    role: normalizeUserRole(rawRole),
  }
}

function normalizeAuthResponse(payload: RawAuthResponse): AuthResponse {
  return {
    ...payload,
    user: normalizeUserProfile(payload.user),
  }
}

function emitLogoutEvent(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.dispatchEvent(new CustomEvent('auth:logout'))
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiSuccessResponse<RawAuthResponse>>('/auth/login', data)
  const payload = normalizeAuthResponse(response.data.data)
  setAccessToken(payload.accessToken)
  return payload
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiSuccessResponse<RawAuthResponse>>('/auth/register', data)
  const payload = normalizeAuthResponse(response.data.data)
  setAccessToken(payload.accessToken)
  return payload
}

export async function refreshToken(): Promise<{ accessToken: string }> {
  const response = await apiClient.post<ApiSuccessResponse<{ accessToken: string }>>(
    '/auth/refresh',
    {},
    { withCredentials: true }
  )

  const payload = response.data.data
  if (!payload.accessToken) {
    throw new ApiError({
      code: response.status,
      error: 'TOKEN_REFRESH_FAILED',
      message: 'Token refresh response did not include accessToken',
      errors: [],
    })
  }

  setAccessToken(payload.accessToken)
  return payload
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post<ApiSuccessResponse<Record<string, never>>>('/auth/logout')
  } finally {
    clearAccessToken()
    emitLogoutEvent()
  }
}

export async function getMe(): Promise<UserProfile> {
  const response = await apiClient.get<ApiSuccessResponse<{ user: RawUserProfile } | RawUserProfile>>('/auth/me')
  const payload = response.data.data
  const user = 'user' in payload ? payload.user : payload
  return normalizeUserProfile(user)
}

export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}): Promise<void> {
  await apiClient.post<ApiSuccessResponse<Record<string, never>>>('/auth/change-password', data)
}
