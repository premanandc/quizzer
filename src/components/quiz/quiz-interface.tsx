'use client'

import { useQuizSession } from '@/lib/hooks/use-quiz-session'
import { QuestionCard } from './question-card'
import { ProgressBar } from './progress-bar'
import { QuizResults } from './quiz-results'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QuizInterfaceProps {
  quizId: string
}

export function QuizInterface({ quizId }: QuizInterfaceProps) {
  const {
    quiz,
    session,
    result,
    isLoading,
    error,
    startQuiz,
    updateAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuiz,
    resetQuiz,
    getCurrentQuestion,
    getProgress,
    canSubmit,
  } = useQuizSession()

  // Initial state - show start screen
  if (!quiz && !isLoading && !error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Ready to Start Quiz?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Click the button below to begin your quiz. Make sure you have enough time to complete it.
          </p>
          <Button onClick={() => startQuiz(quizId)} size="lg">
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold">Error</h3>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={resetQuiz} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Results state
  if (result) {
    return <QuizResults result={result} quizId={quizId} onRetake={resetQuiz} />
  }

  // Quiz in progress
  if (quiz && session) {
    const currentQuestion = getCurrentQuestion()
    const progress = getProgress()
    
    if (!currentQuestion || !progress) {
      return <div>Something went wrong</div>
    }

    const currentAnswers = session.answers[currentQuestion.id] || []
    const isFirstQuestion = session.currentQuestionIndex === 0
    const isLastQuestion = session.currentQuestionIndex === quiz.totalQuestions - 1

    const handleNext = () => {
      if (isLastQuestion && canSubmit()) {
        submitQuiz()
      } else {
        nextQuestion()
      }
    }

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Quiz Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              <div className="text-sm text-gray-500">
                Quiz ID: {quiz.id}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ProgressBar
              current={progress.current}
              total={progress.total}
              answered={progress.answered}
            />
          </CardContent>
        </Card>

        {/* Question */}
        <QuestionCard
          question={currentQuestion}
          questionNumber={progress.current}
          selectedAnswers={currentAnswers}
          onAnswerChange={(answers) => updateAnswer(currentQuestion.id, answers)}
          onNext={handleNext}
          onPrevious={previousQuestion}
          isFirstQuestion={isFirstQuestion}
          isLastQuestion={isLastQuestion}
        />

        {/* Question Navigation */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 mr-2">Jump to question:</span>
              {quiz.questions.map((_, index) => {
                const questionId = quiz.questions[index].id
                const isAnswered = session.answers[questionId]?.length > 0
                const isCurrent = index === session.currentQuestionIndex
                
                return (
                  <Button
                    key={index}
                    variant={isCurrent ? 'primary' : isAnswered ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => goToQuestion(index)}
                    className="w-10 h-10"
                  >
                    {index + 1}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        {canSubmit() && (
          <Card>
            <CardContent className="text-center py-6">
              <p className="text-gray-600 mb-4">
                You&apos;ve answered all questions! Ready to submit?
              </p>
              <Button onClick={submitQuiz} size="lg">
                Submit Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return null
}