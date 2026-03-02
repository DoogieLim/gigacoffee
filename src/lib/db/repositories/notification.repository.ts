import type { NotificationLog } from "@/types/notification.types"

export interface InsertNotificationLogData {
  type: "kakao" | "push" | "sms" | "email"
  recipientId: string
  eventType: string
  payload: unknown
  status: "success" | "failed" | "pending"
  sentAt?: string | null
}

export interface NotificationRepository {
  insertLog(data: InsertNotificationLogData): Promise<void>
  findLogs(options: { page: number; limit: number }): Promise<{ logs: NotificationLog[]; total: number }>
}
