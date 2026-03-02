export interface NotificationPayload {
  recipientId: string
  recipientPhone?: string
  recipientFcmToken?: string
  eventType: string
  templateData: Record<string, string>
}

export interface NotificationResult {
  channel: "kakao" | "push" | "sms" | "email"
  success: boolean
  error?: string
}

export interface NotificationProvider {
  send(payload: NotificationPayload): Promise<NotificationResult>
}
