import { QuizService } from '@/lib/services/quiz-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserAvatar } from '@/components/auth/user-avatar'
import Link from 'next/link'

const quizService = new QuizService()

export default async function QuizzesPage() {
  const quizzes = await quizService.getAvailableQuizzes()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-3xl font-bold text-gray-900 hover:text-blue-600"
            >
              Quizzer
            </Link>
            <nav className="flex items-center space-x-4">
              <Link
                href="/leaderboard"
                className="text-blue-600 hover:text-blue-800"
              >
                Leaderboard
              </Link>
              <UserAvatar />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Available Quizzes
          </h1>
          <p className="text-xl text-gray-600">
            Choose a quiz to test your knowledge
          </p>
        </div>

        {quizzes.length === 0 ? (
          <Card className="text-center">
            <CardContent className="py-12">
              <p className="text-gray-600 mb-4">No quizzes available yet.</p>
              <p className="text-sm text-gray-500">
                Import quizzes using the CLI:{' '}
                <code>npm run quiz:import path/to/quiz.json</code>
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{quiz.title}</CardTitle>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {quiz.questionCount} questions
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Quiz ID:{' '}
                      <code className="bg-gray-100 px-1 rounded">
                        {quiz.id}
                      </code>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/quiz/${quiz.id}/leaderboard`}>
                        <Button variant="outline" size="sm">
                          Leaderboard
                        </Button>
                      </Link>
                      <Link href={`/quiz/${quiz.id}`}>
                        <Button>Start Quiz</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

export const metadata = {
  title: 'Available Quizzes - Quizzer',
  description: 'Browse and select from available quizzes',
}
