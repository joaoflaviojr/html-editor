'use client'

import { useEffect, useRef, useState } from 'react'
import { initPayPal } from '@/lib/paypal/client'

interface PayPalButtonProps {
  planId: string
  onSuccess?: (subscriptionId: string) => void
  onError?: (error: any) => void
  onCancel?: () => void
  disabled?: boolean
  className?: string
}

export default function PayPalButton({
  planId,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  className = '',
}: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadPayPal = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
          throw new Error('PayPal client ID not configured')
        }

        const paypal = await initPayPal({
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        })

        if (!paypal || !mounted) return

        // Ensure PayPal SDK is properly loaded and Buttons function exists
        if (!paypal.Buttons) {
          throw new Error('PayPal SDK not properly initialized')
        }

        if (paypalRef.current) {
          // Clear any existing buttons
          paypalRef.current.innerHTML = ''

          paypal.Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'subscribe',
            },
            createSubscription: function(data: any, actions: any) {
              return actions.subscription.create({
                plan_id: planId,
                application_context: {
                  brand_name: 'HTML Editor Pro',
                  locale: 'en-US',
                  shipping_preference: 'NO_SHIPPING',
                  user_action: 'SUBSCRIBE_NOW',
                },
              })
            },
            onApprove: async function(data: any, actions: any) {
              try {
                // Verify the subscription on the server
                const response = await fetch('/api/subscription/verify', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    subscriptionId: data.subscriptionID,
                    orderID: data.orderID,
                  }),
                })

                if (response.ok) {
                  const result = await response.json()
                  onSuccess?.(data.subscriptionID)
                } else {
                  throw new Error('Failed to verify subscription')
                }
              } catch (error) {
                console.error('Subscription verification failed:', error)
                onError?.(error)
              }
            },
            onCancel: function(data: any) {
              console.log('Subscription cancelled:', data)
              onCancel?.()
            },
            onError: function(err: any) {
              console.error('PayPal button error:', err)
              onError?.(err)
            },
          }).render(paypalRef.current)
        }

        if (mounted) {
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Failed to load PayPal:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load PayPal')
          setIsLoading(false)
        }
      }
    }

    loadPayPal()

    return () => {
      mounted = false
    }
  }, [planId, onSuccess, onError, onCancel])

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-800 text-sm">
          Failed to load PayPal: {error}
        </p>
        <button
          onClick={() => {
            setError(null)
            setIsLoading(true)
            // Trigger reload
            window.location.reload()
          }}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className={className}>
      {isLoading && (
        <div className="animate-pulse bg-gray-200 h-12 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 text-sm">Loading PayPal...</span>
        </div>
      )}
      <div
        ref={paypalRef}
        className={disabled ? 'opacity-50 pointer-events-none' : ''}
      />
    </div>
  )
}