import { prisma } from '@/lib/db'

export interface LeaderboardEntry {
  userId: string
  userName: string
  userImage?: string
  totalQuizzes: number
  averageScore: number
  bestScore: number
  totalTimeSpent: number
  lastAttempt: Date
  rank: number
}

export interface QuizLeaderboardEntry {
  userId: string
  userName: string
  userImage?: string
  score: number
  timeSpent: number
  completedAt: Date
  rank: number
}

export class LeaderboardService {
  async getGlobalLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    const userStats = await prisma.user.findMany({
      where: {
        quizAttempts: {
          some: {}
        }
      },
      select: {
        id: true,
        name: true,
        image: true,
        quizAttempts: {
          select: {
            score: true,
            timeSpent: true,
            completedAt: true,
          },
          where: {
            completedAt: {
              not: null
            }
          }
        }
      }
    })

    const leaderboardData = userStats
      .map(user => {
        const attempts = user.quizAttempts
        if (attempts.length === 0) return null

        const totalQuizzes = attempts.length
        const averageScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalQuizzes
        const bestScore = Math.max(...attempts.map(attempt => attempt.score))
        const totalTimeSpent = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0)
        const lastAttempt = new Date(Math.max(...attempts.map(attempt => attempt.completedAt!.getTime())))

        return {
          userId: user.id,
          userName: user.name || 'Anonymous',
          userImage: user.image || undefined,
          totalQuizzes,
          averageScore,
          bestScore,
          totalTimeSpent,
          lastAttempt,
          rank: 0 // Will be set after sorting
        } as LeaderboardEntry
      })
      .filter((entry): entry is LeaderboardEntry => entry !== null)
      .sort((a, b) => {
        // Primary sort by average score (descending)
        const scoreDiff = b.averageScore - a.averageScore
        if (Math.abs(scoreDiff) > 0.001) return scoreDiff
        
        // Secondary sort by total quizzes (descending)
        const quizDiff = b.totalQuizzes - a.totalQuizzes
        if (quizDiff !== 0) return quizDiff
        
        // Tertiary sort by best score (descending)
        return b.bestScore - a.bestScore
      })
      .slice(0, limit)

    // Assign ranks
    return leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))
  }

  async getQuizLeaderboard(quizId: string, limit: number = 20): Promise<QuizLeaderboardEntry[]> {
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId,
        completedAt: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: [
        { score: 'desc' },
        { timeSpent: 'asc' },
        { completedAt: 'asc' }
      ],
      take: limit
    })

    return attempts.map((attempt, index) => ({
      userId: attempt.userId,
      userName: attempt.user.name || 'Anonymous',
      userImage: attempt.user.image || undefined,
      score: attempt.score,
      timeSpent: attempt.timeSpent,
      completedAt: attempt.completedAt!,
      rank: index + 1
    }))
  }

  async getUserRank(userId: string): Promise<{ globalRank: number; totalUsers: number } | null> {
    const leaderboard = await this.getGlobalLeaderboard(1000) // Get more entries for accurate ranking
    const userEntry = leaderboard.find(entry => entry.userId === userId)
    
    if (!userEntry) return null

    return {
      globalRank: userEntry.rank,
      totalUsers: leaderboard.length
    }
  }

  async getUserQuizRank(userId: string, quizId: string): Promise<{ rank: number; totalParticipants: number } | null> {
    const leaderboard = await this.getQuizLeaderboard(quizId, 1000)
    const userEntry = leaderboard.find(entry => entry.userId === userId)
    
    if (!userEntry) return null

    return {
      rank: userEntry.rank,
      totalParticipants: leaderboard.length
    }
  }

  async getLeaderboardStats(): Promise<{
    totalUsers: number
    totalQuizzes: number
    totalAttempts: number
    averageScore: number
  }> {
    const [totalUsers, totalQuizzes, totalAttempts, avgScore] = await Promise.all([
      prisma.user.count({
        where: {
          quizAttempts: {
            some: {}
          }
        }
      }),
      prisma.quiz.count({
        where: { isActive: true }
      }),
      prisma.quizAttempt.count({
        where: {
          completedAt: {
            not: null
          }
        }
      }),
      prisma.quizAttempt.aggregate({
        where: {
          completedAt: {
            not: null
          }
        },
        _avg: {
          score: true
        }
      })
    ])

    return {
      totalUsers,
      totalQuizzes,
      totalAttempts,
      averageScore: avgScore._avg.score || 0
    }
  }
}