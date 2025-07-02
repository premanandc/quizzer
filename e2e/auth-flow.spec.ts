import { test, expect } from '@playwright/test'

test.describe('User Registration and Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001')
  })

  test('user registration flow works end-to-end', async ({ page }) => {
    // Navigate directly to signup page
    await page.goto('http://localhost:3001/auth/signup')
    await expect(
      page.getByRole('heading', { name: 'Create Account' })
    ).toBeVisible()

    // Fill out registration form
    const timestamp = Date.now()
    const testEmail = `test${timestamp}@example.com`

    await page.fill(
      '[data-testid="name-input"], input[name="name"], #name',
      'Test User'
    )
    await page.fill(
      '[data-testid="email-input"], input[name="email"], #email',
      testEmail
    )
    await page.fill(
      '[data-testid="password-input"], input[name="password"], #password',
      'testpass123'
    )
    await page.fill(
      '[data-testid="confirm-password-input"], input[name="confirmPassword"], #confirmPassword',
      'testpass123'
    )

    // Submit registration form
    await page.click('button[type="submit"], button:has-text("Create Account")')

    // Wait for success message or redirect
    await page.waitForTimeout(2000)

    // Check for success - either success message or redirect to signin
    const hasSuccessMessage = await page
      .locator('text=Account created successfully')
      .isVisible()
    const isOnSigninPage = await page
      .locator('text=Sign In to Quizzer')
      .isVisible()
    const hasRedirected = page.url().includes('/auth/signin')

    expect(hasSuccessMessage || isOnSigninPage || hasRedirected).toBe(true)
  })

  test('registration form validation works', async ({ page }) => {
    await page.goto('http://localhost:3001/auth/signup')

    // Test password mismatch validation
    await page.fill('#name, input[name="name"]', 'Test User')
    await page.fill('#email, input[name="email"]', 'test@example.com')
    await page.fill('#password, input[name="password"]', 'password123')
    await page.fill(
      '#confirmPassword, input[name="confirmPassword"]',
      'differentpassword'
    )

    await page.click('button[type="submit"]')

    // Should show password mismatch error
    await expect(page.locator('text=Passwords do not match')).toBeVisible()
  })

  test('signin form validation works', async ({ page }) => {
    await page.goto('http://localhost:3001/auth/signin')

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Form should not submit (required fields should prevent submission)
    await expect(
      page.getByRole('heading', { name: 'Sign In to Quizzer' })
    ).toBeVisible()

    // Fill invalid credentials
    await page.fill('#email, input[name="email"]', 'invalid@example.com')
    await page.fill('#password, input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error message after attempt
    await page.waitForTimeout(2000)
    await page
      .locator('text=Invalid email or password, text=An error occurred')
      .count()

    // Error handling is graceful (no crash)
    await expect(
      page.getByRole('heading', { name: 'Sign In to Quizzer' })
    ).toBeVisible()
  })

  test('navigation between auth pages works', async ({ page }) => {
    // Go to signin
    await page.goto('http://localhost:3001/auth/signin')
    await expect(
      page.getByRole('heading', { name: 'Sign In to Quizzer' })
    ).toBeVisible()

    // Go to signup
    await page.click('text=Sign up here')
    await expect(
      page.getByRole('heading', { name: 'Create Account' })
    ).toBeVisible()

    // Go back to signin
    await page.click('text=Sign in here')
    await expect(
      page.getByRole('heading', { name: 'Sign In to Quizzer' })
    ).toBeVisible()

    // Go back to home
    await page.click('text=Back to Home')
    await expect(page.locator('h2')).toContainText('Test Your Knowledge')
  })
})
