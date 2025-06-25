import { describe, it, expect } from 'vitest'
import {
  calculateQuizScore,
  arraysEqual,
  getScoreGrade,
  type ScoreResult,
} from '@/lib/utils/quiz-scorer'

describe('Quiz Scorer', () => {
  describe('calculateQuizScore', () => {
    it('should calculate correct score for perfect answers', () => {
      const userAnswers = {
        q1: ['A'],
        q2: ['B', 'C'],
        q3: ['D'],
      }
      const correctAnswers = {
        q1: ['A'],
        q2: ['B', 'C'],
        q3: ['D'],
      }

      const result = calculateQuizScore(userAnswers, correctAnswers)

      expect(result).toEqual({
        score: 3,
        percentage: 100,
        totalQuestions: 3,
        correctAnswers: 3,
      })
    })

    it('should calculate correct score for partial answers', () => {
      const userAnswers = {
        q1: ['A'],
        q2: ['B'],
        q3: ['D'],
      }
      const correctAnswers = {
        q1: ['A'],
        q2: ['B', 'C'],
        q3: ['E'],
      }

      const result = calculateQuizScore(userAnswers, correctAnswers)

      expect(result).toEqual({
        score: 1,
        percentage: 33,
        totalQuestions: 3,
        correctAnswers: 1,
      })
    })

    it('should handle missing user answers', () => {
      const userAnswers = {
        q1: ['A'],
      }
      const correctAnswers = {
        q1: ['A'],
        q2: ['B', 'C'],
        q3: ['D'],
      }

      const result = calculateQuizScore(userAnswers, correctAnswers)

      expect(result).toEqual({
        score: 1,
        percentage: 33,
        totalQuestions: 3,
        correctAnswers: 1,
      })
    })

    it('should handle empty quiz', () => {
      const userAnswers = {}
      const correctAnswers = {}

      const result = calculateQuizScore(userAnswers, correctAnswers)

      expect(result).toEqual({
        score: 0,
        percentage: 0,
        totalQuestions: 0,
        correctAnswers: 0,
      })
    })

    it('should throw error for null inputs', () => {
      expect(() =>
        calculateQuizScore(null as any, {})
      ).toThrow('Both user answers and correct answers must be provided')

      expect(() =>
        calculateQuizScore({}, null as any)
      ).toThrow('Both user answers and correct answers must be provided')
    })
  })

  describe('arraysEqual', () => {
    it('should return true for equal arrays', () => {
      expect(arraysEqual(['A', 'B'], ['A', 'B'])).toBe(true)
      expect(arraysEqual(['A'], ['A'])).toBe(true)
      expect(arraysEqual([], [])).toBe(true)
    })

    it('should return false for different arrays', () => {
      expect(arraysEqual(['A', 'B'], ['A', 'C'])).toBe(false)
      expect(arraysEqual(['A'], ['A', 'B'])).toBe(false)
      expect(arraysEqual(['A', 'B'], ['A'])).toBe(false)
    })
  })

  describe('getScoreGrade', () => {
    it('should return correct grades', () => {
      expect(getScoreGrade(100)).toBe('A')
      expect(getScoreGrade(95)).toBe('A')
      expect(getScoreGrade(90)).toBe('A')
      expect(getScoreGrade(85)).toBe('B')
      expect(getScoreGrade(80)).toBe('B')
      expect(getScoreGrade(75)).toBe('C')
      expect(getScoreGrade(70)).toBe('C')
      expect(getScoreGrade(65)).toBe('D')
      expect(getScoreGrade(60)).toBe('D')
      expect(getScoreGrade(55)).toBe('F')
      expect(getScoreGrade(0)).toBe('F')
    })
  })
})