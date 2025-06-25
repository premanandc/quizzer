import { prisma } from '@/lib/database'
import { QuizValidator } from './quiz-validator'
import type { ImportQuiz, QuizImportResult } from '@/lib/types/quiz-import'

export class QuizImporter {
  private validator = new QuizValidator()

  async importQuiz(jsonData: string): Promise<QuizImportResult> {
    try {
      // Parse JSON
      let parsedData: unknown
      try {
        parsedData = JSON.parse(jsonData)
      } catch (error) {
        return {
          success: false,
          message: 'Invalid JSON format',
          errors: [error instanceof Error ? error.message : 'JSON parsing failed'],
        }
      }

      // Validate structure
      if (!this.validator.validate(parsedData)) {
        return {
          success: false,
          message: 'Quiz validation failed',
          errors: this.validator.getErrors().map(err => `${err.field}: ${err.message}`),
        }
      }

      const quiz = parsedData as ImportQuiz

      // Import to database
      const quizId = await this.saveToDatabase(quiz)

      return {
        success: true,
        quizId,
        message: `Quiz "${quiz.quiz_title}" imported successfully with ${quiz.questions.length} questions`,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Import failed',
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      }
    }
  }

  private async saveToDatabase(quiz: ImportQuiz): Promise<string> {
    return await prisma.$transaction(async (tx) => {
      // Create quiz
      const createdQuiz = await tx.quiz.create({
        data: {
          title: quiz.quiz_title,
          isActive: true,
        },
      })

      // Create questions and options
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i]
        
        const createdQuestion = await tx.quizQuestion.create({
          data: {
            quizId: createdQuiz.id,
            questionText: question.question_text,
            questionType: question.question_type === 'single_choice' ? 'SINGLE_CHOICE' : 'MULTIPLE_CHOICE',
            orderIndex: i,
          },
        })

        // Create options
        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j]
          
          await tx.quizOption.create({
            data: {
              questionId: createdQuestion.id,
              optionText: option.option_text,
              isCorrect: option.is_correct,
              explanation: option.explanation,
              orderIndex: j,
            },
          })
        }
      }

      return createdQuiz.id
    })
  }

  async listQuizzes(): Promise<Array<{ id: string; title: string; questionCount: number; createdAt: Date }>> {
    const quizzes = await prisma.quiz.findMany({
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      questionCount: quiz._count.questions,
      createdAt: quiz.createdAt,
    }))
  }

  async exportQuiz(quizId: string): Promise<ImportQuiz | null> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!quiz) return null

    return {
      quiz_title: quiz.title,
      questions: quiz.questions.map(question => ({
        id: `Q${question.orderIndex + 1}`,
        question_type: question.questionType === 'SINGLE_CHOICE' ? 'single_choice' : 'multiple_choice',
        question_text: question.questionText,
        options: question.options.map(option => ({
          option_id: String.fromCharCode(65 + option.orderIndex), // A, B, C, D...
          option_text: option.optionText,
          is_correct: option.isCorrect,
          explanation: option.explanation ?? '',
        })),
      })),
    }
  }
}