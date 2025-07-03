import { QuizInterface } from '@/components/quiz/quiz-interface'

interface QuizPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <QuizInterface quizId={id} />
    </div>
  )
}

export async function generateMetadata({ params }: QuizPageProps) {
  const { id } = await params

  return {
    title: `Quiz ${id} - Quizzer`,
    description: 'Take an interactive quiz and test your knowledge',
  }
}
