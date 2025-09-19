import { prisma } from '@/lib/prisma'

interface PayPalCredentials {
  clientId: string
  clientSecret: string
  env: 'sandbox' | 'live'
}

export class PayPalServerAPI {
  private credentials: PayPalCredentials
  private baseURL: string

  constructor() {
    this.credentials = {
      clientId: process.env.PAYPAL_CLIENT_ID!,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
      env: (process.env.PAYPAL_ENV as 'sandbox' | 'live') || 'sandbox',
    }
    this.baseURL = this.credentials.env === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com'
  }

  async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${this.credentials.clientId}:${this.credentials.clientSecret}`
    ).toString('base64')

    const response = await fetch(`${this.baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      throw new Error('Failed to get PayPal access token')
    }

    const data = await response.json()
    return data.access_token
  }

  async verifyWebhookSignature(
    headers: Record<string, string>,
    body: string
  ): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken()
      
      const verificationData = {
        auth_algo: headers['paypal-auth-algo'],
        cert_id: headers['paypal-cert-id'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: process.env.PAYPAL_WEBHOOK_ID!,
        webhook_event: JSON.parse(body),
      }

      const response = await fetch(`${this.baseURL}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(verificationData),
      })

      if (!response.ok) {
        console.error('Webhook verification failed:', await response.text())
        return false
      }

      const result = await response.json()
      return result.verification_status === 'SUCCESS'
    } catch (error) {
      console.error('Webhook verification error:', error)
      return false
    }
  }

  async getSubscriptionDetails(subscriptionId: string) {
    try {
      const accessToken = await this.getAccessToken()
      
      const response = await fetch(`${this.baseURL}/v1/billing/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to get subscription details')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get subscription details:', error)
      throw error
    }
  }

  async updateUserSubscription(userId: string, paypalData: any) {
    try {
      const subscriptionDetails = await this.getSubscriptionDetails(paypalData.id)
      
      const subscriptionData = {
        userId,
        paypalSubscriptionId: paypalData.id,
        status: subscriptionDetails.status.toLowerCase(),
        planId: subscriptionDetails.plan_id,
        currentPeriodStart: subscriptionDetails.billing_info?.cycle_executions?.[0]?.cycles_completed 
          ? new Date(subscriptionDetails.billing_info.next_billing_time) 
          : new Date(),
        currentPeriodEnd: subscriptionDetails.billing_info?.next_billing_time 
          ? new Date(subscriptionDetails.billing_info.next_billing_time)
          : null,
      }

      const subscription = await prisma.subscription.upsert({
        where: {
          paypalSubscriptionId: paypalData.id,
        },
        update: subscriptionData,
        create: subscriptionData,
      })

      return subscription
    } catch (error) {
      console.error('Failed to update user subscription:', error)
      throw error
    }
  }
}

export const paypalAPI = new PayPalServerAPI()