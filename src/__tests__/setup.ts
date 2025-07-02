import { expect, vi } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

// Mock Next.js environment variables
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Keep error and warn for important messages, but silence debug/info
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
}
