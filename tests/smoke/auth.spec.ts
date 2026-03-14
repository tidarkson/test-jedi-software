import { expect, test } from '@playwright/test'
import { clearAuth, creds, login, openUserMenu } from './helpers'

test.describe('Phase A - Auth smoke', () => {
  test('Register with valid data → lands on /dashboard', async ({ page }) => {
    await clearAuth(page)
    let registered = false

    for (let attempt = 1; attempt <= 3; attempt++) {
      const timestamp = Date.now() + attempt
      const email = `smoke-register-${timestamp}@example.com`

      await page.goto('/register')
      await expect(page.locator('[data-slot="card-title"]', { hasText: 'Create account' })).toBeVisible()

      await page.getByLabel('Full Name').fill('Smoke Register User')
      await page.getByLabel('Email').fill(email)
      await page.getByLabel('Organization Name').fill(`Smoke Org ${timestamp}`)
      await page.getByLabel(/^Password$/).fill('ValidPass123!')
      await page.getByLabel('Confirm Password').fill('ValidPass123!')
      await page.getByRole('button', { name: 'Create account' }).click()

      try {
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 })
        registered = true
        break
      } catch {
        const dbUnavailable = page.getByText('Database is temporarily unavailable. Please try again shortly.')
        const isDbUnavailableVisible = await dbUnavailable.isVisible().catch(() => false)

        if (!isDbUnavailableVisible || attempt === 3) {
          throw new Error('Registration did not reach dashboard and was not recoverable by retry.')
        }
      }
    }

    expect(registered).toBeTruthy()

    const token = await page.evaluate(() => localStorage.getItem('tj_access_token'))
    expect(token).toBeTruthy()
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('Login with valid credentials → lands on /dashboard', async ({ page }) => {
    await login(page, creds.default.email, creds.default.password)
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
  })

  test('Login with wrong password → error shown', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(creds.default.email)
    await page.getByLabel('Password').fill(process.env.SMOKE_INVALID_PASSWORD || `${creds.default.password}-invalid`)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText(/Login Error|invalid|unauthorized|credentials/i)).toBeVisible()
  })

  test('Navigate to /test-repository without token → redirect to /login', async ({ page }) => {
    await page.goto('/test-repository')
    await expect(page).toHaveURL(/\/login/)
  })

  test('Login, refresh page → session still active (loadUser restores it)', async ({ page }) => {
    await login(page, creds.default.email, creds.default.password)
    await page.reload()
    await expect(page).toHaveURL(/\/dashboard/)

    const token = await page.evaluate(() => localStorage.getItem('tj_access_token'))
    expect(token).toBeTruthy()
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
  })

  test('Logout → redirect to /login, protected pages blocked', async ({ page }) => {
    await login(page, creds.default.email, creds.default.password)
    await openUserMenu(page)
    await page.getByRole('menuitem', { name: /Log out/i }).click()

    await expect(page).toHaveURL(/\/login/)

    await clearAuth(page)
    await page.goto('/test-runs')
    await expect(page).toHaveURL(/\/login/)
  })
})
