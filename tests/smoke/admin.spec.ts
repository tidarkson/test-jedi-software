import { expect, test } from '@playwright/test'
import { creds, login } from './helpers'

test.describe('Phase E - Admin smoke', () => {
  test('Access /settings as VIEWER → admin tabs hidden', async ({ page }) => {
    await login(page, creds.viewer.email, creds.viewer.password)
    await page.goto('/settings')

    await expect(page.getByText('Access Denied')).toBeVisible()
    await expect(page.getByText(/Custom Fields|Audit Log|Data Retention|Integrations/i)).not.toBeVisible()
  })

  test('Access /settings as ADMIN → users table visible with real data', async ({ page }) => {
    await login(page, creds.admin.email, creds.admin.password)
    await page.goto('/settings')

    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Custom Fields/i })).toBeVisible()

    await page.goto('/team')
    await expect(page.getByRole('heading', { name: 'Organization Members' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'User' })).toBeVisible()
    await expect(page.getByText('No organization members found')).not.toBeVisible()
  })
})
