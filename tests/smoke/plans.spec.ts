import { expect, test } from '@playwright/test'
import { ensureLoggedIn } from './helpers'

test.describe.serial('Phase D - Plans smoke', () => {
  let createdPlanName = `Smoke Plan ${Date.now()}`
  let planId = ''

  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page)
  })

  test('Load /test-plans → plan list visible', async ({ page }) => {
    await page.goto('/test-plans')
    await expect(page.getByRole('heading', { name: 'Test Plans' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Plan' })).toBeVisible()
  })

  test('Create plan → appears in list', async ({ page }) => {
    await page.goto('/test-plans/new')
    await expect(page.getByRole('heading', { name: 'Create Test Plan' })).toBeVisible()

    await page.getByLabel('Plan Name *').fill(createdPlanName)
    await page.getByLabel('Description').fill('Smoke test plan created by Playwright suite')
    await page.getByRole('button', { name: /^Create Plan$/ }).click()

    await expect(page).toHaveURL(/\/test-plans/)
    await expect(page.getByText(createdPlanName)).toBeVisible()
  })

  test('View plan detail → readiness score visible', async ({ page }) => {
    await page.goto('/test-plans')
    await page.getByText(createdPlanName).first().click()
    await expect(page).toHaveURL(/\/test-plans\/.+/)

    const match = page.url().match(/\/test-plans\/([^/?#]+)/)
    planId = match?.[1] ?? ''

    await expect(page.getByRole('heading', { name: 'Release Readiness' })).toBeVisible()
    await expect(page.getByText(/Ready|Approaching Ready|Not Ready/i)).toBeVisible()
  })
})
