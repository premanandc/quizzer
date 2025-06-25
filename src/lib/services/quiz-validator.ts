import type { ImportQuiz, QuizValidationError } from '@/lib/types/quiz-import'

export class QuizValidator {
  private errors: QuizValidationError[] = []

  validate(quiz: unknown): quiz is ImportQuiz {
    this.errors = []

    if (!this.isObject(quiz)) {
      this.addError('quiz', 'Quiz must be an object')
      return false
    }

    this.validateQuizTitle(quiz)
    this.validateQuestions(quiz)

    return this.errors.length === 0
  }

  getErrors(): QuizValidationError[] {
    return this.errors
  }

  private validateQuizTitle(quiz: Record<string, unknown>) {
    if (!quiz.quiz_title) {
      this.addError('quiz_title', 'Quiz title is required')
      return
    }

    if (typeof quiz.quiz_title !== 'string') {
      this.addError('quiz_title', 'Quiz title must be a string', quiz.quiz_title)
      return
    }

    if (quiz.quiz_title.trim().length === 0) {
      this.addError('quiz_title', 'Quiz title cannot be empty')
    }

    if (quiz.quiz_title.length > 200) {
      this.addError('quiz_title', 'Quiz title must be 200 characters or less')
    }
  }

  private validateQuestions(quiz: Record<string, unknown>) {
    if (!quiz.questions) {
      this.addError('questions', 'Questions array is required')
      return
    }

    if (!Array.isArray(quiz.questions)) {
      this.addError('questions', 'Questions must be an array', quiz.questions)
      return
    }

    if (quiz.questions.length === 0) {
      this.addError('questions', 'At least one question is required')
      return
    }

    if (quiz.questions.length > 100) {
      this.addError('questions', 'Maximum 100 questions allowed')
    }

    quiz.questions.forEach((question, index) => {
      this.validateQuestion(question, index)
    })
  }

  private validateQuestion(question: unknown, index: number) {
    if (!this.isObject(question)) {
      this.addError(`questions[${index}]`, 'Question must be an object')
      return
    }

    const q = question as Record<string, unknown>

    // Validate question ID
    if (!q.id || typeof q.id !== 'string') {
      this.addError(`questions[${index}].id`, 'Question ID is required and must be a string')
    }

    // Validate question type
    if (!q.question_type || !['single_choice', 'multiple_choice'].includes(q.question_type as string)) {
      this.addError(`questions[${index}].question_type`, 'Question type must be "single_choice" or "multiple_choice"')
    }

    // Validate question text
    if (!q.question_text || typeof q.question_text !== 'string') {
      this.addError(`questions[${index}].question_text`, 'Question text is required and must be a string')
    } else if (q.question_text.trim().length === 0) {
      this.addError(`questions[${index}].question_text`, 'Question text cannot be empty')
    }

    // Validate options
    this.validateOptions(q.options, index, q.question_type as string)
  }

  private validateOptions(options: unknown, questionIndex: number, questionType: string) {
    if (!Array.isArray(options)) {
      this.addError(`questions[${questionIndex}].options`, 'Options must be an array')
      return
    }

    if (options.length < 2) {
      this.addError(`questions[${questionIndex}].options`, 'At least 2 options are required')
      return
    }

    if (options.length > 6) {
      this.addError(`questions[${questionIndex}].options`, 'Maximum 6 options allowed')
    }

    const correctOptions = options.filter((opt: any) => opt?.is_correct === true)
    
    if (questionType === 'single_choice' && correctOptions.length !== 1) {
      this.addError(`questions[${questionIndex}].options`, 'Single choice questions must have exactly one correct option')
    }

    if (questionType === 'multiple_choice' && correctOptions.length < 1) {
      this.addError(`questions[${questionIndex}].options`, 'Multiple choice questions must have at least one correct option')
    }

    options.forEach((option, optionIndex) => {
      this.validateOption(option, questionIndex, optionIndex)
    })

    // Check for duplicate option IDs
    const optionIds = options.map((opt: any) => opt?.option_id).filter(Boolean)
    const uniqueIds = new Set(optionIds)
    if (optionIds.length !== uniqueIds.size) {
      this.addError(`questions[${questionIndex}].options`, 'Option IDs must be unique within a question')
    }
  }

  private validateOption(option: unknown, questionIndex: number, optionIndex: number) {
    if (!this.isObject(option)) {
      this.addError(`questions[${questionIndex}].options[${optionIndex}]`, 'Option must be an object')
      return
    }

    const opt = option as Record<string, unknown>
    const prefix = `questions[${questionIndex}].options[${optionIndex}]`

    if (!opt.option_id || typeof opt.option_id !== 'string') {
      this.addError(`${prefix}.option_id`, 'Option ID is required and must be a string')
    }

    if (!opt.option_text || typeof opt.option_text !== 'string') {
      this.addError(`${prefix}.option_text`, 'Option text is required and must be a string')
    } else if (opt.option_text.trim().length === 0) {
      this.addError(`${prefix}.option_text`, 'Option text cannot be empty')
    }

    if (typeof opt.is_correct !== 'boolean') {
      this.addError(`${prefix}.is_correct`, 'is_correct must be a boolean')
    }

    if (!opt.explanation || typeof opt.explanation !== 'string') {
      this.addError(`${prefix}.explanation`, 'Explanation is required and must be a string')
    } else if (opt.explanation.trim().length === 0) {
      this.addError(`${prefix}.explanation`, 'Explanation cannot be empty')
    }
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  }

  private addError(field: string, message: string, value?: unknown) {
    this.errors.push({ field, message, value })
  }
}