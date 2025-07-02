import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SignUpForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="text-gray-600">
            Sign up to start taking quizzes and track your progress
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignUpForm />

          <div className="text-center text-sm text-gray-600 space-y-2">
            <div>
              Already have an account?{' '}
              <Link
                href="/auth/signin"
                className="text-blue-600 hover:underline"
              >
                Sign in here
              </Link>
            </div>
            <div>
              <Link href="/" className="hover:text-blue-600">
                ← Back to Home
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const metadata = {
  title: 'Sign Up - Quizzer',
  description: 'Create your Quizzer account',
}
