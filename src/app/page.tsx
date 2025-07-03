import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserAvatar } from '@/components/auth/user-avatar'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Quizzer</h1>
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
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Test Your Knowledge
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take interactive quizzes, track your progress, and compete with
            others. Perfect for learning and assessment.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">📝</span>
                Interactive Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Single and multiple choice questions with instant feedback and
                explanations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Progress Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Monitor your performance, track improvement, and review detailed
                results.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">🏆</span>
                Leaderboards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Compete with others and see how you rank against other quiz
                takers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Quiz */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl">
              Take the Prompting Basics Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Test your knowledge of AI prompting fundamentals with our
              10-question quiz. No account required!
            </p>
            <Link href="/quiz/cmcb6wwfy000029uu0bb3rxdg">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Prompting Basics Quiz
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Getting Started
          </h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="text-left">
              <h4 className="font-semibold mb-2">For Quiz Takers:</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Click on any available quiz</li>
                <li>• Answer questions at your own pace</li>
                <li>• Get instant results and explanations</li>
                <li>• Track your progress over time</li>
              </ul>
            </div>
            <div className="text-left">
              <h4 className="font-semibold mb-2">For Quiz Creators:</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Import quizzes from JSON files</li>
                <li>• Use our CLI tools for bulk operations</li>
                <li>• Monitor usage and analytics</li>
                <li>• Manage quiz content easily</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>
              &copy; 2024 Quizzer. Built with Next.js, TypeScript, and Tailwind
              CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
