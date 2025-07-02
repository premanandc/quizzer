import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { QuizService } from '@/lib/services/quiz-service'

const quizService = new QuizService()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    const body = await request.json()
    const { quizSession, quiz } = body

    if (!quizSession || !quiz) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      )
    }

    // Validate that URL parameter matches quiz ID in body
    if (quiz.id !== id) {
      return NextResponse.json({ error: 'Quiz ID mismatch' }, { status: 400 })
    }

    // Convert startTime back to a Date object (it gets serialized as string in JSON)
    const sessionWithDate = {
      ...quizSession,
      startTime: new Date(quizSession.startTime),
    }

    const userId = session?.user?.id
    const result = await quizService.submitQuiz(sessionWithDate, quiz, userId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}
