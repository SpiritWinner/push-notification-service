import { Expo, ExpoPushErrorTicket, ExpoPushSuccessTicket } from 'expo-server-sdk';
import { ExpoMessage, ExpoPushResponse } from '../types';
import logger from '../utils/logger';

const expo = new Expo();

export function isValidExpoToken(token: string): boolean {
  return Expo.isExpoPushToken(token);
}

export async function sendPushMessages(messages: ExpoMessage[]): Promise<ExpoPushResponse>  {
  const chunks = expo.chunkPushNotifications(messages);
   const tickets: (ExpoPushSuccessTicket | ExpoPushErrorTicket)[] = [];
  let success = 0;
  let fail = 0;

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
      success += chunk.length;
    } catch (err) {
      fail += chunk.length;
      logger.error('Expo send chunk error', err);
    }
  }

  return { tickets, success, fail };
}

export function getTicketId(ticket: ExpoPushSuccessTicket | ExpoPushErrorTicket): string | null {
  if ('status' in ticket && ticket.status === 'ok' && 'id' in ticket) {
    return ticket.id;
  }
  return null;
}