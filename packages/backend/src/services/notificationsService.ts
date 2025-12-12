import prisma from '../prisma/client';
import { NotificationData } from '../types';

export async function logNotification(data: NotificationData) {
  return prisma.notifications.create({
    data: {
      user_id: data.userId || null,
      title: data.title,
      body: data.body,
      data: data.data || {},
      type: data.type,
      status: data.status,
      ticket_id: data.ticketId,
      error: data.error,
      sent_at: new Date()
    }
  });
}

export async function getRecentErrorsCount(userId: string) {
  const result = await prisma.notifications.count({
    where: {
      user_id: userId,
      status: 'error',
      sent_at: {
        gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      OR: [
        { error: { contains: 'Invalid' } },
        { error: { contains: 'Device' } }
      ]
    }
  });
  return result;
}

export async function getHistory(limit = 20) {
  return prisma.notifications.findMany({
    orderBy: { sent_at: 'desc' },
    take: limit
  });
}