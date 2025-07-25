import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QuizService } from '@/lib/services/quiz-service'
import { prisma } from '@/lib/db'

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    quiz: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    quizAttempt: {
      create: vi.fn(),
    },
    userAnswer: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

const mockPrisma = vi.mocked(prisma, true)

describe('QuizService', () => {
  let quizService: QuizService

  beforeEach(() => {
    quizService = new QuizService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getQuiz', () => {
    const mockQuizData = {
      id: 'quiz-1',
      title: 'Test Quiz',
      description: 'A test quiz',
      isActive: true,
      questions: [
        {
          id: 'q1',
          questionText: 'What is 2+2?',
          questionType: 'SINGLE_CHOICE',
          orderIndex: 0,
          options: [
            {
              id: 'a1',
              optionText: '3',
              isCorrect: false,
              explanation: 'Wrong answer',
              orderIndex: 0,
            },
            {
              id: 'a2',
              optionText: '4',
              isCorrect: true,
              explanation: 'Correct answer',
              orderIndex: 1,
            },
          ],
        },
      ],
    }

    it('should return quiz data for valid active quiz', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue(mockQuizData as any)

      const result = await quizService.getQuiz('quiz-1')

      expect(result).toEqual({
        id: 'quiz-1',
        title: 'Test Quiz',
        description: 'A test quiz',
        isActive: true,
        totalQuestions: 1,
        questions: [
          {
            id: 'q1',
            questionText: 'What is 2+2?',
            questionType: 'SINGLE_CHOICE',
            orderIndex: 0,
            options: [
              {
                id: 'a1',
                optionText: '3',
                isCorrect: false,
                explanation: 'Wrong answer',
                orderIndex: 0,
              },
              {
                id: 'a2',
                optionText: '4',
                isCorrect: true,
                explanation: 'Correct answer',
                orderIndex: 1,
              },
            ],
          },
        ],
      })

      expect(mockPrisma.quiz.findUnique).toHaveBeenCalledWith({
        where: { id: 'quiz-1', isActive: true },
        include: {
          questions: {
            include: {
              options: {
                orderBy: { orderIndex: 'asc' },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      })
    })

    it('should return null for non-existent quiz', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue(null as any)

      const result = await quizService.getQuiz('non-existent')

      expect(result).toBeNull()
    })

    it('should handle quiz with null description', async () => {
      const quizWithNullDescription = {
        ...mockQuizData,
        description: null,
      }
      mockPrisma.quiz.findUnique.mockResolvedValue(
        quizWithNullDescription as any
      )

      const result = await quizService.getQuiz('quiz-1')

      expect(result?.description).toBeUndefined()
    })

    it('should handle empty explanation in options', async () => {
      const quizWithEmptyExplanation = {
        ...mockQuizData,
        questions: [
          {
            ...mockQuizData.questions[0],
            options: [
              {
                ...mockQuizData.questions[0].options[0],
                explanation: null,
              },
            ],
          },
        ],
      }
      mockPrisma.quiz.findUnique.mockResolvedValue(
        quizWithEmptyExplanation as any
      )

      const result = await quizService.getQuiz('quiz-1')

      expect(result?.questions[0].options[0].explanation).toBe('')
    })
  })

  describe('getAvailableQuizzes', () => {
    it('should return list of active quizzes with question counts', async () => {
      const mockQuizzes = [
        {
          id: 'quiz-1',
          title: 'Quiz 1',
          createdAt: new Date('2023-01-01'),
          _count: { questions: 5 },
        },
        {
          id: 'quiz-2',
          title: 'Quiz 2',
          createdAt: new Date('2023-01-02'),
          _count: { questions: 3 },
        },
      ]

      mockPrisma.quiz.findMany.mockResolvedValue(mockQuizzes as any)

      const result = await quizService.getAvailableQuizzes()

      expect(result).toEqual([
        { id: 'quiz-1', title: 'Quiz 1', questionCount: 5 },
        { id: 'quiz-2', title: 'Quiz 2', questionCount: 3 },
      ])

      expect(mockPrisma.quiz.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          _count: {
            select: { questions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should return empty array when no quizzes exist', async () => {
      mockPrisma.quiz.findMany.mockResolvedValue([] as any)

      const result = await quizService.getAvailableQuizzes()

      expect(result).toEqual([])
    })
  })

  describe('createSession', () => {
    const mockQuiz = {
      id: 'quiz-1',
      title: 'Test Quiz',
      description: 'A test quiz',
      isActive: true,
      totalQuestions: 2,
      questions: [],
    }

    it('should create a new quiz session', () => {
      const result = quizService.createSession(mockQuiz)

      expect(result).toEqual({
        quizId: 'quiz-1',
        quizTitle: 'Test Quiz',
        currentQuestionIndex: 0,
        totalQuestions: 2,
        answers: {},
        startTime: expect.any(Date),
        timeSpent: 0,
        isCompleted: false,
      })
    })
  })

  describe('updateSessionAnswer', () => {
    const mockSession = {
      quizId: 'quiz-1',
      quizTitle: 'Test Quiz',
      currentQuestionIndex: 0,
      totalQuestions: 2,
      answers: {},
      startTime: new Date(),
      timeSpent: 0,
      isCompleted: false,
    }

    it('should update session with new answer', () => {
      const result = quizService.updateSessionAnswer(mockSession, 'q1', ['a1'])

      expect(result).toEqual({
        ...mockSession,
        answers: { q1: ['a1'] },
      })
    })

    it('should update existing answer', () => {
      const sessionWithAnswer = {
        ...mockSession,
        answers: { q1: ['a1'] },
      }

      const result = quizService.updateSessionAnswer(sessionWithAnswer, 'q1', [
        'a2',
      ])

      expect(result).toEqual({
        ...sessionWithAnswer,
        answers: { q1: ['a2'] },
      })
    })

    it('should handle multiple answers', () => {
      const result = quizService.updateSessionAnswer(mockSession, 'q1', [
        'a1',
        'a2',
      ])

      expect(result).toEqual({
        ...mockSession,
        answers: { q1: ['a1', 'a2'] },
      })
    })
  })

  describe('navigation methods', () => {
    const mockSession = {
      quizId: 'quiz-1',
      quizTitle: 'Test Quiz',
      currentQuestionIndex: 1,
      totalQuestions: 3,
      answers: {},
      startTime: new Date(),
      timeSpent: 0,
      isCompleted: false,
    }

    describe('nextQuestion', () => {
      it('should move to next question', () => {
        const result = quizService.nextQuestion(mockSession)
        expect(result.currentQuestionIndex).toBe(2)
      })

      it('should not go beyond last question', () => {
        const lastQuestionSession = { ...mockSession, currentQuestionIndex: 2 }
        const result = quizService.nextQuestion(lastQuestionSession)
        expect(result.currentQuestionIndex).toBe(2)
      })
    })

    describe('previousQuestion', () => {
      it('should move to previous question', () => {
        const result = quizService.previousQuestion(mockSession)
        expect(result.currentQuestionIndex).toBe(0)
      })

      it('should not go before first question', () => {
        const firstQuestionSession = { ...mockSession, currentQuestionIndex: 0 }
        const result = quizService.previousQuestion(firstQuestionSession)
        expect(result.currentQuestionIndex).toBe(0)
      })
    })

    describe('goToQuestion', () => {
      it('should go to specific question index', () => {
        const result = quizService.goToQuestion(mockSession, 0)
        expect(result.currentQuestionIndex).toBe(0)
      })

      it('should clamp to valid range when index too high', () => {
        const result = quizService.goToQuestion(mockSession, 10)
        expect(result.currentQuestionIndex).toBe(2)
      })

      it('should clamp to valid range when index negative', () => {
        const result = quizService.goToQuestion(mockSession, -1)
        expect(result.currentQuestionIndex).toBe(0)
      })
    })
  })

  describe('submitQuiz', () => {
    const mockSession = {
      quizId: 'quiz-1',
      quizTitle: 'Test Quiz',
      currentQuestionIndex: 0,
      totalQuestions: 1,
      answers: { q1: ['a2'] },
      startTime: new Date(Date.now() - 30000), // 30 seconds ago
      timeSpent: 0,
      isCompleted: false,
    }

    const mockQuiz = {
      id: 'quiz-1',
      title: 'Test Quiz',
      description: 'A test quiz',
      isActive: true,
      totalQuestions: 1,
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
      ],
    }

    it('should submit quiz and calculate score correctly', async () => {
      const mockAttempt: any = { id: 'attempt-1' }
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.quizAttempt.create.mockResolvedValue(mockAttempt)
        return callback(mockPrisma)
      })

      const result = await quizService.submitQuiz(
        mockSession,
        mockQuiz,
        'user-1'
      )

      expect(result).toEqual({
        attemptId: 'attempt-1',
        score: 1,
        totalQuestions: 1,
        correctAnswers: 1,
        timeSpent: expect.any(Number),
        percentage: 100,
        grade: 'A',
        questionResults: [
          {
            questionId: 'q1',
            questionText: 'What is 2+2?',
            userAnswers: ['a2'],
            correctAnswers: ['a2'],
            isCorrect: true,
            selectedOptions: [
              {
                id: 'a2',
                optionText: '4',
                isCorrect: true,
                explanation: 'Correct',
                orderIndex: 1,
              },
            ],
            allOptions: mockQuiz.questions[0].options,
          },
        ],
      })
    })

    it('should submit quiz without saving when no userId provided', async () => {
      const result = await quizService.submitQuiz(mockSession, mockQuiz)

      expect(result.attemptId).toBe('')
      expect(mockPrisma.$transaction).not.toHaveBeenCalled()
    })

    it('should handle incorrect answers', async () => {
      const incorrectSession = {
        ...mockSession,
        answers: { q1: ['a1'] },
      }

      const result = await quizService.submitQuiz(incorrectSession, mockQuiz)

      expect(result.score).toBe(0)
      expect(result.percentage).toBe(0)
      expect(result.grade).toBe('F')
      expect(result.questionResults[0].isCorrect).toBe(false)
    })

    it('should handle multiple correct answers', async () => {
      const multipleChoiceQuiz = {
        ...mockQuiz,
        questions: [
          {
            ...mockQuiz.questions[0],
            questionType: 'MULTIPLE_CHOICE' as const,
            options: [
              {
                id: 'a1',
                optionText: 'A',
                isCorrect: true,
                explanation: '',
                orderIndex: 0,
              },
              {
                id: 'a2',
                optionText: 'B',
                isCorrect: true,
                explanation: '',
                orderIndex: 1,
              },
              {
                id: 'a3',
                optionText: 'C',
                isCorrect: false,
                explanation: '',
                orderIndex: 2,
              },
            ],
          },
        ],
      }

      const multipleAnswerSession = {
        ...mockSession,
        answers: { q1: ['a1', 'a2'] },
      }

      const result = await quizService.submitQuiz(
        multipleAnswerSession,
        multipleChoiceQuiz
      )

      expect(result.score).toBe(1)
      expect(result.questionResults[0].isCorrect).toBe(true)
    })

    it('should handle missing answers', async () => {
      const noAnswerSession = {
        ...mockSession,
        answers: {},
      }

      const result = await quizService.submitQuiz(noAnswerSession, mockQuiz)

      expect(result.score).toBe(0)
      expect(result.questionResults[0].userAnswers).toEqual([])
      expect(result.questionResults[0].isCorrect).toBe(false)
    })
  })
})
