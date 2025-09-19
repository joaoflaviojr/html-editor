import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { checkDailyDownloadLimit } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const canDownload = await checkDailyDownloadLimit(session.user.id)
    
    if (!canDownload) {
      return NextResponse.json(
        { 
          error: 'Daily download limit exceeded. Upgrade to Pro for unlimited downloads.',
          canDownload: false 
        },
        { status: 429 }
      )
    }

    return NextResponse.json({ canDownload: true })
    
  } catch (error) {
    console.error('Download check error:', error)
    return NextResponse.json(
      { error: 'Failed to check download limit' },
      { status: 500 }
    )
  }
}