import { LeaderboardService } from '@/lib/services/leaderboard-service'
import { QuizService } from '@/lib/services/quiz-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/auth/user-avatar'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

const leaderboardService = new LeaderboardService()
const quizService = new QuizService()

interface QuizLeaderboardPageProps {
  params: Promise<{ id: string }>
}

export default async function QuizLeaderboardPage({
  params,
}: QuizLeaderboardPageProps) {
  const { id } = await params

  const [quiz, leaderboard] = await Promise.all([
    quizService.getQuiz(id),
    leaderboardService.getQuizLeaderboard(id, 50),
  ])

  if (!quiz) {
    notFound()
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-600 bg-yellow-50'
      case 2:
        return 'text-gray-600 bg-gray-50'
      case 3:
        return 'text-amber-600 bg-amber-50'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🏆'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return ''
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

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
                Global Leaderboard
              </Link>
              <UserAvatar />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/quizzes" className="hover:text-blue-600">
              Quizzes
            </Link>
            <span>›</span>
            <Link href={`/quiz/${quiz.id}`} className="hover:text-blue-600">
              {quiz.title}
            </Link>
            <span>›</span>
            <span className="text-gray-900">Leaderboard</span>
          </nav>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {quiz.title}
          </h1>
          <p className="text-xl text-gray-600">Top performers for this quiz</p>
        </div>

        {/* Quiz Actions */}
        <div className="flex gap-4 mb-8">
          <Link href={`/quiz/${quiz.id}`}>
            <Button size="lg">Take This Quiz</Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline" size="lg">
              View Global Leaderboard
            </Button>
          </Link>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Quiz Leaderboard</CardTitle>
            <p className="text-gray-600">
              Ranked by score, then by completion time
            </p>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  No one has completed this quiz yet.
                </p>
                <Link href={`/quiz/${quiz.id}`}>
                  <Button>Be the First!</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={`${entry.userId}-${entry.completedAt.getTime()}`}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      entry.rank <= 3
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getRankColor(entry.rank)}`}
                      >
                        {getRankIcon(entry.rank) || entry.rank}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center space-x-3">
                        {entry.userImage && (
                          <Image
                            src={entry.userImage}
                            alt={entry.userName}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {entry.userName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Completed {entry.completedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 text-right">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {Math.round(entry.score * 100)}%
                        </div>
                        <p className="text-sm text-gray-600">Score</p>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          {formatTime(entry.timeSpent)}
                        </div>
                        <p className="text-sm text-gray-600">Time</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/quizzes">
            <Button variant="outline">← Back to All Quizzes</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

// Make this page dynamic to avoid build-time database calls
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: QuizLeaderboardPageProps) {
  const { id } = await params
  const quiz = await quizService.getQuiz(id)

  if (!quiz) {
    return {
      title: 'Quiz Not Found - Quizzer',
    }
  }

  return {
    title: `${quiz.title} - Leaderboard | Quizzer`,
    description: `View the leaderboard for ${quiz.title} quiz`,
  }
}
