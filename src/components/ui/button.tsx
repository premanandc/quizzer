import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

    const variantClasses = {
      primary:
        'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
      secondary:
        'bg-gray-600 text-white hover:bg-gray-700 focus-visible:ring-gray-500',
      outline:
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500',
    }

    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-lg',
    }

    const variantMap = new Map(Object.entries(variantClasses))
    const sizeMap = new Map(Object.entries(sizeClasses))
    const variantClass = variantMap.get(variant) || variantClasses.primary
    const sizeClass = sizeMap.get(size) || sizeClasses.md
    const classes =
      `${baseClasses} ${variantClass} ${sizeClass} ${className}`.trim()

    return <button className={classes} ref={ref} {...props} />
  }
)

Button.displayName = 'Button'

export { Button }
