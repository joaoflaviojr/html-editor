import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { paypalAPI } from '@/lib/paypal/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { subscriptionId, orderID } = await request.json()
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    // Verify subscription with PayPal
    const subscriptionDetails = await paypalAPI.getSubscriptionDetails(subscriptionId)
    
    if (!subscriptionDetails || subscriptionDetails.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 400 }
      )
    }

    // Create or update subscription in database
    const subscription = await prisma.subscription.upsert({
      where: {
        paypalSubscriptionId: subscriptionId,
      },
      update: {
        userId: session.user.id,
        status: 'active',
        planId: subscriptionDetails.plan_id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: subscriptionDetails.billing_info?.next_billing_time 
          ? new Date(subscriptionDetails.billing_info.next_billing_time)
          : null,
      },
      create: {
        userId: session.user.id,
        paypalSubscriptionId: subscriptionId,
        status: 'active',
        planId: subscriptionDetails.plan_id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: subscriptionDetails.billing_info?.next_billing_time 
          ? new Date(subscriptionDetails.billing_info.next_billing_time)
          : null,
      },
    })

    // Log the subscription activation
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'subscription_activated',
        metadata: {
          subscriptionId,
          planId: subscriptionDetails.plan_id,
        },
      },
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planId: subscription.planId,
      },
    })
    
  } catch (error) {
    console.error('Subscription verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify subscription' },
      { status: 500 }
    )
  }
}