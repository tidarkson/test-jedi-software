import { expect, Page } from '@playwright/test'

const requiredEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required env var: ${key}`)
  }
  return value
}

export const creds = {
  default: {
    email: requiredEnv('SMOKE_USER_EMAIL'),
    password: requiredEnv('SMOKE_USER_PASSWORD'),
  },
  admin: {
    email: process.env.SMOKE_ADMIN_EMAIL || requiredEnv('SMOKE_USER_EMAIL'),
    password: process.env.SMOKE_ADMIN_PASSWORD || requiredEnv('SMOKE_USER_PASSWORD'),
  },
  viewer: {
    email: process.env.SMOKE_VIEWER_EMAIL || requiredEnv('SMOKE_USER_EMAIL'),
    password: process.env.SMOKE_VIEWER_PASSWORD || requiredEnv('SMOKE_USER_PASSWORD'),
  },
}

export async function login(page: Page, email: string, password: string) {
  await clearAuth(page)
  await page.goto('/login')

  if (page.url().includes('/dashboard')) {
    await clearAuth(page)
    await page.goto('/login')
  }

  await expect(page.locator('[data-slot="card-title"]', { hasText: 'Sign in' })).toBeVisible()
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 })
}

export async function openUserMenu(page: Page) {
  const avatarButton = page.locator('header button.rounded-full').first()
  await expect(avatarButton).toBeVisible()
  await avatarButton.click()
}

export async function ensureLoggedIn(page: Page) {
  await login(page, creds.default.email, creds.default.password)
  await expect(page.getByText('Test Execution Dashboard')).toBeVisible()
}

export async function clearAuth(page: Page) {
  // localStorage is only available on non-about:blank origins.
  if (page.url().startsWith('about:blank')) {
    await page.goto('/')
  }

  await page.context().clearCookies()

  await page.evaluate(() => {
    localStorage.removeItem('tj_access_token')
    localStorage.removeItem('tj-auth-store')
    localStorage.removeItem('tj_current_project')
    document.cookie = 'tj_access_token=; path=/; max-age=0; samesite=lax'
  })
}
