import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SignInButton } from '@/components/auth/signin-button'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In to Quizzer</CardTitle>
          <p className="text-gray-600">
            Choose your preferred sign-in method
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignInButton provider="github" className="w-full">
            Continue with GitHub
          </SignInButton>
          <SignInButton provider="google" className="w-full">
            Continue with Google
          </SignInButton>
          
          <div className="text-center text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              ← Back to Home
            </Link>
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