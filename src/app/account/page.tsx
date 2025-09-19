'use client'

import { useSession, signOut } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

interface SubscriptionInfo {
  status: 'FREE' | 'PRO'
  limits: {
    maxFileSize: number
    maxDailyDownloads: number
    canAccessDOMTree: boolean
    canEditAttributes: boolean
    canUseDiff: boolean
    canInlineCSS: boolean
  }
  isPro: boolean
}

function AccountContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const success = searchParams?.get('success')

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/subscription/status')
          if (response.ok) {
            const data = await response.json()
            setSubscriptionInfo(data)
          }
        } catch (error) {
          console.error('Failed to fetch subscription info:', error)
        }
      }
      setLoading(false)
    }

    fetchSubscriptionInfo()
  }, [session])

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access your account.
          </p>
          <a
            href="/api/auth/signin"
            className="inline-block w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In with Google
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Message */}
        {success === 'subscription' && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-green-400 mr-3">✓</span>
              <p className="text-green-800">
                Welcome to Pro! Your subscription has been activated successfully.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account</h1>
          <p className="text-gray-600">Manage your subscription and account settings</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
            
            <div className="flex items-center space-x-4">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {session.user.name}
                </h3>
                <p className="text-gray-600">{session.user.email}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription</h2>
            
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : subscriptionInfo ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      subscriptionInfo.isPro
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscriptionInfo.status}
                    </span>
                    {subscriptionInfo.isPro && (
                      <span className="text-green-600 text-sm">✓ Active</span>
                    )}
                  </div>
                  
                  {!subscriptionInfo.isPro && (
                    <a
                      href="/upgrade"
                      className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                    >
                      Upgrade to Pro
                    </a>
                  )}
                </div>

                {/* Current Limits */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Current Plan Limits</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Max file size:</span>
                      <span className="ml-2 font-medium">
                        {(subscriptionInfo.limits.maxFileSize / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Daily downloads:</span>
                      <span className="ml-2 font-medium">
                        {subscriptionInfo.limits.maxDailyDownloads === Infinity 
                          ? 'Unlimited' 
                          : subscriptionInfo.limits.maxDailyDownloads}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">DOM Tree editing:</span>
                      <span className={`ml-2 font-medium ${
                        subscriptionInfo.limits.canAccessDOMTree ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {subscriptionInfo.limits.canAccessDOMTree ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Advanced panels:</span>
                      <span className={`ml-2 font-medium ${
                        subscriptionInfo.limits.canEditAttributes ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {subscriptionInfo.limits.canEditAttributes ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Diff view:</span>
                      <span className={`ml-2 font-medium ${
                        subscriptionInfo.limits.canUseDiff ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {subscriptionInfo.limits.canUseDiff ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Inline CSS export:</span>
                      <span className={`ml-2 font-medium ${
                        subscriptionInfo.limits.canInlineCSS ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {subscriptionInfo.limits.canInlineCSS ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Manage Subscription */}
                {subscriptionInfo.isPro && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Manage Subscription</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      You can manage your subscription, update payment methods, or cancel through PayPal.
                    </p>
                    <a
                      href="https://www.paypal.com/myaccount/autopay/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Manage in PayPal
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-600">
                Failed to load subscription information.
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <a
                href="/"
                className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <h3 className="font-medium text-gray-900 mb-1">HTML Editor</h3>
                <p className="text-gray-600 text-sm">Start editing HTML documents</p>
              </a>

              <a
                href="/pricing"
                className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <h3 className="font-medium text-gray-900 mb-1">View Pricing</h3>
                <p className="text-gray-600 text-sm">Compare Free and Pro plans</p>
              </a>

              {!subscriptionInfo?.isPro && (
                <a
                  href="/upgrade"
                  className="block p-4 border border-orange-300 bg-orange-50 rounded-lg hover:border-orange-400 transition-colors"
                >
                  <h3 className="font-medium text-orange-900 mb-1">Upgrade to Pro</h3>
                  <p className="text-orange-700 text-sm">Unlock advanced features</p>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Account() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading account...</p>
          </div>
        </div>
      </div>
    }>
      <AccountContent />
    </Suspense>
  )
}