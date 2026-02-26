import { sendKakaoNotification } from "./kakao"
import { sendPushNotification } from "./fcm"
import { sendSmsNotification } from "./sms"
import { memberRepo, notificationRepo } from "@/lib/db"
import type { NotificationPayload, NotificationResult } from "./types"

export type NotificationEvent =
  | "ORDER_PAID"
  | "ORDER_PREPARING"
  | "ORDER_READY"
  | "ORDER_CANCELLED"
  | "LOW_STOCK"
  | "NEW_ORDER"

interface DispatchOptions {
  recipientId: string
  eventType: NotificationEvent
  templateData: Record<string, string>
  channels?: ("kakao" | "push" | "sms")[]
}

const DEFAULT_CHANNELS: Record<NotificationEvent, ("kakao" | "push" | "sms")[]> = {
  ORDER_PAID: ["kakao", "push"],
  ORDER_PREPARING: ["kakao", "push"],
  ORDER_READY: ["kakao", "push", "sms"],
  ORDER_CANCELLED: ["kakao"],
  LOW_STOCK: ["push"],
  NEW_ORDER: ["push"],
}

export async function dispatch(options: DispatchOptions): Promise<NotificationResult[]> {
  const { recipientId, eventType, templateData, channels } = options
  const activeChannels = channels ?? DEFAULT_CHANNELS[eventType]

  const profile = await memberRepo.findPhoneAndToken(recipientId)

  const payload: NotificationPayload = {
    recipientId,
    recipientPhone: profile?.phone ?? undefined,
    recipientFcmToken: profile?.fcm_token ?? undefined,
    eventType,
    templateData,
  }

  const results = await Promise.all(
    activeChannels.map((channel) => {
      switch (channel) {
        case "kakao": return sendKakaoNotification(payload)
        case "push":  return sendPushNotification(payload)
        case "sms":   return sendSmsNotification(payload)
      }
    })
  )

  await Promise.all(
    results.map((result) =>
      notificationRepo.insertLog({
        type: result.channel,
        recipientId,
        eventType,
        payload: { templateData },
        status: result.success ? "success" : "failed",
        sentAt: result.success ? new Date().toISOString() : null,
      })
    )
  )

  return results
}
