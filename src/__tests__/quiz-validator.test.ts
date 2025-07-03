import { describe, it, expect } from 'vitest'
import { QuizValidator } from '@/lib/services/quiz-validator'

describe('QuizValidator', () => {
  const validator = new QuizValidator()

  const validQuiz = {
    quiz_title: 'Test Quiz',
    questions: [
      {
        id: 'Q1',
        question_type: 'single_choice',
        question_text: 'What is 2+2?',
        options: [
          {
            option_id: 'A',
            option_text: '3',
            is_correct: false,
            explanation: 'Incorrect answer',
          },
          {
            option_id: 'B',
            option_text: '4',
            is_correct: true,
            explanation: 'Correct answer',
          },
        ],
      },
    ],
  }

  describe('valid quiz', () => {
    it('should validate a correct quiz', () => {
      const result = validator.validate(validQuiz)
      expect(result).toBe(true)
      expect(validator.getErrors()).toHaveLength(0)
    })
  })

  describe('quiz title validation', () => {
    it('should reject missing quiz title', () => {
      const quiz = { ...validQuiz }
      delete (quiz as Record<string, unknown>).quiz_title

      const result = validator.validate(quiz)
      expect(result).toBe(false)
      expect(validator.getErrors()).toContainEqual({
        field: 'quiz_title',
        message: 'Quiz title is required',
      })
    })

    it('should reject empty quiz title', () => {
      const quiz = { ...validQuiz, quiz_title: '   ' }

      const result = validator.validate(quiz)
      expect(result).toBe(false)
      expect(validator.getErrors()).toContainEqual({
        field: 'quiz_title',
        message: 'Quiz title cannot be empty',
      })
    })

    it('should reject overly long quiz title', () => {
      const quiz = { ...validQuiz, quiz_title: 'x'.repeat(201) }

      const result = validator.validate(quiz)
      expect(result).toBe(false)
      expect(validator.getErrors()).toContainEqual({
        field: 'quiz_title',
        message: 'Quiz title must be 200 characters or less',
      })
    })
  })

  describe('questions validation', () => {
    it('should reject missing questions', () => {
      const quiz = { ...validQuiz }
      delete (quiz as Record<string, unknown>).questions

      const result = validator.validate(quiz)
      expect(result).toBe(false)
      expect(validator.getErrors()).toContainEqual({
        field: 'questions',
        message: 'Questions array is required',
      })
    })

    it('should reject empty questions array', () => {
      const quiz = { ...validQuiz, questions: [] }

      const result = validator.validate(quiz)
      expect(result).toBe(false)
      expect(validator.getErrors()).toContainEqual({
        field: 'questions',
        message: 'At least one question is required',
      })
    })

    it('should reject invalid question type', () => {
      const quiz = {
        ...validQuiz,
        questions: [
          {
            ...validQuiz.questions[0],
            question_type: 'invalid_type',
          },
        ],
      }

      const result = validator.validate(quiz)
      expect(result).toBe(false)
      expect(validator.getErrors()).toContainEqual({
        field: 'questions[0].question_type',
        message: 'Question type must be "single_choice" or "multiple_choice"',
      })
    })
  })

  describe('options validation', () => {
    it('should reject single choice with multiple correct answers', () => {
      const quiz = {
        ...validQuiz,
        questions: [
          {
            ...validQuiz.questions[0],
            options: [
              {
                option_id: 'A',
                option_text: 'Option A',
                is_correct: true,
                explanation: 'Explanation A',
              },
              {
                option_id: 'B',
                option_text: 'Option B',
                is_correct: true,
                explanation: 'Explanation B',
              },
            ],
          },
        ],
      }

      const result = validator.validate(quiz)
      expect(result).toBe(false)
      expect(validator.getErrors()).toContainEqual({
        field: 'questions[0].options',
        message: 'Single choice questions must have exactly one correct option',
      })
    })

    it('should reject multiple choice with no correct answers', () => {
      const quiz = {
        ...validQuiz,
        questions: [
          {
            ...validQuiz.questions[0],
            question_type: 'multiple_choice',
            options: [
              {
                option_id: 'A',
                option_text: 'Option A',
                is_correct: false,
                explanation: 'Explanation A',
              },
              {
                option_id: 'B',
                option_text: 'Option B',
                is_correct: false,
                explanation: 'Explanation B',
              },
            ],
          },
        ],
      }

      const result = validator.validate(quiz)
      expect(result).toBe(false)
      expect(validator.getErrors()).toContainEqual({
        field: 'questions[0].options',
        message:
          'Multiple choice questions must have at least one correct option',
      })
    })

    it('should reject duplicate option IDs', () => {
      const quiz = {
        ...validQuiz,
        questions: [
          {
            ...validQuiz.questions[0],
            options: [
              {
                option_id: 'A',
                option_text: 'Option A',
                is_correct: false,
                explanation: 'Explanation A',
              },
              {
                option_id: 'A',
                option_text: 'Option B',
                is_correct: true,
                explanation: 'Explanation B',
              },
            ],
          },
        ],
      }

      const result = validator.validate(quiz)
      expect(result).toBe(false)
      expect(validator.getErrors()).toContainEqual({
        field: 'questions[0].options',
        message: 'Option IDs must be unique within a question',
      })
    })
  })
})
