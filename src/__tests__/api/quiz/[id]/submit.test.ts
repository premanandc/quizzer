import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '@/app/api/quiz/[id]/submit/route'
import { NextRequest } from 'next/server'

// Create shared mock references that will be replaced in tests
let mockSubmitQuiz: ReturnType<typeof vi.fn>
let mockAuth: ReturnType<typeof vi.fn>

// Mock dependencies
vi.mock('@/lib/services/quiz-service', () => {
  return {
    QuizService: vi.fn().mockImplementation(() => {
      return {
        submitQuiz: (...args: unknown[]) => mockSubmitQuiz?.(...args),
      }
    }),
  }
})

vi.mock('@/auth', () => ({
  auth: (...args: unknown[]) => mockAuth?.(...args),
}))

describe('/api/quiz/[id]/submit - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSubmitQuiz = vi.fn()
    mockAuth = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockQuizSession = {
    quizId: 'quiz-123',
    currentQuestionIndex: 0,
    totalQuestions: 2,
    answers: {
      q1: ['opt1'],
      q2: ['opt3', 'opt4'],
    },
    isCompleted: true,
    startTime: '2024-01-01T10:00:00.000Z',
    timeSpent: 120,
  }

  const mockQuiz = {
    id: 'quiz-123',
    title: 'Sample Quiz',
    description: 'A sample quiz',
    isActive: true,
    totalQuestions: 2,
    questions: [
      {
        id: 'q1',
        questionText: 'Question 1?',
        questionType: 'SINGLE_CHOICE',
        orderIndex: 0,
        options: [
          {
            id: 'opt1',
            optionText: 'Option A',
            isCorrect: true,
            explanation: '',
            orderIndex: 0,
          },
          {
            id: 'opt2',
            optionText: 'Option B',
            isCorrect: false,
            explanation: '',
            orderIndex: 1,
          },
        ],
      },
      {
        id: 'q2',
        questionText: 'Question 2?',
        questionType: 'MULTIPLE_CHOICE',
        orderIndex: 1,
        options: [
          {
            id: 'opt3',
            optionText: 'Option C',
            isCorrect: true,
            explanation: '',
            orderIndex: 0,
          },
          {
            id: 'opt4',
            optionText: 'Option D',
            isCorrect: true,
            explanation: '',
            orderIndex: 1,
          },
        ],
      },
    ],
  }

  const mockResult = {
    attemptId: 'attempt-123',
    score: 2,
    totalQuestions: 2,
    correctAnswers: 2,
    percentage: 100,
    timeSpent: 120,
    grade: 'A',
    questionResults: [
      {
        questionId: 'q1',
        questionText: 'Question 1?',
        userAnswers: ['opt1'],
        correctAnswers: ['opt1'],
        isCorrect: true,
        selectedOptions: [
          {
            id: 'opt1',
            optionText: 'Option A',
            isCorrect: true,
            explanation: '',
            orderIndex: 0,
          },
        ],
        allOptions: [
          {
            id: 'opt1',
            optionText: 'Option A',
            isCorrect: true,
            explanation: '',
            orderIndex: 0,
          },
          {
            id: 'opt2',
            optionText: 'Option B',
            isCorrect: false,
            explanation: '',
            orderIndex: 1,
          },
        ],
      },
    ],
  }

  it('should submit quiz successfully with authenticated user', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    }

    mockAuth.mockResolvedValue(mockSession)
    mockSubmitQuiz.mockResolvedValue(mockResult)

    const request = new NextRequest(
      'http://localhost/api/quiz/quiz-123/submit',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizSession: mockQuizSession,
          quiz: mockQuiz,
        }),
      }
    )

    const params = Promise.resolve({ id: 'quiz-123' })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockResult)
    expect(mockSubmitQuiz).toHaveBeenCalledWith(
      {
        ...mockQuizSession,
        startTime: new Date(mockQuizSession.startTime),
      },
      mockQuiz,
      'user-123'
    )
  })

  it('should submit quiz successfully without authenticated user', async () => {
    mockAuth.mockResolvedValue(null)
    mockSubmitQuiz.mockResolvedValue(mockResult)

    const request = new NextRequest(
      'http://localhost/api/quiz/quiz-123/submit',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizSession: mockQuizSession,
          quiz: mockQuiz,
        }),
      }
    )

    const params = Promise.resolve({ id: 'quiz-123' })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockResult)
    expect(mockSubmitQuiz).toHaveBeenCalledWith(
      {
        ...mockQuizSession,
        startTime: new Date(mockQuizSession.startTime),
      },
      mockQuiz,
      undefined
    )
  })

  it('should return 400 for missing quizSession', async () => {
    mockAuth.mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost/api/quiz/quiz-123/submit',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz: mockQuiz,
        }),
      }
    )

    const params = Promise.resolve({ id: 'quiz-123' })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Missing required data' })
    expect(mockSubmitQuiz).not.toHaveBeenCalled()
  })

  it('should return 400 for missing quiz', async () => {
    mockAuth.mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost/api/quiz/quiz-123/submit',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizSession: mockQuizSession,
        }),
      }
    )

    const params = Promise.resolve({ id: 'quiz-123' })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Missing required data' })
    expect(mockSubmitQuiz).not.toHaveBeenCalled()
  })

  it('should return 400 for both missing data', async () => {
    mockAuth.mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost/api/quiz/quiz-123/submit',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }
    )

    const params = Promise.resolve({ id: 'quiz-123' })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Missing required data' })
    expect(mockSubmitQuiz).not.toHaveBeenCalled()
  })

  it('should return 500 for database errors', async () => {
    mockAuth.mockResolvedValue(null)
    mockSubmitQuiz.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest(
      'http://localhost/api/quiz/quiz-123/submit',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizSession: mockQuizSession,
          quiz: mockQuiz,
        }),
      }
    )

    const params = Promise.resolve({ id: 'quiz-123' })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to submit quiz' })
  })

  it('should return 500 for auth errors', async () => {
    mockAuth.mockRejectedValue(new Error('Auth error'))

    const request = new NextRequest(
      'http://localhost/api/quiz/quiz-123/submit',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizSession: mockQuizSession,
          quiz: mockQuiz,
        }),
      }
    )

    const params = Promise.resolve({ id: 'quiz-123' })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to submit quiz' })
  })

  it('should handle malformed JSON', async () => {
    mockAuth.mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost/api/quiz/quiz-123/submit',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      }
    )

    const params = Promise.resolve({ id: 'quiz-123' })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to submit quiz' })
  })

  it('should correctly convert startTime string to Date object', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    }

    mockAuth.mockResolvedValue(mockSession)
    mockSubmitQuiz.mockResolvedValue(mockResult)

    const sessionWithStringTime = {
      ...mockQuizSession,
      startTime: '2024-01-01T15:30:45.123Z',
    }

    const request = new NextRequest(
      'http://localhost/api/quiz/quiz-123/submit',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizSession: sessionWithStringTime,
          quiz: mockQuiz,
        }),
      }
    )

    const params = Promise.resolve({ id: 'quiz-123' })
    const response = await POST(request, { params })

    expect(response.status).toBe(200)
    expect(mockSubmitQuiz).toHaveBeenCalledWith(
      {
        ...sessionWithStringTime,
        startTime: new Date('2024-01-01T15:30:45.123Z'),
      },
      mockQuiz,
      'user-123'
    )
  })

  it('should handle session with partial user data', async () => {
    const mockSession = {
      user: { email: 'test@example.com' }, // Missing id
    }

    mockAuth.mockResolvedValue(mockSession)
    mockSubmitQuiz.mockResolvedValue(mockResult)

    const request = new NextRequest(
      'http://localhost/api/quiz/quiz-123/submit',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizSession: mockQuizSession,
          quiz: mockQuiz,
        }),
      }
    )

    const params = Promise.resolve({ id: 'quiz-123' })
    const response = await POST(request, { params })

    expect(response.status).toBe(200)
    expect(mockSubmitQuiz).toHaveBeenCalledWith(
      {
        ...mockQuizSession,
        startTime: new Date(mockQuizSession.startTime),
      },
      mockQuiz,
      undefined
    )
  })

  it('should handle empty quiz session answers', async () => {
    mockAuth.mockResolvedValue(null)
    mockSubmitQuiz.mockResolvedValue({
      ...mockResult,
      score: 0,
      correctAnswers: 0,
      percentage: 0,
      grade: 'F',
    })

    const emptySession = {
      ...mockQuizSession,
      answers: {},
    }

    const request = new NextRequest(
      'http://localhost/api/quiz/quiz-123/submit',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizSession: emptySession,
          quiz: mockQuiz,
        }),
      }
    )

    const params = Promise.resolve({ id: 'quiz-123' })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.score).toBe(0)
    expect(data.correctAnswers).toBe(0)
    expect(data.percentage).toBe(0)
    expect(data.grade).toBe('F')
  })
})
