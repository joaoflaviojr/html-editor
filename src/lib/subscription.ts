import { prisma } from './prisma'

export interface SubscriptionLimits {
  maxFileSize: number // in bytes
  maxDailyDownloads: number
  canAccessDOMTree: boolean
  canEditAttributes: boolean
  canUseDiff: boolean
  canInlineCSS: boolean
  canPreserveScripts: boolean
}

export const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  FREE: {
    maxFileSize: 100 * 1024, // 100KB
    maxDailyDownloads: 2,
    canAccessDOMTree: false, // Can view but not edit
    canEditAttributes: false,
    canUseDiff: false,
    canInlineCSS: false,
    canPreserveScripts: false,
  },
  PRO: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxDailyDownloads: Infinity,
    canAccessDOMTree: true,
    canEditAttributes: true,
    canUseDiff: true,
    canInlineCSS: true,
    canPreserveScripts: true,
  },
}

export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return subscription
}

export async function getUserSubscriptionStatus(userId: string): Promise<'FREE' | 'PRO'> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    return 'FREE'
  }

  // Check if subscription is still valid
  if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) {
    // Subscription has expired, update status
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'expired' },
    })
    return 'FREE'
  }

  return subscription.status === 'active' ? 'PRO' : 'FREE'
}

export async function getUserLimits(userId: string): Promise<SubscriptionLimits> {
  const status = await getUserSubscriptionStatus(userId)
  return SUBSCRIPTION_LIMITS[status]
}

export async function checkFileSize(userId: string, fileSize: number): Promise<boolean> {
  const limits = await getUserLimits(userId)
  return fileSize <= limits.maxFileSize
}

export async function checkDailyDownloadLimit(userId: string): Promise<boolean> {
  const limits = await getUserLimits(userId)
  
  if (limits.maxDailyDownloads === Infinity) {
    return true
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const usage = await prisma.usage.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  })

  return !usage || usage.downloadsCount < limits.maxDailyDownloads
}

export async function incrementDownloadCount(userId: string): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.usage.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    update: {
      downloadsCount: {
        increment: 1,
      },
    },
    create: {
      userId,
      date: today,
      downloadsCount: 1,
    },
  })
}

export async function recordFileOpen(userId: string, fileSize: number): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.usage.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    update: {
      openedBytesTotal: {
        increment: fileSize,
      },
      documentsOpened: {
        increment: 1,
      },
    },
    create: {
      userId,
      date: today,
      openedBytesTotal: fileSize,
      documentsOpened: 1,
    },
  })
}

export async function logUserAction(
  userId: string,
  action: string,
  fileSize?: number,
  metadata?: any
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      fileSize,
      metadata,
    },
  })
}