import { prisma } from '@/lib/db'
import { calculateQuizScore, getScoreGrade } from '@/lib/utils/quiz-scorer'
import type {
  QuestionResult,
  QuizAttemptResult,
  QuizDetails,
  QuizSession,
} from '@/lib/types/quiz-session'

export class QuizService {
  async getQuiz(quizId: string): Promise<QuizDetails | null> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId, isActive: true },
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

    if (!quiz) return null

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description ?? undefined,
      isActive: quiz.isActive,
      totalQuestions: quiz.questions.length,
      questions: quiz.questions.map((question) => ({
        id: question.id,
        questionText: question.questionText,
        questionType: question.questionType,
        orderIndex: question.orderIndex,
        options: question.options.map((option) => ({
          id: option.id,
          optionText: option.optionText,
          isCorrect: option.isCorrect,
          explanation: option.explanation ?? '',
          orderIndex: option.orderIndex,
        })),
      })),
    }
  }

  async getAvailableQuizzes(): Promise<
    Array<{ id: string; title: string; questionCount: number }>
  > {
    const quizzes = await prisma.quiz.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      questionCount: quiz._count.questions,
    }))
  }

  createSession(quiz: QuizDetails): QuizSession {
    return {
      quizId: quiz.id,
      quizTitle: quiz.title,
      currentQuestionIndex: 0,
      totalQuestions: quiz.totalQuestions,
      answers: {},
      startTime: new Date(),
      timeSpent: 0,
      isCompleted: false,
    }
  }

  updateSessionAnswer(
    session: QuizSession,
    questionId: string,
    selectedOptions: string[]
  ): QuizSession {
    return {
      ...session,
      answers: {
        ...session.answers,
        [questionId]: selectedOptions,
      },
    }
  }

  nextQuestion(session: QuizSession): QuizSession {
    const nextIndex = Math.min(
      session.currentQuestionIndex + 1,
      session.totalQuestions - 1
    )
    return {
      ...session,
      currentQuestionIndex: nextIndex,
    }
  }

  previousQuestion(session: QuizSession): QuizSession {
    const prevIndex = Math.max(session.currentQuestionIndex - 1, 0)
    return {
      ...session,
      currentQuestionIndex: prevIndex,
    }
  }

  goToQuestion(session: QuizSession, questionIndex: number): QuizSession {
    const validIndex = Math.max(
      0,
      Math.min(questionIndex, session.totalQuestions - 1)
    )
    return {
      ...session,
      currentQuestionIndex: validIndex,
    }
  }

  completeSession(session: QuizSession): QuizSession {
    const endTime = new Date()
    const timeSpent = Math.floor(
      (endTime.getTime() - session.startTime.getTime()) / 1000
    )

    return {
      ...session,
      isCompleted: true,
      timeSpent,
    }
  }

  async submitQuiz(
    session: QuizSession,
    quiz: QuizDetails,
    userId?: string
  ): Promise<QuizAttemptResult> {
    const completedSession = this.completeSession(session)

    // Calculate correct answers from quiz data
    const correctAnswers: Record<string, string[]> = {}
    quiz.questions.forEach((question) => {
      correctAnswers[question.id] = question.options
        .filter((option) => option.isCorrect)
        .map((option) => option.id)
    })

    // Calculate score
    const scoreResult = calculateQuizScore(
      completedSession.answers,
      correctAnswers
    )
    const grade = getScoreGrade(scoreResult.percentage)

    // Create question results
    const questionResults: QuestionResult[] = quiz.questions.map((question) => {
      const userAnswers = completedSession.answers[question.id] || []
      const correctAnswerIds = correctAnswers[question.id] || []
      const isCorrect = this.arraysEqual(
        userAnswers.sort(),
        correctAnswerIds.sort()
      )

      return {
        questionId: question.id,
        questionText: question.questionText,
        userAnswers,
        correctAnswers: correctAnswerIds,
        isCorrect,
        selectedOptions: question.options.filter((opt) =>
          userAnswers.includes(opt.id)
        ),
        allOptions: question.options,
      }
    })

    const result: QuizAttemptResult = {
      attemptId: '', // Will be set after DB save
      score: scoreResult.score,
      totalQuestions: scoreResult.totalQuestions,
      correctAnswers: scoreResult.correctAnswers,
      timeSpent: completedSession.timeSpent,
      percentage: scoreResult.percentage,
      grade,
      questionResults,
    }

    // Save to database if userId provided
    if (userId) {
      const attempt = await this.saveAttempt(completedSession, result, userId)
      result.attemptId = attempt.id
    }

    return result
  }

  private async saveAttempt(
    session: QuizSession,
    result: QuizAttemptResult,
    userId: string
  ) {
    return prisma.$transaction(async (tx) => {
      // Create quiz attempt
      const attempt = await tx.quizAttempt.create({
        data: {
          userId,
          quizId: session.quizId,
          score: result.score,
          totalQuestions: result.totalQuestions,
          startedAt: session.startTime,
          completedAt: new Date(),
          timeSpent: session.timeSpent,
        },
      })

      // Save user answers
      for (const questionResult of result.questionResults) {
        for (const optionId of questionResult.userAnswers) {
          await tx.userAnswer.create({
            data: {
              attemptId: attempt.id,
              questionId: questionResult.questionId,
              optionId,
            },
          })
        }
      }

      return attempt
    })
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false

    // Convert to Sets for order-independent comparison
    const setA = new Set(a)
    const setB = new Set(b)

    // Check if all elements in setA exist in setB and vice versa
    return setA.size === setB.size && [...setA].every((val) => setB.has(val))
  }

  getSessionProgress(session: QuizSession): {
    current: number
    total: number
    percentage: number
    answered: number
  } {
    const answered = Object.keys(session.answers).length
    const percentage = Math.round((answered / session.totalQuestions) * 100)

    return {
      current: session.currentQuestionIndex + 1,
      total: session.totalQuestions,
      percentage,
      answered,
    }
  }

  canSubmit(session: QuizSession): boolean {
    return Object.keys(session.answers).length === session.totalQuestions
  }
}
