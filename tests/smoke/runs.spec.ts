import { expect, test } from '@playwright/test'
import { ensureLoggedIn } from './helpers'

test.describe.serial('Phase C - Test Runs smoke', () => {
  let runId = ''

  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page)
  })

  test('Create new run via wizard → redirected to run dashboard', async ({ page }) => {
    await page.goto('/test-runs/new')
    await expect(page.getByRole('heading', { name: 'Create Test Run' })).toBeVisible()

    await page.getByLabel('Run Title *').fill(`Smoke Run ${Date.now()}`)
    await page.getByRole('button', { name: 'Next' }).click()

    const firstSuiteCheckbox = page.locator('input[type="checkbox"]').first()
    await firstSuiteCheckbox.check()
    await expect(page.getByText(/\d+ Cases/i)).toBeVisible()

    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Create Test Run' }).click()

    await expect(page).toHaveURL(/\/test-runs\/.+/)
    const match = page.url().match(/\/test-runs\/([^/?#]+)/)
    runId = match?.[1] ?? ''
    expect(runId).toBeTruthy()
  })

  test('Run dashboard shows metrics (not all zero)', async ({ page }) => {
    test.skip(!runId, 'Run ID missing from previous test')
    await page.goto(`/test-runs/${runId}`)

    await expect(page.getByRole('heading', { name: /Progress Overview/i })).toBeVisible()
    await expect(page.getByText(/Quick Stats/i)).toBeVisible()

    const quickStatsPanel = page.locator('div:has-text("Quick Stats")').first()
    await expect(quickStatsPanel).toContainText(/Completion|Pass Rate|Fail Rate/i)
    await expect(quickStatsPanel).not.toContainText(/^0%\s*$/)
  })

  test('Navigate to /execute?runId=X → cases loaded', async ({ page }) => {
    test.skip(!runId, 'Run ID missing from previous test')
    await page.goto(`/execute?runId=${runId}`)

    await expect(page).toHaveURL(/\/execute\?runId=/)
    await expect(page.getByText(/Saved|Saving|Not saved|Save failed/i)).toBeVisible()
    await expect(page.getByText(/Select a test case to begin execution/i)).not.toBeVisible()
  })

  test('Mark first case as Passed → auto-save fires', async ({ page }) => {
    test.skip(!runId, 'Run ID missing from previous test')
    await page.goto(`/execute?runId=${runId}`)

    await page.getByRole('button', { name: /^Passed$/i }).first().click()
    await expect(page.getByText(/Saving\.\.\.|Just saved|Saved \d+s ago|Saved \d+m ago/i)).toBeVisible()
  })
})
