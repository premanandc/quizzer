import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SignInForm } from '@/components/auth/signin-form'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In to Quizzer</CardTitle>
          <p className="text-gray-600">
            Enter your email and password to sign in
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignInForm />

          <div className="text-center text-sm text-gray-600 space-y-2">
            <div>
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-blue-600 hover:underline"
              >
                Sign up here
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
  title: 'Sign In - Quizzer',
  description: 'Sign in to your Quizzer account',
}
