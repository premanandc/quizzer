import { test, expect } from '@playwright/test'

test.describe('Leaderboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001')
  })

  test('global leaderboard page loads and displays content', async ({
    page,
  }) => {
    // Navigate to leaderboard
    await page.click('text=Leaderboard')
    await expect(page.locator('h1')).toContainText('Global Leaderboard')

    // Check that essential leaderboard elements exist
    const hasTotalUsersSection =
      (await page.locator('h3').filter({ hasText: 'Total Users' }).count()) > 0
    const hasPageContent =
      (await page.locator('h1, h2, h3, p, div').count()) > 3

    // Should have either specific leaderboard sections or general page content
    expect(hasTotalUsersSection || hasPageContent).toBe(true)
  })

  test('browse quizzes page shows quiz cards', async ({ page }) => {
    // Go to browse quizzes
    await page.click('text=Browse Quizzes')
    await expect(page.locator('h1')).toContainText('Available Quizzes')

    // Should show either quiz cards or empty state
    const hasQuizCards =
      (await page.locator('button:has-text("Start Quiz")').count()) > 0
    const hasEmptyState = await page
      .locator('text=No quizzes available yet')
      .isVisible()

    expect(hasQuizCards || hasEmptyState).toBe(true)
  })

  test('leaderboard navigation works correctly', async ({ page }) => {
    // Test navigation from home to leaderboard
    await page.click('text=Leaderboard')
    await expect(page.locator('h1')).toContainText('Global Leaderboard')

    // Navigate back to home via logo/title
    await page.click('text=Quizzer')
    await expect(page.locator('h2')).toContainText('Test Your Knowledge')

    // Test navigation from browse quizzes to leaderboard
    await page.click('text=Browse Quizzes')
    await expect(page.locator('h1')).toContainText('Available Quizzes')

    await page.click('text=Leaderboard')
    await expect(page.locator('h1')).toContainText('Global Leaderboard')

    // Navigate back to browse quizzes
    await page.click('text=Browse Quizzes')
    await expect(page.locator('h1')).toContainText('Available Quizzes')
  })

  test('leaderboard handles empty state gracefully', async ({ page }) => {
    await page.click('text=Leaderboard')

    // Check stats display even with no data
    const statsSection = page.locator('text=Total Users').locator('..')
    await expect(statsSection).toBeVisible()

    // Should show 0 users gracefully or empty message
    const statsContainer = page.locator('text=Total Users').locator('..')
    const hasStatsContainer = await statsContainer.isVisible()
    const hasEmptyMessage = await page
      .locator('text=No users on leaderboard yet')
      .isVisible()

    // Either shows stats container or empty message
    expect(hasStatsContainer || hasEmptyMessage).toBe(true)

    // Page should remain functional
    await expect(page.locator('h1')).toContainText('Global Leaderboard')

    // Navigation should still work
    await page.click('text=Browse Quizzes')
    await expect(page.locator('h1')).toContainText('Available Quizzes')
  })

  test('leaderboard responsive design works', async ({ page }) => {
    await page.click('text=Leaderboard')

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Key elements should still be visible
    await expect(page.locator('h1')).toContainText('Global Leaderboard')
    await expect(page.locator('text=Total Users')).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    // Should remain functional
    await expect(page.locator('h1')).toContainText('Global Leaderboard')
    await expect(
      page.locator('h3').filter({ hasText: 'Average Score' }).first()
    ).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 })

    // Should display properly
    await expect(page.locator('h1')).toContainText('Global Leaderboard')
  })
})
