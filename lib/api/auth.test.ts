import { describe, expect, it } from 'vitest'
import { normalizeUserProfile } from './auth'
import type { RawUserProfile } from './types/auth'

describe('normalizeUserProfile', () => {
  it('maps avatar fields and role correctly', () => {
    const raw: RawUserProfile = {
      userId: 'user-1',
      email: 'qa@example.com',
      name: 'QA Engineer',
      role: 'qa_engineer',
      organizationId: 'org-1',
      avatarUrl: 'https://cdn.example.com/avatar.png',
    }

    const normalized = normalizeUserProfile(raw)

    expect(normalized).toEqual({
      id: 'user-1',
      email: 'qa@example.com',
      name: 'QA Engineer',
      organizationId: 'org-1',
      role: 'admin',
      avatar: 'https://cdn.example.com/avatar.png',
    })
  })

  it('prefers avatar over avatarUrl when both are present', () => {
    const raw: RawUserProfile = {
      id: 'user-2',
      email: 'tester@example.com',
      name: 'Tester',
      roles: ['viewer'],
      avatar: 'https://cdn.example.com/primary.png',
      avatarUrl: 'https://cdn.example.com/fallback.png',
    }

    const normalized = normalizeUserProfile(raw)

    expect(normalized.avatar).toBe('https://cdn.example.com/primary.png')
    expect(normalized.role).toBe('viewer')
  })
})
