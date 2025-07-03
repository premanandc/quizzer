import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuizInterface } from '@/components/quiz/quiz-interface'

// Mock the useQuizSession hook
vi.mock('@/lib/hooks/use-quiz-session', () => ({
  useQuizSession: () => ({
    quiz: null,
    session: null,
    result: null,
    isLoading: false,
    error: null,
    startQuiz: vi.fn(),
    updateAnswer: vi.fn(),
    nextQuestion: vi.fn(),
    previousQuestion: vi.fn(),
    goToQuestion: vi.fn(),
    submitQuiz: vi.fn(),
    resetQuiz: vi.fn(),
    getCurrentQuestion: vi.fn(),
    getProgress: vi.fn(),
    canSubmit: vi.fn(() => false),
  }),
}))

describe('QuizInterface', () => {
  it('should render start screen initially', () => {
    render(<QuizInterface quizId="test-quiz" />)

    expect(screen.getByText('Ready to Start Quiz?')).toBeInTheDocument()
    expect(screen.getByText('Start Quiz')).toBeInTheDocument()
  })
})
