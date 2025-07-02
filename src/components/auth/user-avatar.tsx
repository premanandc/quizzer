import { auth } from '@/auth'
import { SignInButton } from './signin-button'
import { SignOutButton } from './signout-button'
import Link from 'next/link'

export async function UserAvatar() {
  const session = await auth()

  if (!session?.user?.id && !session?.user?.email) {
    return (
      <div className="flex items-center gap-2">
        <SignInButton>Sign In</SignInButton>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/profile"
        className="flex items-center gap-2 hover:text-blue-600"
      >
        {session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm font-medium">
          {session.user.name || session.user.email}
        </span>
      </Link>
      <SignOutButton>Sign Out</SignOutButton>
    </div>
  )
}
