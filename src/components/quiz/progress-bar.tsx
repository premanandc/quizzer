interface ProgressBarProps {
  current: number
  total: number
  answered: number
  className?: string
}

export function ProgressBar({ current, total, answered, className = '' }: ProgressBarProps) {
  const progressPercentage = (current / total) * 100
  const answeredPercentage = (answered / total) * 100

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Question {current} of {total}
        </span>
        <span className="text-sm text-gray-500">
          {answered}/{total} answered
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 relative">
        {/* Answered progress (lighter blue) */}
        <div
          className="bg-blue-300 h-2 rounded-full transition-all duration-300"
          style={{ width: `${answeredPercentage}%` }}
        />
        
        {/* Current progress (darker blue) */}
        <div
          className="bg-blue-600 h-2 rounded-full absolute top-0 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">Start</span>
        <span className="text-xs text-gray-500">
          {Math.round(answeredPercentage)}% complete
        </span>
        <span className="text-xs text-gray-500">End</span>
      </div>
    </div>
  )
}