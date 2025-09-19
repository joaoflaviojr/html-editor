'use client'

import { useSession } from 'next-auth/react'

export default function Pricing() {
  const { data: session } = useSession()

  const features = {
    free: [
      'Basic HTML editing',
      'WYSIWYG editor',
      'Source code view',
      'File size up to 100 KB',
      '2 downloads per day',
      'Basic import/export',
    ],
    pro: [
      'All Free features',
      'Advanced DOM Tree editing',
      'Attributes panel',
      'Styles manager',
      'Diff view (compare changes)',
      'Inline CSS export',
      'File size up to 5 MB',
      'Unlimited downloads',
      'Script preservation options',
      'Priority support',
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that best fits your HTML editing needs. 
            Start free and upgrade when you need more power.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Free</h2>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $0
                <span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-3 mt-0.5">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="text-center">
              {session ? (
                <div className="bg-gray-50 text-gray-600 py-3 px-4 rounded-md">
                  Current Plan
                </div>
              ) : (
                <a
                  href="/api/auth/signin"
                  className="block w-full bg-gray-600 text-white font-medium py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Sign In to Start
                </a>
              )}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-lg shadow-xl border-2 border-orange-400 p-8 relative">
            {/* Popular badge */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro</h2>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $9
                <span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">For professional HTML development</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.pro.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-orange-500 mr-3 mt-0.5">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="text-center">
              {session ? (
                <a
                  href="/upgrade"
                  className="block w-full bg-orange-600 text-white font-medium py-3 px-4 rounded-md hover:bg-orange-700 transition-colors"
                >
                  Upgrade to Pro
                </a>
              ) : (
                <a
                  href="/api/auth/signin"
                  className="block w-full bg-orange-600 text-white font-medium py-3 px-4 rounded-md hover:bg-orange-700 transition-colors"
                >
                  Sign In to Upgrade
                </a>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel my Pro subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your Pro subscription at any time through your account page or PayPal. 
                You'll continue to have Pro access until the end of your current billing period.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens to my data if I downgrade?
              </h3>
              <p className="text-gray-600">
                Your HTML documents are always yours. If you downgrade, you'll still have access 
                to all your files, but new edits will be subject to Free plan limits.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for Pro subscriptions. 
                Contact support if you're not satisfied with your purchase.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Yes, we use industry-standard encryption and security practices. 
                Your HTML documents are securely processed and we never store them permanently 
                unless you explicitly save them.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gray-900 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-300 mb-6">
              Join thousands of developers and designers who trust HTML Editor Pro 
              for their web development workflow.
            </p>
            <div className="space-x-4">
              {!session ? (
                <a
                  href="/api/auth/signin"
                  className="inline-block bg-white text-gray-900 font-medium py-3 px-6 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Sign In to Start Free
                </a>
              ) : (
                <>
                  <a
                    href="/"
                    className="inline-block bg-gray-600 text-white font-medium py-3 px-6 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Start Editing
                  </a>
                  <a
                    href="/upgrade"
                    className="inline-block bg-orange-600 text-white font-medium py-3 px-6 rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Upgrade to Pro
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}