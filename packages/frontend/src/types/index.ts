export interface Device {
  user_id: string;
  platform?: string;
}

export interface HistoryItem {
  id: number;
  user_id: string;
  title: string;
  body: string;
  status: string;
  sent_at: string;
}

export interface SendResult {
  ok: boolean;
  result?: any;
  error?: any;
}
