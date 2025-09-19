'use client'

import { loadScript } from '@paypal/paypal-js'

export interface PayPalConfig {
  clientId: string
  currency?: string
  intent?: string
}

export async function initPayPal(config: PayPalConfig) {
  try {
    const paypal = await loadScript({
      clientId: config.clientId,
      components: 'buttons',
      currency: config.currency || 'USD',
      intent: config.intent || 'subscription',
      vault: true,
    })
    
    return paypal
  } catch (error) {
    console.error('Failed to load PayPal SDK:', error)
    throw error
  }
}

export interface CreateSubscriptionData {
  planId: string
  applicationContext?: {
    brandName?: string
    locale?: string
    shippingPreference?: string
    userAction?: string
    paymentMethod?: {
      payerSelected?: string
      payeePreferred?: string
    }
  }
}

export interface PayPalButtonOptions {
  planId: string
  onApprove: (data: any, actions: any) => Promise<void>
  onCancel?: (data: any) => void
  onError?: (err: any) => void
  style?: {
    layout?: string
    color?: string
    shape?: string
    label?: string
  }
}