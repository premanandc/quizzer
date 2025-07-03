import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserAvatar } from '@/components/auth/user-avatar'
import Link from 'next/link'
import { redirect } from 'next/navigation'

async function getUserStats(userId: string) {
  const [attempts, totalAttempts, avgScore] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          select: { title: true },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
    }),
    prisma.quizAttempt.count({
      where: { userId },
    }),
    prisma.quizAttempt.aggregate({
      where: { userId },
      _avg: { score: true },
    }),
  ])

  return {
    recentAttempts: attempts,
    totalAttempts,
    averageScore: avgScore._avg.score || 0,
  }
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const stats = await getUserStats(session.user.id!)

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Profile
          </h1>
          <p className="text-xl text-gray-600">
            Track your quiz performance and progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.totalAttempts}
              </div>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {Math.round(stats.averageScore * 100)}%
              </div>
              <p className="text-sm text-gray-600">Across all quizzes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Best Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats.recentAttempts.length > 0
                  ? Math.round(
                      Math.max(...stats.recentAttempts.map((a) => a.score)) *
                        100
                    )
                  : 0}
                %
              </div>
              <p className="text-sm text-gray-600">Personal best</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Quiz Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentAttempts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No quiz attempts yet.</p>
                <Link href="/quizzes">
                  <Button>Take Your First Quiz</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{attempt.quiz.title}</h3>
                      <p className="text-sm text-gray-600">
                        Completed on {attempt.completedAt?.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {Math.round(attempt.score * 100)}%
                      </div>
                      <p className="text-sm text-gray-600">
                        {Math.floor(attempt.timeSpent / 60)}m{' '}
                        {attempt.timeSpent % 60}s
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/quizzes">
            <Button size="lg">Browse More Quizzes</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

export const metadata = {
  title: 'Profile - Quizzer',
  description: 'View your quiz performance and statistics',
}

// Make this page dynamic to avoid build-time database calls
export const dynamic = 'force-dynamic'
