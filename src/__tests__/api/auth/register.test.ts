import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '@/app/api/auth/register/route'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}))

describe('/api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create a new user with valid data', async () => {
    const mockUser = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Mock bcrypt hash
    vi.mocked(bcrypt.hash).mockResolvedValue('hashedpassword')

    // Mock user not existing
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    // Mock user creation
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser)

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('User created successfully')
    expect(data.user).toEqual({
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
    })
    expect(data.user.password).toBeUndefined()

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'john@example.com' },
    })
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
      },
    })
  })

  it('should return 400 for missing required fields', async () => {
    const testCases = [
      { name: 'John', email: 'john@example.com' }, // missing password
      { name: 'John', password: 'password123' }, // missing email
      { email: 'john@example.com', password: 'password123' }, // missing name
      {}, // missing all fields
    ]

    for (const body of testCases) {
      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Name, email, and password are required')
    }
  })

  it('should return 400 for invalid email format', async () => {
    const invalidEmails = [
      'invalid-email',
      'invalid@',
      '@invalid.com',
      'invalid@.com',
      'invalid@domain',
    ]

    for (const email of invalidEmails) {
      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email,
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid email format')
    }
  })

  it('should return 400 for password too short', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: '12345', // less than 6 characters
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Password must be at least 6 characters long')
  })

  it('should return 409 for existing user', async () => {
    const existingUser = {
      id: 'existing-user',
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'hashedpassword',
    }

    // Mock user already exists
    vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser)

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('User with this email already exists')
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('should return 500 for database errors', async () => {
    // Mock database error
    vi.mocked(prisma.user.findUnique).mockRejectedValue(
      new Error('Database error')
    )

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('should return 500 for bcrypt errors', async () => {
    // Mock user not existing
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    // Mock bcrypt error
    vi.mocked(bcrypt.hash).mockRejectedValue(new Error('Bcrypt error'))

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('should handle malformed JSON', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('should validate email format edge cases', async () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
      'user123@test-domain.com',
    ]

    for (const email of validEmails) {
      // Mock user not existing
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashedpassword')
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email,
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email,
          password: 'password123',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)
    }
  })
})
