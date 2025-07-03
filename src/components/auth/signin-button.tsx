'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

interface SignInButtonProps {
  provider?: string
  children: React.ReactNode
  className?: string
}

export function SignInButton({
  provider = 'github',
  children,
  className,
}: SignInButtonProps) {
  return (
    <Button
      onClick={() => signIn(provider, { callbackUrl: '/' })}
      className={className}
    >
      {children}
    </Button>
  )
}
