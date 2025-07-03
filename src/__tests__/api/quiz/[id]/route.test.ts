import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from '@/app/api/quiz/[id]/route'
import { NextRequest } from 'next/server'

// Create a shared mock reference that will be replaced in tests
let mockGetQuiz: ReturnType<typeof vi.fn>

// Mock the entire module
vi.mock('@/lib/services/quiz-service', () => {
  return {
    QuizService: vi.fn().mockImplementation(() => {
      return {
        getQuiz: (...args: unknown[]) => mockGetQuiz?.(...args),
      }
    }),
  }
})

describe('/api/quiz/[id] - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetQuiz = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return quiz data for valid quiz ID', async () => {
    const mockQuiz = {
      id: 'quiz-123',
      title: 'Sample Quiz',
      description: 'A sample quiz',
      isActive: true,
      totalQuestions: 2,
      questions: [
        {
          id: 'q1',
          questionText: 'What is 2+2?',
          questionType: 'SINGLE_CHOICE',
          orderIndex: 0,
          options: [
            {
              id: 'opt1',
              optionText: '3',
              isCorrect: false,
              explanation: '',
              orderIndex: 0,
            },
            {
              id: 'opt2',
              optionText: '4',
              isCorrect: true,
              explanation: '',
              orderIndex: 1,
            },
          ],
        },
      ],
    }

    mockGetQuiz.mockResolvedValue(mockQuiz)

    const request = new NextRequest('http://localhost/api/quiz/quiz-123')
    const params = Promise.resolve({ id: 'quiz-123' })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockQuiz)
    expect(mockGetQuiz).toHaveBeenCalledWith('quiz-123')
  })

  it('should return 404 for non-existent quiz', async () => {
    mockGetQuiz.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/quiz/nonexistent')
    const params = Promise.resolve({ id: 'nonexistent' })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Quiz not found' })
    expect(mockGetQuiz).toHaveBeenCalledWith('nonexistent')
  })

  it('should return 500 for database errors', async () => {
    mockGetQuiz.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost/api/quiz/quiz-123')
    const params = Promise.resolve({ id: 'quiz-123' })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to fetch quiz' })
    expect(mockGetQuiz).toHaveBeenCalledWith('quiz-123')
  })

  it('should handle special characters in quiz ID', async () => {
    const specialId = 'quiz-123_abc-def'
    const mockQuiz = {
      id: specialId,
      title: 'Special Quiz',
      description: null,
      isActive: true,
      totalQuestions: 1,
      questions: [],
    }

    mockGetQuiz.mockResolvedValue(mockQuiz)

    const request = new NextRequest(`http://localhost/api/quiz/${specialId}`)
    const params = Promise.resolve({ id: specialId })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockQuiz)
    expect(mockGetQuiz).toHaveBeenCalledWith(specialId)
  })

  it('should handle empty quiz ID', async () => {
    mockGetQuiz.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/quiz/')
    const params = Promise.resolve({ id: '' })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Quiz not found' })
    expect(mockGetQuiz).toHaveBeenCalledWith('')
  })

  it('should return quiz with null description correctly', async () => {
    const mockQuiz = {
      id: 'quiz-123',
      title: 'Quiz without description',
      description: null,
      isActive: true,
      totalQuestions: 1,
      questions: [
        {
          id: 'q1',
          questionText: 'Sample question?',
          questionType: 'SINGLE_CHOICE',
          orderIndex: 0,
          options: [
            {
              id: 'opt1',
              optionText: 'Option 1',
              isCorrect: true,
              explanation: '',
              orderIndex: 0,
            },
          ],
        },
      ],
    }

    mockGetQuiz.mockResolvedValue(mockQuiz)

    const request = new NextRequest('http://localhost/api/quiz/quiz-123')
    const params = Promise.resolve({ id: 'quiz-123' })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockQuiz)
  })

  it('should return quiz with multiple questions', async () => {
    const mockQuiz = {
      id: 'quiz-multi',
      title: 'Multi-Question Quiz',
      description: 'A quiz with multiple questions',
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
              explanation: 'Correct!',
              orderIndex: 0,
            },
            {
              id: 'opt2',
              optionText: 'Option B',
              isCorrect: false,
              explanation: 'Wrong',
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
            {
              id: 'opt5',
              optionText: 'Option E',
              isCorrect: false,
              explanation: '',
              orderIndex: 2,
            },
          ],
        },
      ],
    }

    mockGetQuiz.mockResolvedValue(mockQuiz)

    const request = new NextRequest('http://localhost/api/quiz/quiz-multi')
    const params = Promise.resolve({ id: 'quiz-multi' })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockQuiz)
    expect(data.questions).toHaveLength(2)
    expect(data.questions[0].options).toHaveLength(2)
    expect(data.questions[1].options).toHaveLength(3)
  })
})
