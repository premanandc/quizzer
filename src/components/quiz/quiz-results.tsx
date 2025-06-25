'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import type { QuizAttemptResult, QuestionResult } from '@/lib/types/quiz-session'

interface QuizResultsProps {
  result: QuizAttemptResult
  quizId: string
  onRetake: () => void
}

export function QuizResults({ result, quizId, onRetake }: QuizResultsProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100'
      case 'B': return 'text-blue-600 bg-blue-100'
      case 'C': return 'text-yellow-600 bg-yellow-100'
      case 'D': return 'text-orange-600 bg-orange-100'
      case 'F': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Results Summary */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">Quiz Complete!</CardTitle>
          <div className="flex items-center justify-center space-x-4">
            <div className={`text-4xl font-bold ${getScoreColor(result.percentage)}`}>
              {result.percentage}%
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold ${getGradeColor(result.grade)}`}>
              Grade: {result.grade}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{result.correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">
                {result.totalQuestions - result.correctAnswers}
              </div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{result.totalQuestions}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{formatTime(result.timeSpent)}</div>
              <div className="text-sm text-gray-600">Time</div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center space-x-4">
            <Button onClick={onRetake} variant="outline">
              Retake Quiz
            </Button>
            <Link href={`/quiz/${quizId}/leaderboard`}>
              <Button variant="secondary">
                View Leaderboard
              </Button>
            </Link>
            <Button onClick={() => window.print()} variant="ghost">
              Print Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question-by-Question Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.questionResults.map((questionResult, index) => (
            <QuestionResultCard 
              key={questionResult.questionId} 
              questionResult={questionResult} 
              questionNumber={index + 1}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

interface QuestionResultCardProps {
  questionResult: QuestionResult
  questionNumber: number
}

function QuestionResultCard({ questionResult, questionNumber }: QuestionResultCardProps) {
  const { 
    questionText, 
    isCorrect, 
    selectedOptions, 
    allOptions 
  } = questionResult

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-lg">
          Question {questionNumber}
        </h4>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isCorrect 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isCorrect ? '✓ Correct' : '✗ Incorrect'}
        </div>
      </div>
      
      <p className="text-gray-700 mb-4">{questionText}</p>
      
      <div className="space-y-2">
        {allOptions.map((option) => {
          const isSelected = selectedOptions.some(selected => selected.id === option.id)
          const isCorrectOption = option.isCorrect
          
          let optionClass = 'p-3 rounded border '
          
          if (isSelected && isCorrectOption) {
            optionClass += 'bg-green-50 border-green-300 text-green-800'
          } else if (isSelected && !isCorrectOption) {
            optionClass += 'bg-red-50 border-red-300 text-red-800'
          } else if (!isSelected && isCorrectOption) {
            optionClass += 'bg-green-50 border-green-200 text-green-700'
          } else {
            optionClass += 'bg-gray-50 border-gray-200 text-gray-600'
          }
          
          return (
            <div key={option.id} className={optionClass}>
              <div className="flex items-center justify-between">
                <span className="flex-1">{option.optionText}</span>
                <div className="flex items-center space-x-2">
                  {isSelected && (
                    <span className="text-sm font-medium">Your answer</span>
                  )}
                  {isCorrectOption && (
                    <span className="text-sm font-medium text-green-600">✓ Correct</span>
                  )}
                </div>
              </div>
              {(isSelected || isCorrectOption) && option.explanation && (
                <div className="mt-2 text-sm opacity-75">
                  <strong>Explanation:</strong> {option.explanation}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}