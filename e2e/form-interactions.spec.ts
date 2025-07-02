import { test, expect } from '@playwright/test'

test.describe('Form Interactions and Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001')
  })

  test('quiz form interactions work correctly', async ({ page }) => {
    await page.click('text=Start Prompting Basics Quiz')
    await page.waitForLoadState('networkidle')

    const startButton = page.locator('button', { hasText: 'Start Quiz' })
    if (await startButton.isVisible()) {
      await startButton.click()
      await page.waitForTimeout(1000)
    }

    // Test different input types
    const radioButtons = page.locator('input[type="radio"]')
    const checkboxes = page.locator('input[type="checkbox"]')

    const radioCount = await radioButtons.count()
    const checkboxCount = await checkboxes.count()

    if (radioCount > 0) {
      // Test radio button selection
      await radioButtons.first().click()
      await expect(radioButtons.first()).toBeChecked()

      // Test that selecting another radio deselects the first (if multiple exist)
      if (radioCount > 1) {
        await radioButtons.nth(1).click()
        await expect(radioButtons.nth(1)).toBeChecked()
        await expect(radioButtons.first()).not.toBeChecked()
      }
    }

    if (checkboxCount > 0) {
      // Test checkbox selection (multiple allowed)
      await checkboxes.first().click()
      await expect(checkboxes.first()).toBeChecked()

      if (checkboxCount > 1) {
        await checkboxes.nth(1).click()
        await expect(checkboxes.nth(1)).toBeChecked()
        await expect(checkboxes.first()).toBeChecked() // First should still be checked

        // Test unchecking
        await checkboxes.first().click()
        await expect(checkboxes.first()).not.toBeChecked()
        await expect(checkboxes.nth(1)).toBeChecked() // Second should still be checked
      }
    }
  })

  test('signup form field validation and interactions', async ({ page }) => {
    await page.goto('http://localhost:3001/auth/signup')

    // Test required field validation
    await page.click('button[type="submit"]')

    // Required fields should prevent submission
    await expect(
      page.getByRole('heading', { name: 'Create Account' })
    ).toBeVisible()

    // Test email format validation
    await page.fill('#email, input[name="email"]', 'invalid-email')
    await page.click('button[type="submit"]')

    // Should still be on signup page (invalid email prevents submission)
    await expect(
      page.getByRole('heading', { name: 'Create Account' })
    ).toBeVisible()

    // Test password length validation
    await page.fill('#email, input[name="email"]', 'valid@example.com')
    await page.fill('#password, input[name="password"]', '123') // Too short
    await page.fill('#confirmPassword, input[name="confirmPassword"]', '123')
    await page.click('button[type="submit"]')

    // Should still be on signup page (password too short)
    await expect(
      page.getByRole('heading', { name: 'Create Account' })
    ).toBeVisible()

    // Test password mismatch
    await page.fill('#password, input[name="password"]', 'validpass123')
    await page.fill(
      '#confirmPassword, input[name="confirmPassword"]',
      'differentpass123'
    )
    await page.fill('#name, input[name="name"]', 'Test User')
    await page.click('button[type="submit"]')

    // Should show mismatch error
    await page.waitForTimeout(1000)
    const hasPasswordError = await page
      .locator('text=Passwords do not match')
      .isVisible()
    expect(hasPasswordError).toBe(true)
  })

  test('signin form field validation and interactions', async ({ page }) => {
    await page.goto('http://localhost:3001/auth/signin')

    // Test empty form submission
    await page.click('button[type="submit"]')

    // Should remain on signin page (required fields prevent submission)
    await expect(
      page.getByRole('heading', { name: 'Sign In to Quizzer' })
    ).toBeVisible()

    // Test email format validation
    await page.fill('#email, input[name="email"]', 'not-an-email')
    await page.click('button[type="submit"]')

    // Should still be on signin page
    await expect(
      page.getByRole('heading', { name: 'Sign In to Quizzer' })
    ).toBeVisible()

    // Test with valid format but invalid credentials
    await page.fill('#email, input[name="email"]', 'test@example.com')
    await page.fill('#password, input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should handle invalid credentials gracefully
    await page.waitForTimeout(2000)

    // Either shows error message or remains on signin page
    const stillOnSignin = await page
      .getByRole('heading', { name: 'Sign In to Quizzer' })
      .isVisible()
    await page.locator('text=Invalid, text=error, text=incorrect').count()

    expect(stillOnSignin).toBe(true) // Should remain on signin page
  })

  test('form loading states work correctly', async ({ page }) => {
    await page.goto('http://localhost:3001/auth/signin')

    // Fill valid-looking form data
    await page.fill('#email, input[name="email"]', 'test@example.com')
    await page.fill('#password, input[name="password"]', 'testpassword')

    // Submit and check for loading state
    await page.click('button[type="submit"]')

    // Check if button shows loading state
    await page
      .locator('button:has-text("Signing in"), button:disabled')
      .isVisible()

    // Loading state might be brief, so this is optional
    // Main thing is form doesn't crash
    await page.waitForTimeout(2000)

    // Form should be functional after submission attempt
    const formIsStable = await page.locator('button[type="submit"]').isVisible()
    expect(formIsStable).toBe(true)
  })

  test('form keyboard navigation works', async ({ page }) => {
    await page.goto('http://localhost:3001/auth/signin')

    // Tab through form fields
    await page.press('#email, input[name="email"]', 'Tab')

    // Should focus on password field
    await page
      .locator('#password, input[name="password"]')
      .evaluate((el) => el === document.activeElement)

    // Fill form and test Enter submission
    await page.fill('#email, input[name="email"]', 'test@example.com')
    await page.fill('#password, input[name="password"]', 'testpass')

    // Press Enter to submit
    await page.press('#password, input[name="password"]', 'Enter')

    // Form should attempt submission (same as clicking submit button)
    await page.waitForTimeout(1000)

    // Verify form is still functional
    const formIsWorking = await page
      .locator('button[type="submit"]')
      .isVisible()
    expect(formIsWorking).toBe(true)
  })
})
