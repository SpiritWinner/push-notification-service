import prisma from '../prisma/client';
import { DeviceData } from '../types';

export async function findDeviceByUser(userId: string) {
  return prisma.devices.findUnique({
    where: { user_id: userId }
  });
}

export async function findDeviceByToken(token: string) {
  return prisma.devices.findFirst({
    where: { expo_push_token: token }
  });
}

export async function upsertDevice(userId: string, data: DeviceData) {
  return prisma.devices.upsert({
    where: { user_id: userId },
    update: {
      expo_push_token: data.expoPushToken,
      platform: data.platform,
      app_version: data.appVersion,
      device_name: data.deviceName,
      device_model: data.deviceModel,
      last_active: new Date(),
      token_updated_at: new Date()
    },
    create: {
      user_id: userId,
      expo_push_token: data.expoPushToken,
      platform: data.platform,
      app_version: data.appVersion,
      device_name: data.deviceName,
      device_model: data.deviceModel,
      registered_at: new Date(),
      last_active: new Date(),
      token_updated_at: new Date()
    }
  });
}

export async function setLastActive(userId: string) {
  return prisma.devices.update({
    where: { user_id: userId },
    data: { last_active: new Date() }
  });
}

export async function deleteDevice(userId: string) {
  await prisma.notifications.deleteMany({
    where: { user_id: userId }
  });

  return prisma.devices.delete({
    where: { user_id: userId }
  });
}

export async function getAllUsers() {
  return prisma.devices.findMany({
    select: { user_id: true, platform: true }
  });
}