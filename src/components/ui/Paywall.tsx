'use client'

interface PaywallProps {
  featureName: string
  description: string
  children?: React.ReactNode
  className?: string
}

export default function Paywall({
  featureName,
  description,
  children,
  className = '',
}: PaywallProps) {
  return (
    <div className={`bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg ${className}`}>
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">🔒</span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {featureName}
        </h3>
        
        <p className="text-gray-600 mb-4">
          {description}
        </p>
        
        <div className="bg-white rounded-lg p-4 mb-4 border border-orange-200">
          <h4 className="font-medium text-gray-900 mb-2">Pro Features Include:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• DOM Tree editing and reordering</li>
            <li>• Advanced attributes panel</li>
            <li>• Diff view for comparing changes</li>
            <li>• Inline CSS export</li>
            <li>• Large file support (up to 5MB)</li>
            <li>• Unlimited daily downloads</li>
            <li>• Priority support</li>
          </ul>
        </div>
        
        <div className="space-y-3">
          <a
            href="/upgrade"
            className="inline-block w-full bg-orange-600 text-white font-medium px-6 py-3 rounded-md hover:bg-orange-700 transition-colors"
          >
            Upgrade to Pro
          </a>
          
          <a
            href="/pricing"
            className="block text-sm text-orange-600 hover:text-orange-800"
          >
            View Pricing Details
          </a>
        </div>
        
        {children}
      </div>
    </div>
  )
}

interface FeatureGateProps {
  isAllowed: boolean
  featureName: string
  description: string
  children: React.ReactNode
  className?: string
}

export function FeatureGate({
  isAllowed,
  featureName,
  description,
  children,
  className = '',
}: FeatureGateProps) {
  if (isAllowed) {
    return <>{children}</>
  }
  
  return (
    <Paywall
      featureName={featureName}
      description={description}
      className={className}
    />
  )
}

interface ProBadgeProps {
  className?: string
}

export function ProBadge({ className = '' }: ProBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full ${className}`}>
      PRO
    </span>
  )
}

interface UsageLimitWarningProps {
  currentUsage: number
  limit: number
  type: 'fileSize' | 'downloads'
  className?: string
}

export function UsageLimitWarning({
  currentUsage,
  limit,
  type,
  className = '',
}: UsageLimitWarningProps) {
  const percentage = Math.round((currentUsage / limit) * 100)
  const isNearLimit = percentage >= 80
  const isOverLimit = percentage >= 100
  
  if (!isNearLimit && !isOverLimit) {
    return null
  }
  
  const formatValue = (value: number, type: string) => {
    if (type === 'fileSize') {
      return `${(value / 1024).toFixed(1)} KB`
    }
    return value.toString()
  }
  
  return (
    <div className={`rounded-lg p-3 ${
      isOverLimit 
        ? 'bg-red-50 border border-red-200' 
        : 'bg-yellow-50 border border-yellow-200'
    } ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-lg">
            {isOverLimit ? '🚫' : '⚠️'}
          </span>
        </div>
        <div className="ml-3 flex-1">
          <h4 className={`text-sm font-medium ${
            isOverLimit ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {isOverLimit ? 'Limit Exceeded' : 'Approaching Limit'}
          </h4>
          <p className={`text-sm mt-1 ${
            isOverLimit ? 'text-red-700' : 'text-yellow-700'
          }`}>
            {type === 'fileSize' && (
              <>File size: {formatValue(currentUsage, type)} / {formatValue(limit, type)}</>
            )}
            {type === 'downloads' && (
              <>Daily downloads: {currentUsage} / {limit}</>
            )}
          </p>
          
          {(isOverLimit || percentage >= 90) && (
            <div className="mt-2">
              <a
                href="/upgrade"
                className={`text-sm font-medium ${
                  isOverLimit ? 'text-red-600 hover:text-red-800' : 'text-yellow-600 hover:text-yellow-800'
                }`}
              >
                Upgrade to Pro for higher limits →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}