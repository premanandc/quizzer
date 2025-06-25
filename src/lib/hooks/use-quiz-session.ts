'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  createSession,
  updateSessionAnswer as updateAnswer,
  nextQuestion as moveToNextQuestion,
  previousQuestion as moveToPreviousQuestion,
  goToQuestion as jumpToQuestion,
  completeSession,
  getSessionProgress,
  canSubmit as canSubmitSession,
} from '@/lib/utils/quiz-session-utils'
import type {
  QuizDetails,
  QuizSession,
  QuizAttemptResult,
} from '@/lib/types/quiz-session'

export function useQuizSession() {
  const { data: _sessionData } = useSession()
  const [quiz, setQuiz] = useState<QuizDetails | null>(null)
  const [session, setSession] = useState<QuizSession | null>(null)
  const [result, setResult] = useState<QuizAttemptResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startQuiz = useCallback(async (quizId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch quiz data from API
      const response = await fetch(`/api/quiz/${quizId}`)
      if (!response.ok) {
        throw new Error(`Quiz with ID "${quizId}" not found`)
      }
      
      const quizData = await response.json()
      setQuiz(quizData)
      const newSession = createSession(quizData)
      setSession(newSession)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateAnswerCallback = useCallback((questionId: string, selectedOptions: string[]) => {
    if (!session) return
    
    const updatedSession = updateAnswer(session, questionId, selectedOptions)
    setSession(updatedSession)
  }, [session])

  const nextQuestion = useCallback(() => {
    if (!session) return
    
    const updatedSession = moveToNextQuestion(session)
    setSession(updatedSession)
  }, [session])

  const previousQuestion = useCallback(() => {
    if (!session) return
    
    const updatedSession = moveToPreviousQuestion(session)
    setSession(updatedSession)
  }, [session])

  const goToQuestion = useCallback((questionIndex: number) => {
    if (!session) return
    
    const updatedSession = jumpToQuestion(session, questionIndex)
    setSession(updatedSession)
  }, [session])

  const submitQuiz = useCallback(async () => {
    if (!session || !quiz) return
    
    setIsLoading(true)
    try {
      const completedSession = completeSession(session)
      
      const response = await fetch(`/api/quiz/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizSession: completedSession,
          quiz,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }
      
      const quizResult = await response.json()
      setResult(quizResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
    } finally {
      setIsLoading(false)
    }
  }, [session, quiz])

  const resetQuiz = useCallback(() => {
    setQuiz(null)
    setSession(null)
    setResult(null)
    setError(null)
  }, [])

  const getCurrentQuestion = useCallback(() => {
    if (!quiz || !session) return null
    return quiz.questions[session.currentQuestionIndex]
  }, [quiz, session])

  const getProgress = useCallback(() => {
    if (!session) return null
    return getSessionProgress(session)
  }, [session])

  const canSubmit = useCallback(() => {
    if (!session) return false
    return canSubmitSession(session)
  }, [session])

  return {
    quiz,
    session,
    result,
    isLoading,
    error,
    startQuiz,
    updateAnswer: updateAnswerCallback,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuiz,
    resetQuiz,
    getCurrentQuestion,
    getProgress,
    canSubmit,
  }
}