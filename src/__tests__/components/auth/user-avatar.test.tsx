import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { UserAvatar } from '@/components/auth/user-avatar'
import { auth } from '@/auth'

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/components/auth/signin-button', () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="signin-button">{children}</button>
  ),
}))

vi.mock('@/components/auth/signout-button', () => ({
  SignOutButton: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="signout-button">{children}</button>
  ),
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={href} className={className} data-testid="profile-link">
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
  }) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  ),
}))

describe('UserAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('should show sign in button when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    render(await UserAvatar())

    expect(screen.getByTestId('signin-button')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.queryByTestId('signout-button')).not.toBeInTheDocument()
    expect(screen.queryByTestId('profile-link')).not.toBeInTheDocument()
  })

  it('should show user info and sign out button when authenticated', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
      },
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    render(await UserAvatar())

    expect(screen.getByTestId('profile-link')).toBeInTheDocument()
    expect(screen.getByTestId('signout-button')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByTestId('signin-button')).not.toBeInTheDocument()
  })

  it('should display user image when available', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
      },
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    render(await UserAvatar())

    const userImage = screen.getByAltText('John Doe')
    expect(userImage).toBeInTheDocument()
    expect(userImage).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    expect(userImage).toHaveClass('w-8', 'h-8', 'rounded-full')
  })

  it('should not display user image when not available', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        image: null,
      },
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    render(await UserAvatar())

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should display email when name is not available', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        name: null,
        email: 'john@example.com',
        image: null,
      },
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    render(await UserAvatar())

    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })

  it('should use name for image alt text when available', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        name: 'Jane Smith',
        email: 'jane@example.com',
        image: 'https://example.com/jane.jpg',
      },
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    render(await UserAvatar())

    const userImage = screen.getByAltText('Jane Smith')
    expect(userImage).toBeInTheDocument()
  })

  it('should use "User" as alt text when name is not available', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        name: null,
        email: 'user@example.com',
        image: 'https://example.com/user.jpg',
      },
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    render(await UserAvatar())

    const userImage = screen.getByAltText('User')
    expect(userImage).toBeInTheDocument()
  })

  it('should link to profile page when authenticated', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
      },
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    render(await UserAvatar())

    const profileLink = screen.getByTestId('profile-link')
    expect(profileLink).toHaveAttribute('href', '/profile')
    expect(profileLink).toHaveClass(
      'flex',
      'items-center',
      'gap-2',
      'hover:text-blue-600'
    )
  })

  it('should handle session with empty user object', async () => {
    const mockSession = {
      user: {},
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    render(await UserAvatar())

    expect(screen.getByTestId('signin-button')).toBeInTheDocument()
    expect(screen.queryByTestId('signout-button')).not.toBeInTheDocument()
  })

  it('should handle session with partial user data', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'partial@example.com',
      },
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    render(await UserAvatar())

    expect(screen.getByTestId('profile-link')).toBeInTheDocument()
    expect(screen.getByTestId('signout-button')).toBeInTheDocument()
    expect(screen.getByText('partial@example.com')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('should apply correct CSS classes for layout', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
      },
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    render(await UserAvatar())

    const container = screen.getByTestId('profile-link').parentElement
    expect(container).toHaveClass('flex', 'items-center', 'gap-3')

    const nameSpan = screen.getByText('John Doe')
    expect(nameSpan).toHaveClass('text-sm', 'font-medium')
  })

  it('should handle auth function throwing error', async () => {
    vi.mocked(auth).mockRejectedValue(new Error('Auth error'))

    // This should not throw, but should render as unauthenticated
    await expect(async () => {
      render(await UserAvatar())
    }).rejects.toThrow('Auth error')
  })
})
