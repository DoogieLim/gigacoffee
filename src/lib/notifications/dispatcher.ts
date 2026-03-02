import { sendKakaoNotification } from "./kakao"
import { sendPushNotification } from "./fcm"
import { sendSmsNotification } from "./sms"
import { sendNewOrderEmailToAdmin } from "./email"
import { memberRepo, notificationRepo } from "@/lib/db"
import type { NotificationPayload, NotificationResult } from "./types"
import { createHmac } from "crypto"

export type NotificationEvent =
  | "ORDER_PAID"
  | "ORDER_PREPARING"
  | "ORDER_OUT_FOR_DELIVERY"
  | "ORDER_READY"
  | "ORDER_COMPLETED"
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
  ORDER_PAID: ["kakao", "push", "sms"],
  ORDER_PREPARING: ["kakao", "push"],
  ORDER_OUT_FOR_DELIVERY: ["kakao", "push", "sms"],
  ORDER_READY: ["kakao", "push", "sms"],
  ORDER_COMPLETED: ["kakao", "push"],
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

// Solapi HMAC 인증 헤더
function getSolapiAuthHeader(): string {
  const date = new Date().toISOString().replace(/\.\d{3}Z$/, "Z")
  const salt = crypto.randomUUID()
  const signature = createHmac("sha256", process.env.SOLAPI_API_SECRET!)
    .update(date + salt)
    .digest("hex")
  return `HMAC-SHA256 apiKey=${process.env.SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`
}

interface AdminOrderData {
  orderId: string
  totalAmount: number
  itemCount: number
  customerName?: string
  deliveryType: string
  items?: { product_name: string; quantity: number }[]
}

/**
 * 관리자에게 새 주문 알림 발송
 * - SMS: ADMIN_PHONE으로 Solapi 직접 발송
 * - FCM 웹 푸시: ADMIN_USER_ID의 FCM 토큰으로 발송
 * - 이메일: ADMIN_EMAIL로 Resend 발송
 */
export async function dispatchNewOrderToAdmin(data: AdminOrderData): Promise<void> {
  const adminPhone = process.env.ADMIN_PHONE
  const adminUserId = process.env.ADMIN_USER_ID
  const shortId = data.orderId.slice(0, 8).toUpperCase()
  const amountStr = data.totalAmount.toLocaleString()
  const deliveryLabel =
    data.deliveryType === "pickup" ? "픽업" :
    data.deliveryType === "robot" ? "로봇배달" : "라이더배달"

  const results = await Promise.allSettled([
    // 1) SMS 관리자 직접 발송
    (async (): Promise<NotificationResult> => {
      if (!adminPhone || !process.env.SOLAPI_API_KEY) {
        return { channel: "sms", success: false, error: "ADMIN_PHONE 또는 Solapi 키 미설정" }
      }
      try {
        const res = await fetch("https://api.solapi.com/messages/v4/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: getSolapiAuthHeader(),
          },
          body: JSON.stringify({
            message: {
              to: adminPhone,
              from: process.env.SOLAPI_FROM_NUMBER,
              text: `[GigaCoffee] 새 주문\n주문번호: ${shortId}\n금액: ${amountStr}원\n수령: ${deliveryLabel}`,
              type: "SMS",
            },
          }),
        })
        if (!res.ok) return { channel: "sms", success: false, error: await res.text() }
        return { channel: "sms", success: true }
      } catch (err) {
        return { channel: "sms", success: false, error: String(err) }
      }
    })(),

    // 2) FCM 관리자 웹 푸시
    (async (): Promise<NotificationResult> => {
      if (!adminUserId) return { channel: "push", success: false, error: "ADMIN_USER_ID 미설정" }
      const profile = await memberRepo.findPhoneAndToken(adminUserId)
      if (!profile?.fcm_token) return { channel: "push", success: false, error: "관리자 FCM 토큰 없음 (브라우저 알림 허용 필요)" }
      const itemSummary = data.items && data.items.length > 0
        ? data.items.map((i) => `${i.product_name}×${i.quantity}`).join(", ")
        : `${data.itemCount}건`
      return sendPushNotification({
        recipientId: adminUserId,
        recipientFcmToken: profile.fcm_token,
        eventType: "NEW_ORDER",
        templateData: {
          orderId: shortId,
          amount: amountStr,
          orderSummary: `${itemSummary} — ${amountStr}원`,
        },
      })
    })(),

    // 3) 이메일 (Resend)
    sendNewOrderEmailToAdmin(data),
  ])

  // 결과 로깅
  const labels = ["SMS", "FCM", "이메일"]
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[관리자 알림 실패] ${labels[i]}:`, result.reason)
    } else if (!result.value.success) {
      console.warn(`[관리자 알림 실패] ${labels[i]}:`, result.value.error)
    } else {
      console.log(`[관리자 알림 성공] ${labels[i]}`)
    }
  })
}
