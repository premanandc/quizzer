export interface ScoreResult {
  score: number
  percentage: number
  totalQuestions: number
  correctAnswers: number
}

export function calculateQuizScore(
  userAnswers: Record<string, string[]>,
  correctAnswers: Record<string, string[]>
): ScoreResult {
  if (!userAnswers || !correctAnswers) {
    throw new Error('Both user answers and correct answers must be provided')
  }

  const totalQuestions = Object.keys(correctAnswers).length

  if (totalQuestions === 0) {
    return {
      score: 0,
      percentage: 0,
      totalQuestions: 0,
      correctAnswers: 0,
    }
  }

  let correctCount = 0
  const userAnswersMap = new Map(Object.entries(userAnswers))

  for (const [questionId, correctAnswer] of Object.entries(correctAnswers)) {
    const userAnswer = userAnswersMap.get(questionId) || []

    if (arraysEqual(userAnswer.sort(), correctAnswer.sort())) {
      correctCount++
    }
  }

  const percentage = Math.round((correctCount / totalQuestions) * 100)

  return {
    score: correctCount,
    percentage,
    totalQuestions,
    correctAnswers: correctCount,
  }
}

export function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort())
}

export function getScoreGrade(percentage: number): string {
  if (percentage >= 90) return 'A'
  if (percentage >= 80) return 'B'
  if (percentage >= 70) return 'C'
  if (percentage >= 60) return 'D'
  return 'F'
}
