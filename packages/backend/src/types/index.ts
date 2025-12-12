import { ExpoPushErrorTicket, ExpoPushReceiptId, ExpoPushSuccessTicket } from 'expo-server-sdk';
import { Request } from 'express';

export interface DeviceData {
  expoPushToken: string;
  platform?: string;
  appVersion?: string;
  deviceName?: string;
  deviceModel?: string;
}

export interface NotificationData {
  userId?: string | null;
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: string;
  status?: string;
  ticketId?: string | null;
  error?: string;
}

export interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
}

export interface TokenVerificationResult {
  valid: boolean;
  reason?: string;
  message?: string;
  currentToken?: string;
  token_matches?: boolean;
  is_active?: boolean;
  last_active?: Date;
  token_updated_at?: Date;
  expo_valid?: boolean;
  recent_errors?: number;
}

export interface DeviceInfo {
  has_token: boolean;
  token_preview: string | null;
  platform: string | null;
  app_version: string | null;
  device_name: string | null;
  device_model: string | null;
  registered_at: Date;
  last_active: Date;
  token_updated_at: Date;
  days_since_registration: number;
  hours_since_active: number;
}

export interface RegisterRequestBody {
  expoPushToken?: string;
  platform?: string;
  appVersion?: string;
  deviceName?: string;
  deviceModel?: string;
  silentRegistration?: boolean;
}

export interface VerifyTokenRequestBody {
  expoPushToken?: string;
}

export interface SendNotificationRequestBody {
  title?: string;
  body?: string;
  data?: Record<string, any>;
}

export interface RequestWithUser extends Request {
  userId: string;
  body: any;
}

export interface ExpoPushResponse {
  tickets: (ExpoPushSuccessTicket | ExpoPushErrorTicket)[];
  success: number;
  fail: number;
}

export type SuccessTicket = {
  type: 'success';
  id: ExpoPushReceiptId;
};

export type ErrorTicket = {
  type: 'error';
  message: string;
  details?: any;
};