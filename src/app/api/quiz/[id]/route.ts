import { NextRequest, NextResponse } from 'next/server'
import { QuizService } from '@/lib/services/quiz-service'

const quizService = new QuizService()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const quiz = await quizService.getQuiz(id)
    
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    )
  }
}