import { NextRequest, NextResponse } from 'next/server'
import { paypalAPI } from '@/lib/paypal/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers: Record<string, string> = {}
    
    // Extract PayPal headers for webhook verification
    const requiredHeaders = [
      'paypal-auth-algo',
      'paypal-cert-id', 
      'paypal-transmission-id',
      'paypal-transmission-sig',
      'paypal-transmission-time',
    ]
    
    requiredHeaders.forEach(header => {
      const value = request.headers.get(header)
      if (value) headers[header] = value
    })

    // Verify webhook signature
    const isVerified = await paypalAPI.verifyWebhookSignature(headers, body)
    
    if (!isVerified) {
      console.error('PayPal webhook signature verification failed')
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    // Parse webhook payload
    const event = JSON.parse(body)
    console.log('PayPal webhook event:', event.event_type, event.id)

    // Handle different event types
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(event)
        break
        
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(event)
        break
        
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionSuspended(event)
        break
        
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await handleSubscriptionExpired(event)
        break
        
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(event)
        break
        
      default:
        console.log('Unhandled PayPal webhook event:', event.event_type)
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionActivated(event: any) {
  const subscriptionId = event.resource.id
  const planId = event.resource.plan_id
  
  try {
    // Get subscription details from PayPal
    const subscriptionDetails = await paypalAPI.getSubscriptionDetails(subscriptionId)
    
    // Find user by subscription ID or create if needed
    // Note: In a real app, you'd associate this with a user during the subscription flow
    const subscription = await prisma.subscription.upsert({
      where: {
        paypalSubscriptionId: subscriptionId,
      },
      update: {
        status: 'active',
        planId: planId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: subscriptionDetails.billing_info?.next_billing_time 
          ? new Date(subscriptionDetails.billing_info.next_billing_time)
          : null,
      },
      create: {
        // This would need to be associated with a user
        // For now, we'll create a placeholder - this should be handled in the subscription flow
        userId: 'placeholder', // This needs to be replaced with actual user ID
        paypalSubscriptionId: subscriptionId,
        status: 'active',
        planId: planId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: subscriptionDetails.billing_info?.next_billing_time 
          ? new Date(subscriptionDetails.billing_info.next_billing_time)
          : null,
      },
    })
    
    console.log('Subscription activated:', subscription.id)
  } catch (error) {
    console.error('Failed to handle subscription activation:', error)
  }
}

async function handleSubscriptionCancelled(event: any) {
  const subscriptionId = event.resource.id
  
  try {
    await prisma.subscription.update({
      where: {
        paypalSubscriptionId: subscriptionId,
      },
      data: {
        status: 'canceled',
      },
    })
    
    console.log('Subscription cancelled:', subscriptionId)
  } catch (error) {
    console.error('Failed to handle subscription cancellation:', error)
  }
}

async function handleSubscriptionSuspended(event: any) {
  const subscriptionId = event.resource.id
  
  try {
    await prisma.subscription.update({
      where: {
        paypalSubscriptionId: subscriptionId,
      },
      data: {
        status: 'suspended',
      },
    })
    
    console.log('Subscription suspended:', subscriptionId)
  } catch (error) {
    console.error('Failed to handle subscription suspension:', error)
  }
}

async function handleSubscriptionExpired(event: any) {
  const subscriptionId = event.resource.id
  
  try {
    await prisma.subscription.update({
      where: {
        paypalSubscriptionId: subscriptionId,
      },
      data: {
        status: 'expired',
      },
    })
    
    console.log('Subscription expired:', subscriptionId)
  } catch (error) {
    console.error('Failed to handle subscription expiration:', error)
  }
}

async function handlePaymentCompleted(event: any) {
  const billingAgreementId = event.resource.billing_agreement_id
  
  if (billingAgreementId) {
    try {
      // Update subscription period end date
      const subscription = await prisma.subscription.findFirst({
        where: {
          paypalSubscriptionId: billingAgreementId,
        },
      })
      
      if (subscription) {
        // Calculate next period end (typically 1 month from now)
        const nextPeriodEnd = new Date()
        nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1)
        
        await prisma.subscription.update({
          where: {
            id: subscription.id,
          },
          data: {
            currentPeriodEnd: nextPeriodEnd,
          },
        })
        
        console.log('Payment processed for subscription:', subscription.id)
      }
    } catch (error) {
      console.error('Failed to handle payment completion:', error)
    }
  }
}