import { expect, test } from '@playwright/test'
import { ensureLoggedIn } from './helpers'

test.describe.serial('Phase B - Test Repository smoke', () => {
  const suiteName = 'New Suite'
  const caseTitle = `Smoke Case ${Date.now()}`

  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page)
    await page.goto('/test-repository')
    await expect(page.getByRole('heading', { name: 'Test Suites' })).toBeVisible()
  })

  test('Load /test-repository → suite tree visible (not empty/mock)', async ({ page }) => {
    await expect(page.getByText('All Test Cases')).toBeVisible()
    await expect(page.getByText('No project selected')).not.toBeVisible()
  })

  test('Create new suite → appears in tree', async ({ page }) => {
    const before = await page.getByText(suiteName, { exact: true }).count()

    const suiteHeader = page.getByRole('heading', { name: 'Test Suites' }).locator('xpath=..')
    await suiteHeader.locator('button').last().click()
    await page.getByRole('menuitem', { name: 'New Suite' }).click()

    await expect(page.getByText(suiteName, { exact: true }).nth(before)).toBeVisible()
  })

  test('Create new test case → appears in case list', async ({ page }) => {
    await page.goto('/test-case/new')
    await expect(page.getByRole('heading', { name: 'Create Test Case' })).toBeVisible()

    await page.getByLabel('Title *').fill(caseTitle)

    const priority = page.locator('label:has-text("Priority")').locator('xpath=following-sibling::button').first()
    await priority.click()
    await page.getByRole('option', { name: 'High' }).click()

    await page.locator('textarea[id="steps.0.action"]').fill('Open login page')
    await page.locator('textarea[id="steps.0.expectedResult"]').fill('Login page is displayed')

    await page.getByRole('button', { name: 'Create Test Case' }).click()
    await expect(page).toHaveURL(/\/test-repository/)
    await expect(page.getByText(caseTitle)).toBeVisible()
  })

  test('Filter cases by priority → results filtered correctly', async ({ page }) => {
    await page.getByRole('button', { name: /Priority/i }).click()
    await page.getByLabel('High').click()

    await expect(page.getByText(/Showing .* test case/i)).toBeVisible()
    await expect(page.getByText(caseTitle)).toBeVisible()
  })

  test('Delete a suite → removed from tree', async ({ page }) => {
    const targets = page.getByText(suiteName, { exact: true })
    const before = await targets.count()
    test.skip(before === 0, 'No suite available to delete')

    const candidate = targets.nth(before - 1)
    await candidate.click({ button: 'right' })
    await page.getByRole('menuitem', { name: 'Delete Suite' }).click()
    await page.getByRole('button', { name: 'Delete' }).click()

    await expect(page.getByText(suiteName, { exact: true })).toHaveCount(Math.max(0, before - 1))
  })
})
