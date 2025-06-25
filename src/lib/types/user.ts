export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface UserStats {
  userId: string
  totalQuizzesTaken: number
  averageScore: number
  totalTimeSpent: number
  bestScore: number
  recentActivity: Date
}
