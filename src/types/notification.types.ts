export type NotificationChannel = "kakao" | "push" | "sms"
export type NotificationStatus = "success" | "failed" | "pending"

export type NotificationEventType =
  | "ORDER_PAID"
  | "ORDER_PREPARING"
  | "ORDER_READY"
  | "ORDER_CANCELLED"
  | "LOW_STOCK"
  | "CUSTOM"

export interface NotificationLog {
  id: string
  type: NotificationChannel
  recipient_id: string
  event_type: NotificationEventType | string
  payload: Record<string, unknown>
  status: NotificationStatus
  sent_at: string | null
  created_at: string
}

export interface SendNotificationInput {
  recipientId: string
  eventType: NotificationEventType
  channels: NotificationChannel[]
  data: Record<string, unknown>
}
