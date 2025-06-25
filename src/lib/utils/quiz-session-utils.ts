import type { QuizDetails, QuizSession } from '@/lib/types/quiz-session'

export function createSession(quiz: QuizDetails): QuizSession {
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

export function updateSessionAnswer(
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

export function nextQuestion(session: QuizSession): QuizSession {
  const nextIndex = Math.min(session.currentQuestionIndex + 1, session.totalQuestions - 1)
  return {
    ...session,
    currentQuestionIndex: nextIndex,
  }
}

export function previousQuestion(session: QuizSession): QuizSession {
  const prevIndex = Math.max(session.currentQuestionIndex - 1, 0)
  return {
    ...session,
    currentQuestionIndex: prevIndex,
  }
}

export function goToQuestion(session: QuizSession, questionIndex: number): QuizSession {
  const validIndex = Math.max(0, Math.min(questionIndex, session.totalQuestions - 1))
  return {
    ...session,
    currentQuestionIndex: validIndex,
  }
}

export function completeSession(session: QuizSession): QuizSession {
  const endTime = new Date()
  const timeSpent = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000)

  return {
    ...session,
    isCompleted: true,
    timeSpent,
  }
}

export function getSessionProgress(session: QuizSession): {
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

export function canSubmit(session: QuizSession): boolean {
  return Object.keys(session.answers).length === session.totalQuestions
}