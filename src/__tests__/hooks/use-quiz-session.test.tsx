import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuizSession } from '@/lib/hooks/use-quiz-session'

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'user-1', name: 'Test User' } },
  }),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useQuizSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockQuiz = {
    id: 'quiz-1',
    title: 'Test Quiz',
    description: 'A test quiz',
    isActive: true,
    totalQuestions: 2,
    questions: [
      {
        id: 'q1',
        questionText: 'What is 2+2?',
        questionType: 'SINGLE_CHOICE' as const,
        orderIndex: 0,
        options: [
          {
            id: 'a1',
            optionText: '3',
            isCorrect: false,
            explanation: 'Wrong',
            orderIndex: 0,
          },
          {
            id: 'a2',
            optionText: '4',
            isCorrect: true,
            explanation: 'Correct',
            orderIndex: 1,
          },
        ],
      },
      {
        id: 'q2',
        questionText: 'What is 3+3?',
        questionType: 'SINGLE_CHOICE' as const,
        orderIndex: 1,
        options: [
          {
            id: 'b1',
            optionText: '5',
            isCorrect: false,
            explanation: 'Wrong',
            orderIndex: 0,
          },
          {
            id: 'b2',
            optionText: '6',
            isCorrect: true,
            explanation: 'Correct',
            orderIndex: 1,
          },
        ],
      },
    ],
  }

  describe('initial state', () => {
    it('should have initial state values', () => {
      const { result } = renderHook(() => useQuizSession())

      expect(result.current.quiz).toBeNull()
      expect(result.current.session).toBeNull()
      expect(result.current.result).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('startQuiz', () => {
    it('should start quiz successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuiz),
      })

      const { result } = renderHook(() => useQuizSession())

      await act(async () => {
        await result.current.startQuiz('quiz-1')
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/quiz/quiz-1')
      expect(result.current.quiz).toEqual(mockQuiz)
      expect(result.current.session).toEqual({
        quizId: 'quiz-1',
        quizTitle: 'Test Quiz',
        currentQuestionIndex: 0,
        totalQuestions: 2,
        answers: {},
        startTime: expect.any(Date),
        timeSpent: 0,
        isCompleted: false,
      })
      expect(result.current.error).toBeNull()
    })

    it('should handle quiz not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const { result } = renderHook(() => useQuizSession())

      await act(async () => {
        await result.current.startQuiz('non-existent')
      })

      expect(result.current.error).toBe('Quiz with ID "non-existent" not found')
      expect(result.current.quiz).toBeNull()
      expect(result.current.session).toBeNull()
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useQuizSession())

      await act(async () => {
        await result.current.startQuiz('quiz-1')
      })

      expect(result.current.error).toBe('Network error')
    })

    it('should set loading state during quiz start', async () => {
      let resolvePromise: (value: unknown) => void
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      mockFetch.mockReturnValueOnce(promise)

      const { result } = renderHook(() => useQuizSession())

      act(() => {
        result.current.startQuiz('quiz-1')
      })

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolvePromise({
          ok: true,
          json: () => Promise.resolve(mockQuiz),
        })
        await promise
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('quiz session management', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuiz),
      })
    })

    it('should update answers correctly', async () => {
      const { result } = renderHook(() => useQuizSession())

      await act(async () => {
        await result.current.startQuiz('quiz-1')
      })

      act(() => {
        result.current.updateAnswer('q1', ['a2'])
      })

      expect(result.current.session?.answers).toEqual({ q1: ['a2'] })
    })

    it('should navigate to next question', async () => {
      const { result } = renderHook(() => useQuizSession())

      await act(async () => {
        await result.current.startQuiz('quiz-1')
      })

      act(() => {
        result.current.nextQuestion()
      })

      expect(result.current.session?.currentQuestionIndex).toBe(1)
    })

    it('should navigate to previous question', async () => {
      const { result } = renderHook(() => useQuizSession())

      await act(async () => {
        await result.current.startQuiz('quiz-1')
      })

      // Go to second question first
      act(() => {
        result.current.nextQuestion()
      })

      // Then go back
      act(() => {
        result.current.previousQuestion()
      })

      expect(result.current.session?.currentQuestionIndex).toBe(0)
    })

    it('should go to specific question', async () => {
      const { result } = renderHook(() => useQuizSession())

      await act(async () => {
        await result.current.startQuiz('quiz-1')
      })

      act(() => {
        result.current.goToQuestion(1)
      })

      expect(result.current.session?.currentQuestionIndex).toBe(1)
    })

    it('should get current question correctly', async () => {
      const { result } = renderHook(() => useQuizSession())

      await act(async () => {
        await result.current.startQuiz('quiz-1')
      })

      const currentQuestion = result.current.getCurrentQuestion()

      expect(currentQuestion).toEqual(mockQuiz.questions[0])
    })

    it('should calculate progress correctly', async () => {
      const { result } = renderHook(() => useQuizSession())

      await act(async () => {
        await result.current.startQuiz('quiz-1')
      })

      act(() => {
        result.current.updateAnswer('q1', ['a2'])
      })

      const progress = result.current.getProgress()

      expect(progress).toEqual({
        current: 1,
        total: 2,
        percentage: 50,
        answered: 1,
      })
    })

    it('should determine if quiz can be submitted', async () => {
      const { result } = renderHook(() => useQuizSession())

      await act(async () => {
        await result.current.startQuiz('quiz-1')
      })

      // Initially cannot submit
      expect(result.current.canSubmit()).toBe(false)

      // Answer first question
      act(() => {
        result.current.updateAnswer('q1', ['a2'])
      })

      // Still cannot submit (need all questions answered)
      expect(result.current.canSubmit()).toBe(false)

      // Answer second question
      act(() => {
        result.current.updateAnswer('q2', ['b2'])
      })

      // Now can submit
      expect(result.current.canSubmit()).toBe(true)
    })
  })

  describe('submitQuiz', () => {
    const mockResult = {
      attemptId: 'attempt-1',
      score: 2,
      totalQuestions: 2,
      correctAnswers: 2,
      timeSpent: 30,
      percentage: 100,
      grade: 'A',
      questionResults: [],
    }

    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuiz),
      })
    })

    it('should submit quiz successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })

      const { result } = renderHook(() => useQuizSession())

      await act(async () => {
        await result.current.startQuiz('quiz-1')
      })

      // Answer all questions
      act(() => {
        result.current.updateAnswer('q1', ['a2'])
        result.current.updateAnswer('q2', ['b2'])
      })

      await act(async () => {
        await result.current.submitQuiz()
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/quiz/quiz-1/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"quizSession"'),
      })

      expect(result.current.result).toEqual(mockResult)
    })

    it('should handle submit errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const { result } = renderHook(() => useQuizSession())

      await act(async () => {
        await result.current.startQuiz('quiz-1')
      })

      await act(async () => {
        await result.current.submitQuiz()
      })

      expect(result.current.error).toBe('Failed to submit quiz')
    })
  })

  describe('resetQuiz', () => {
    it('should reset all state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuiz),
      })

      const { result } = renderHook(() => useQuizSession())

      await act(async () => {
        await result.current.startQuiz('quiz-1')
      })

      act(() => {
        result.current.updateAnswer('q1', ['a2'])
      })

      act(() => {
        result.current.resetQuiz()
      })

      expect(result.current.quiz).toBeNull()
      expect(result.current.session).toBeNull()
      expect(result.current.result).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })
})
