export interface QuizSession {
  quizId: string
  quizTitle: string
  currentQuestionIndex: number
  totalQuestions: number
  answers: Record<string, string[]>
  startTime: Date
  timeSpent: number
  isCompleted: boolean
}

export interface QuizQuestion {
  id: string
  questionText: string
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'
  orderIndex: number
  options: QuizOption[]
}

export interface QuizOption {
  id: string
  optionText: string
  isCorrect: boolean
  explanation: string
  orderIndex: number
}

export interface QuizDetails {
  id: string
  title: string
  description?: string
  isActive: boolean
  questions: QuizQuestion[]
  totalQuestions: number
}

export interface QuizAttemptResult {
  attemptId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  percentage: number
  grade: string
  questionResults: QuestionResult[]
}

export interface QuestionResult {
  questionId: string
  questionText: string
  userAnswers: string[]
  correctAnswers: string[]
  isCorrect: boolean
  selectedOptions: QuizOption[]
  allOptions: QuizOption[]
}
