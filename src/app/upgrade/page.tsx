'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import PayPalButton from '@/components/ui/PayPalButton'

export default function Upgrade() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to upgrade to Pro.
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

  const handleSubscriptionSuccess = (subscriptionId: string) => {
    setIsProcessing(false)
    router.push('/account?success=subscription')
  }

  const handleSubscriptionError = (error: any) => {
    setIsProcessing(false)
    console.error('Subscription error:', error)
    alert('Failed to process subscription. Please try again.')
  }

  const handleSubscriptionCancel = () => {
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upgrade to Pro
          </h1>
          <p className="text-lg text-gray-600">
            Unlock advanced HTML editing features with Pro
          </p>
        </div>

        {/* Upgrade Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-orange-50 border-b border-orange-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">HTML Editor Pro</h2>
                <p className="text-gray-600">Monthly subscription</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">$9</div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Features List */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">What you get with Pro:</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'Advanced DOM Tree editing',
                  'Attributes panel',
                  'Styles manager',
                  'Diff view (compare changes)',
                  'Inline CSS export',
                  'File size up to 5 MB',
                  'Unlimited downloads',
                  'Script preservation options',
                  'Priority support',
                  'Regular feature updates',
                ].map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2 mt-0.5">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PayPal Button */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Complete your upgrade:</h3>
              
              {process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_PRO ? (
                <PayPalButton
                  planId={process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_PRO}
                  onSuccess={handleSubscriptionSuccess}
                  onError={handleSubscriptionError}
                  onCancel={handleSubscriptionCancel}
                  disabled={isProcessing}
                  className="max-w-md"
                />
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    PayPal configuration is not complete. Please contact support.
                  </p>
                </div>
              )}

              {isProcessing && (
                <div className="mt-4 text-center text-gray-600">
                  <div className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing subscription...
                  </div>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                By subscribing, you agree to our{' '}
                <a href="/terms" className="text-orange-600 hover:text-orange-800">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-orange-600 hover:text-orange-800">Privacy Policy</a>.
                You can cancel anytime from your account page or through PayPal.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Access</h3>
            <p className="text-gray-600 text-sm">
              Get immediate access to all Pro features as soon as your subscription is processed.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
            <p className="text-gray-600 text-sm">
              Your payment is processed securely through PayPal. We never store your payment information.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">30-Day Guarantee</h3>
            <p className="text-gray-600 text-sm">
              Not satisfied? Get a full refund within 30 days of your subscription.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Editor
          </a>
        </div>
      </div>
    </div>
  )
}