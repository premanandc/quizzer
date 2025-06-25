'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { QuizQuestion } from '@/lib/types/quiz-session'

interface QuestionCardProps {
  question: QuizQuestion
  questionNumber: number
  selectedAnswers: string[]
  onAnswerChange: (selectedOptions: string[]) => void
  onNext?: () => void
  onPrevious?: () => void
  showNavigation?: boolean
  isFirstQuestion?: boolean
  isLastQuestion?: boolean
}

export function QuestionCard({
  question,
  questionNumber,
  selectedAnswers,
  onAnswerChange,
  onNext,
  onPrevious,
  showNavigation = true,
  isFirstQuestion = false,
  isLastQuestion = false,
}: QuestionCardProps) {
  const isSingleChoice = question.questionType === 'SINGLE_CHOICE'

  const handleOptionSelect = (optionId: string) => {
    if (isSingleChoice) {
      onAnswerChange([optionId])
    } else {
      const currentAnswers = [...selectedAnswers]
      const optionIndex = currentAnswers.indexOf(optionId)
      
      if (optionIndex === -1) {
        currentAnswers.push(optionId)
      } else {
        currentAnswers.splice(optionIndex, 1)
      }
      
      onAnswerChange(currentAnswers)
    }
  }

  const isOptionSelected = (optionId: string) => selectedAnswers.includes(optionId)

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            Question {questionNumber}
          </CardTitle>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {isSingleChoice ? 'Single Choice' : 'Multiple Choice'}
          </span>
        </div>
        <p className="text-lg text-gray-700 mt-4">{question.questionText}</p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = isOptionSelected(option.id)
            
            return (
              <label
                key={option.id}
                className={`
                  flex items-center p-4 border rounded-lg cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type={isSingleChoice ? 'radio' : 'checkbox'}
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => handleOptionSelect(option.id)}
                  className={`
                    w-4 h-4 mr-3
                    ${isSingleChoice 
                      ? 'text-blue-600' 
                      : 'text-blue-600 rounded'
                    }
                  `}
                />
                <span className="flex-1 text-gray-700">{option.optionText}</span>
              </label>
            )
          })}
        </div>

        {selectedAnswers.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700">
              {isSingleChoice 
                ? '✓ Answer selected' 
                : `✓ ${selectedAnswers.length} answer${selectedAnswers.length > 1 ? 's' : ''} selected`
              }
            </p>
          </div>
        )}

        {showNavigation && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isFirstQuestion}
            >
              Previous
            </Button>
            
            <Button
              onClick={onNext}
              disabled={selectedAnswers.length === 0}
            >
              {isLastQuestion ? 'Submit Quiz' : 'Next'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}