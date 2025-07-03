export interface ImportQuizOption {
  option_id: string
  option_text: string
  is_correct: boolean
  explanation: string
}

export interface ImportQuizQuestion {
  id: string
  question_type: 'single_choice' | 'multiple_choice'
  question_text: string
  options: ImportQuizOption[]
}

export interface ImportQuiz {
  quiz_title: string
  questions: ImportQuizQuestion[]
}

export interface QuizImportResult {
  success: boolean
  quizId?: string
  message: string
  errors?: string[]
}

export interface QuizValidationError {
  field: string
  message: string
  value?: unknown
}
