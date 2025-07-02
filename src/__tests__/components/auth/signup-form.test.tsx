import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignUpForm } from '@/components/auth/signup-form'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('should render all form fields', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create Account' })
    ).toBeInTheDocument()
    expect(screen.getByText('Minimum 6 characters')).toBeInTheDocument()
  })

  it('should update form fields when typing', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)

    const nameInput = screen.getByLabelText('Full Name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')

    expect(nameInput).toHaveValue('John Doe')
    expect(emailInput).toHaveValue('john@example.com')
    expect(passwordInput).toHaveValue('password123')
    expect(confirmPasswordInput).toHaveValue('password123')
  })

  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)

    await user.type(screen.getByLabelText('Full Name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'different')

    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    await user.click(submitButton)

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()

    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  message: 'User created successfully',
                  user: {
                    id: '123',
                    name: 'John Doe',
                    email: 'john@example.com',
                  },
                }),
              }),
            100
          )
        )
    )

    render(<SignUpForm />)

    await user.type(screen.getByLabelText('Full Name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password123')

    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    await user.click(submitButton)

    expect(screen.getByText('Creating Account...')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      })
    })

    await waitFor(() => {
      expect(
        screen.getByText('Account created successfully! You can now sign in.')
      ).toBeInTheDocument()
    })

    // Form should be cleared after successful submission
    expect(screen.getByLabelText('Full Name')).toHaveValue('')
    expect(screen.getByLabelText('Email')).toHaveValue('')
    expect(screen.getByLabelText('Password')).toHaveValue('')
    expect(screen.getByLabelText('Confirm Password')).toHaveValue('')
  })

  it('should show error message for API errors', async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'User with this email already exists',
      }),
    })

    render(<SignUpForm />)

    await user.type(screen.getByLabelText('Full Name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'existing@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password123')

    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('User with this email already exists')
      ).toBeInTheDocument()
    })

    expect(
      screen.getByRole('button', { name: 'Create Account' })
    ).toBeInTheDocument()
  })

  it('should show generic error message for network errors', async () => {
    const user = userEvent.setup()

    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<SignUpForm />)

    await user.type(screen.getByLabelText('Full Name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password123')

    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('An error occurred during registration')
      ).toBeInTheDocument()
    })
  })

  it('should show error message when API returns error without specific message', async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    })

    render(<SignUpForm />)

    await user.type(screen.getByLabelText('Full Name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password123')

    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('An error occurred during registration')
      ).toBeInTheDocument()
    })
  })

  it('should disable form fields during submission', async () => {
    const user = userEvent.setup()

    // Mock a slow API response
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ message: 'Success' }),
              }),
            100
          )
        )
    )

    render(<SignUpForm />)

    await user.type(screen.getByLabelText('Full Name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password123')

    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    await user.click(submitButton)

    // Check that form fields are disabled during submission
    expect(screen.getByLabelText('Full Name')).toBeDisabled()
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
    expect(screen.getByLabelText('Confirm Password')).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Creating Account...' })
    ).toBeDisabled()

    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.getByLabelText('Full Name')).not.toBeDisabled()
    })
  })

  it('should require all fields', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText('Full Name')).toBeRequired()
    expect(screen.getByLabelText('Email')).toBeRequired()
    expect(screen.getByLabelText('Password')).toBeRequired()
    expect(screen.getByLabelText('Confirm Password')).toBeRequired()
  })

  it('should have correct input types', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText('Full Name')).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password'
    )
    expect(screen.getByLabelText('Confirm Password')).toHaveAttribute(
      'type',
      'password'
    )
  })

  it('should have minimum length validation for passwords', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText('Password')).toHaveAttribute('minLength', '6')
    expect(screen.getByLabelText('Confirm Password')).toHaveAttribute(
      'minLength',
      '6'
    )
  })

  it('should clear success message when form is edited after successful submission', async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'User created successfully',
        user: { id: '123', name: 'John Doe', email: 'john@example.com' },
      }),
    })

    render(<SignUpForm />)

    // Submit form successfully
    await user.type(screen.getByLabelText('Full Name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Create Account' }))

    await waitFor(() => {
      expect(
        screen.getByText('Account created successfully! You can now sign in.')
      ).toBeInTheDocument()
    })

    // Edit form - should clear success message
    await user.type(screen.getByLabelText('Full Name'), 'Jane')

    expect(
      screen.queryByText('Account created successfully! You can now sign in.')
    ).not.toBeInTheDocument()
  })
})
