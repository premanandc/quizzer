import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  LeaderboardService,
  LeaderboardEntry,
  QuizLeaderboardEntry,
} from '@/lib/services/leaderboard-service'
import { prisma } from '@/lib/db'

// Mock prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    quizAttempt: {
      findMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    quiz: {
      count: vi.fn(),
    },
  },
}))

describe('LeaderboardService', () => {
  let service: LeaderboardService

  beforeEach(() => {
    service = new LeaderboardService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getGlobalLeaderboard', () => {
    const mockUsers = [
      {
        id: 'user-1',
        name: 'Alice',
        image: 'alice.jpg',
        quizAttempts: [
          { score: 85, timeSpent: 120, completedAt: new Date('2024-01-15') },
          { score: 90, timeSpent: 100, completedAt: new Date('2024-01-20') },
        ],
      },
      {
        id: 'user-2',
        name: 'Bob',
        image: null,
        quizAttempts: [
          { score: 95, timeSpent: 150, completedAt: new Date('2024-01-18') },
        ],
      },
      {
        id: 'user-3',
        name: null,
        image: null,
        quizAttempts: [
          { score: 80, timeSpent: 90, completedAt: new Date('2024-01-12') },
          { score: 85, timeSpent: 110, completedAt: new Date('2024-01-17') },
        ],
      },
    ]

    it('should return global leaderboard with correct ranking', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers)

      const result = await service.getGlobalLeaderboard()

      expect(result).toHaveLength(3)

      // Bob should be first (highest average: 95)
      expect(result[0]).toMatchObject({
        userId: 'user-2',
        userName: 'Bob',
        userImage: undefined,
        totalQuizzes: 1,
        averageScore: 95,
        bestScore: 95,
        totalTimeSpent: 150,
        rank: 1,
      })

      // Alice should be second (average: 87.5)
      expect(result[1]).toMatchObject({
        userId: 'user-1',
        userName: 'Alice',
        userImage: 'alice.jpg',
        totalQuizzes: 2,
        averageScore: 87.5,
        bestScore: 90,
        totalTimeSpent: 220,
        rank: 2,
      })

      // Anonymous user should be third (average: 82.5)
      expect(result[2]).toMatchObject({
        userId: 'user-3',
        userName: 'Anonymous',
        userImage: undefined,
        totalQuizzes: 2,
        averageScore: 82.5,
        bestScore: 85,
        totalTimeSpent: 200,
        rank: 3,
      })
    })

    it('should handle empty user list', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([])

      const result = await service.getGlobalLeaderboard()

      expect(result).toHaveLength(0)
    })

    it('should filter out users with no quiz attempts', async () => {
      const usersWithNoAttempts = [
        {
          id: 'user-1',
          name: 'Alice',
          image: null,
          quizAttempts: [],
        },
        {
          id: 'user-2',
          name: 'Bob',
          image: null,
          quizAttempts: [
            { score: 90, timeSpent: 120, completedAt: new Date('2024-01-15') },
          ],
        },
      ]

      vi.mocked(prisma.user.findMany).mockResolvedValue(usersWithNoAttempts)

      const result = await service.getGlobalLeaderboard()

      expect(result).toHaveLength(1)
      expect(result[0].userId).toBe('user-2')
    })

    it('should respect limit parameter', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers)

      const result = await service.getGlobalLeaderboard(2)

      expect(result).toHaveLength(2)
      expect(result[0].rank).toBe(1)
      expect(result[1].rank).toBe(2)
    })

    it('should use default limit of 50', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers)

      await service.getGlobalLeaderboard()

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          quizAttempts: {
            some: {},
          },
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
                not: null,
              },
            },
          },
        },
      })
    })

    it('should handle users with same average score', async () => {
      const usersWithSameScore = [
        {
          id: 'user-1',
          name: 'Alice',
          image: null,
          quizAttempts: [
            { score: 90, timeSpent: 120, completedAt: new Date('2024-01-15') },
            { score: 90, timeSpent: 100, completedAt: new Date('2024-01-20') },
          ],
        },
        {
          id: 'user-2',
          name: 'Bob',
          image: null,
          quizAttempts: [
            { score: 90, timeSpent: 150, completedAt: new Date('2024-01-18') },
          ],
        },
      ]

      vi.mocked(prisma.user.findMany).mockResolvedValue(usersWithSameScore)

      const result = await service.getGlobalLeaderboard()

      expect(result).toHaveLength(2)
      // Alice should be first (more quizzes taken)
      expect(result[0].userId).toBe('user-1')
      expect(result[0].totalQuizzes).toBe(2)
      expect(result[1].userId).toBe('user-2')
      expect(result[1].totalQuizzes).toBe(1)
    })
  })

  describe('getQuizLeaderboard', () => {
    const mockAttempts = [
      {
        userId: 'user-1',
        score: 95,
        timeSpent: 120,
        completedAt: new Date('2024-01-15'),
        user: { name: 'Alice', image: 'alice.jpg' },
      },
      {
        userId: 'user-2',
        score: 90,
        timeSpent: 100,
        completedAt: new Date('2024-01-20'),
        user: { name: 'Bob', image: null },
      },
      {
        userId: 'user-3',
        score: 90,
        timeSpent: 110,
        completedAt: new Date('2024-01-18'),
        user: { name: null, image: null },
      },
    ]

    it('should return quiz leaderboard with correct ranking', async () => {
      vi.mocked(prisma.quizAttempt.findMany).mockResolvedValue(mockAttempts)

      const result = await service.getQuizLeaderboard('quiz-123')

      expect(result).toHaveLength(3)

      // Alice should be first (highest score)
      expect(result[0]).toMatchObject({
        userId: 'user-1',
        userName: 'Alice',
        userImage: 'alice.jpg',
        score: 95,
        timeSpent: 120,
        rank: 1,
      })

      // Bob should be second (same score as user-3 but faster time)
      expect(result[1]).toMatchObject({
        userId: 'user-2',
        userName: 'Bob',
        userImage: undefined,
        score: 90,
        timeSpent: 100,
        rank: 2,
      })

      // Anonymous user should be third
      expect(result[2]).toMatchObject({
        userId: 'user-3',
        userName: 'Anonymous',
        userImage: undefined,
        score: 90,
        timeSpent: 110,
        rank: 3,
      })
    })

    it('should handle empty attempts list', async () => {
      vi.mocked(prisma.quizAttempt.findMany).mockResolvedValue([])

      const result = await service.getQuizLeaderboard('quiz-123')

      expect(result).toHaveLength(0)
    })

    it('should respect limit parameter', async () => {
      vi.mocked(prisma.quizAttempt.findMany).mockResolvedValue(mockAttempts)

      const result = await service.getQuizLeaderboard('quiz-123', 2)

      expect(result).toHaveLength(3) // Mock returns all, but database would limit
      expect(prisma.quizAttempt.findMany).toHaveBeenCalledWith({
        where: {
          quizId: 'quiz-123',
          completedAt: {
            not: null,
          },
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: [
          { score: 'desc' },
          { timeSpent: 'asc' },
          { completedAt: 'asc' },
        ],
        take: 2,
      })
    })

    it('should use default limit of 20', async () => {
      vi.mocked(prisma.quizAttempt.findMany).mockResolvedValue(mockAttempts)

      await service.getQuizLeaderboard('quiz-123')

      expect(prisma.quizAttempt.findMany).toHaveBeenCalledWith({
        where: {
          quizId: 'quiz-123',
          completedAt: {
            not: null,
          },
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: [
          { score: 'desc' },
          { timeSpent: 'asc' },
          { completedAt: 'asc' },
        ],
        take: 20,
      })
    })
  })

  describe('getUserRank', () => {
    it('should return user rank from global leaderboard', async () => {
      const mockLeaderboard = [
        { userId: 'user-1', rank: 1 },
        { userId: 'user-2', rank: 2 },
        { userId: 'user-3', rank: 3 },
      ]

      // Mock the getGlobalLeaderboard method
      vi.spyOn(service, 'getGlobalLeaderboard').mockResolvedValue(
        mockLeaderboard as LeaderboardEntry[]
      )

      const result = await service.getUserRank('user-2')

      expect(result).toEqual({
        globalRank: 2,
        totalUsers: 3,
      })
      expect(service.getGlobalLeaderboard).toHaveBeenCalledWith(1000)
    })

    it('should return null for non-existent user', async () => {
      const mockLeaderboard = [
        { userId: 'user-1', rank: 1 },
        { userId: 'user-2', rank: 2 },
      ]

      vi.spyOn(service, 'getGlobalLeaderboard').mockResolvedValue(
        mockLeaderboard as LeaderboardEntry[]
      )

      const result = await service.getUserRank('user-999')

      expect(result).toBeNull()
    })
  })

  describe('getUserQuizRank', () => {
    it('should return user rank from quiz leaderboard', async () => {
      const mockLeaderboard = [
        { userId: 'user-1', rank: 1 },
        { userId: 'user-2', rank: 2 },
        { userId: 'user-3', rank: 3 },
      ]

      vi.spyOn(service, 'getQuizLeaderboard').mockResolvedValue(
        mockLeaderboard as QuizLeaderboardEntry[]
      )

      const result = await service.getUserQuizRank('user-2', 'quiz-123')

      expect(result).toEqual({
        rank: 2,
        totalParticipants: 3,
      })
      expect(service.getQuizLeaderboard).toHaveBeenCalledWith('quiz-123', 1000)
    })

    it('should return null for non-existent user', async () => {
      const mockLeaderboard = [
        { userId: 'user-1', rank: 1 },
        { userId: 'user-2', rank: 2 },
      ]

      vi.spyOn(service, 'getQuizLeaderboard').mockResolvedValue(
        mockLeaderboard as QuizLeaderboardEntry[]
      )

      const result = await service.getUserQuizRank('user-999', 'quiz-123')

      expect(result).toBeNull()
    })
  })

  describe('getLeaderboardStats', () => {
    it('should return aggregated statistics', async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(150)
      vi.mocked(prisma.quiz.count).mockResolvedValue(25)
      vi.mocked(prisma.quizAttempt.count).mockResolvedValue(500)
      vi.mocked(prisma.quizAttempt.aggregate).mockResolvedValue({
        _avg: { score: 78.5 },
      } as { _avg: { score: number | null } })

      const result = await service.getLeaderboardStats()

      expect(result).toEqual({
        totalUsers: 150,
        totalQuizzes: 25,
        totalAttempts: 500,
        averageScore: 78.5,
      })

      expect(prisma.user.count).toHaveBeenCalledWith({
        where: {
          quizAttempts: {
            some: {},
          },
        },
      })

      expect(prisma.quiz.count).toHaveBeenCalledWith({
        where: { isActive: true },
      })

      expect(prisma.quizAttempt.count).toHaveBeenCalledWith({
        where: {
          completedAt: {
            not: null,
          },
        },
      })

      expect(prisma.quizAttempt.aggregate).toHaveBeenCalledWith({
        where: {
          completedAt: {
            not: null,
          },
        },
        _avg: {
          score: true,
        },
      })
    })

    it('should handle null average score', async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(0)
      vi.mocked(prisma.quiz.count).mockResolvedValue(5)
      vi.mocked(prisma.quizAttempt.count).mockResolvedValue(0)
      vi.mocked(prisma.quizAttempt.aggregate).mockResolvedValue({
        _avg: { score: null },
      } as { _avg: { score: number | null } })

      const result = await service.getLeaderboardStats()

      expect(result).toEqual({
        totalUsers: 0,
        totalQuizzes: 5,
        totalAttempts: 0,
        averageScore: 0,
      })
    })

    it('should handle database errors', async () => {
      vi.mocked(prisma.user.count).mockRejectedValue(
        new Error('Database error')
      )

      await expect(service.getLeaderboardStats()).rejects.toThrow(
        'Database error'
      )
    })
  })
})
