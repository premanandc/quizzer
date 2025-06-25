export interface QuizOption {
  option_id: string
  option_text: string
  is_correct: boolean
  explanation: string
}

export interface QuizQuestion {
  id: string
  question_type: 'single_choice' | 'multiple_choice'
  question_text: string
  options: QuizOption[]
}

export interface Quiz {
  quiz_title: string
  questions: QuizQuestion[]
}

export interface QuizAttempt {
  id: string
  userId: string
  quizId: string
  answers: Record<string, string[]>
  score: number
  totalQuestions: number
  startedAt: Date
  completedAt?: Date
  timeSpent: number
}

export interface QuizResult {
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  questionResults: QuestionResult[]
}

export interface QuestionResult {
  questionId: string
  userAnswers: string[]
  correctAnswers: string[]
  isCorrect: boolean
  explanation: string
}
