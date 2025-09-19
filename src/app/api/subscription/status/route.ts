import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getUserSubscriptionStatus, getUserLimits } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const status = await getUserSubscriptionStatus(session.user.id)
    const limits = await getUserLimits(session.user.id)

    return NextResponse.json({
      status,
      limits,
      isPro: status === 'PRO',
    })
    
  } catch (error) {
    console.error('Failed to get subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}