import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { signIn } from 'next-auth/react'
import { SignInForm } from '@/components/auth/signin-form'

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}))

// Mock window.location
const mockLocation = {
  href: '',
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

describe('SignInForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocation.href = ''
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('should render all form fields', () => {
    render(<SignInForm />)

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('should update form fields when typing', async () => {
    const user = userEvent.setup()
    render(<SignInForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')

    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'password123')

    expect(emailInput).toHaveValue('john@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('should sign in successfully with valid credentials', async () => {
    const user = userEvent.setup()

    vi.mocked(signIn).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                error: undefined,
                status: 200,
                ok: true,
                url: null,
              } as any),
            100
          )
        )
    )

    render(<SignInForm />)

    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')

    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    await user.click(submitButton)

    expect(screen.getByText('Signing in...')).toBeInTheDocument()

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'john@example.com',
        password: 'password123',
        redirect: false,
      })
    })

    await waitFor(() => {
      expect(mockLocation.href).toBe('/')
    })
  })

  it('should show error message for invalid credentials', async () => {
    const user = userEvent.setup()

    vi.mocked(signIn).mockResolvedValueOnce({
      error: 'CredentialsSignin',
      status: 401,
      ok: false,
      url: null,
    } as any)

    render(<SignInForm />)

    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')

    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })

    expect(mockLocation.href).toBe('')
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('should show error message for sign in errors', async () => {
    const user = userEvent.setup()

    vi.mocked(signIn).mockRejectedValueOnce(new Error('Network error'))

    render(<SignInForm />)

    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')

    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('An error occurred during sign in')
      ).toBeInTheDocument()
    })

    expect(mockLocation.href).toBe('')
  })

  it('should disable form fields during submission', async () => {
    const user = userEvent.setup()

    // Mock a slow sign in process
    vi.mocked(signIn).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                error: undefined,
                status: 200,
                ok: true,
                url: null,
              } as any),
            100
          )
        )
    )

    render(<SignInForm />)

    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')

    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    await user.click(submitButton)

    // Check that form fields are disabled during submission
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled()

    // Wait for submission to complete
    await waitFor(() => {
      expect(mockLocation.href).toBe('/')
    })
  })

  it('should require email and password fields', () => {
    render(<SignInForm />)

    expect(screen.getByLabelText('Email')).toBeRequired()
    expect(screen.getByLabelText('Password')).toBeRequired()
  })

  it('should have correct input types', () => {
    render(<SignInForm />)

    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password'
    )
  })

  it('should prevent form submission when loading', async () => {
    const user = userEvent.setup()

    vi.mocked(signIn).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                error: undefined,
                status: 200,
                ok: true,
                url: null,
              } as any),
            100
          )
        )
    )

    render(<SignInForm />)

    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')

    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    // Click submit button
    await user.click(submitButton)

    // Try to click again while loading
    await user.click(screen.getByRole('button', { name: 'Signing in...' }))

    // signIn should only be called once
    expect(signIn).toHaveBeenCalledTimes(1)
  })

  it('should clear error message when form is edited after error', async () => {
    const user = userEvent.setup()

    vi.mocked(signIn).mockResolvedValueOnce({
      error: 'CredentialsSignin',
      status: 401,
      ok: false,
      url: null,
    } as any)

    render(<SignInForm />)

    // Submit form with error
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })

    // Edit form - should clear error message
    await user.type(screen.getByLabelText('Email'), '2')

    expect(
      screen.queryByText('Invalid email or password')
    ).not.toBeInTheDocument()
  })

  it('should handle form submission with enter key', async () => {
    const user = userEvent.setup()

    vi.mocked(signIn).mockResolvedValueOnce({
      error: null,
      status: 200,
      ok: true,
      url: null,
    } as any)

    render(<SignInForm />)

    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')

    // Submit with Enter key
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'john@example.com',
        password: 'password123',
        redirect: false,
      })
    })
  })

  it('should not submit form with empty fields', async () => {
    const user = userEvent.setup()
    render(<SignInForm />)

    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    await user.click(submitButton)

    expect(signIn).not.toHaveBeenCalled()
  })
})
