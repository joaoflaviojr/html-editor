import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { recordFileOpen, logUserAction, incrementDownloadCount } from '@/lib/subscription'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { action, fileSize, metadata } = await request.json()
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Log the action
    await logUserAction(session.user.id, action, fileSize, metadata)

    // Handle specific actions
    switch (action) {
      case 'import':
      case 'open':
        if (fileSize) {
          await recordFileOpen(session.user.id, fileSize)
        }
        break
        
      case 'download':
        await incrementDownloadCount(session.user.id)
        break
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Usage logging error:', error)
    return NextResponse.json(
      { error: 'Failed to log usage' },
      { status: 500 }
    )
  }
}