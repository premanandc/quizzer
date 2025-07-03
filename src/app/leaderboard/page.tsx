import { LeaderboardService } from '@/lib/services/leaderboard-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserAvatar } from '@/components/auth/user-avatar'
import Link from 'next/link'
import Image from 'next/image'

const leaderboardService = new LeaderboardService()

export default async function LeaderboardPage() {
  const [leaderboard, stats] = await Promise.all([
    leaderboardService.getGlobalLeaderboard(50),
    leaderboardService.getLeaderboardStats(),
  ])

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
                href="/quizzes"
                className="text-blue-600 hover:text-blue-800"
              >
                Browse Quizzes
              </Link>
              <UserAvatar />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Global Leaderboard
          </h1>
          <p className="text-xl text-gray-600">
            See how you rank against other quiz takers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalUsers.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalQuizzes.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalAttempts.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(stats.averageScore * 100)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Top Performers</CardTitle>
            <p className="text-gray-600">
              Ranked by average score, total quizzes, and best performance
            </p>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No quiz attempts yet.</p>
                <Link
                  href="/quizzes"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Be the first to take a quiz!
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
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
                            {entry.totalQuizzes} quiz
                            {entry.totalQuizzes !== 1 ? 'es' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 text-right">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {Math.round(entry.averageScore * 100)}%
                        </div>
                        <p className="text-sm text-gray-600">Avg Score</p>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          {Math.round(entry.bestScore * 100)}%
                        </div>
                        <p className="text-sm text-gray-600">Best Score</p>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-600">
                          {Math.floor(entry.totalTimeSpent / 60)}m
                        </div>
                        <p className="text-sm text-gray-600">Total Time</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-x-4">
          <Link href="/quizzes" className="inline-block">
            <Card className="inline-block p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="text-center">
                <h3 className="font-bold text-lg mb-2">Take a Quiz</h3>
                <p className="text-gray-600">
                  Improve your ranking by taking more quizzes
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}

export const metadata = {
  title: 'Leaderboard - Quizzer',
  description: 'Global leaderboard showing top quiz performers',
}

// Make this page dynamic to avoid build-time database calls
export const dynamic = 'force-dynamic'
