import { createHmac } from "crypto"
import type { NotificationPayload, NotificationResult } from "./types"

function getSolapiAuthHeader(): string {
  const date = new Date().toISOString()
  const salt = crypto.randomUUID()
  const signature = createHmac("sha256", process.env.SOLAPI_API_SECRET!)
    .update(date + salt)
    .digest("hex")
  return `HMAC-SHA256 apiKey=${process.env.SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`
}

export async function sendSmsNotification(
  payload: NotificationPayload
): Promise<NotificationResult> {
  try {
    if (!payload.recipientPhone) {
      return { channel: "sms", success: false, error: "수신자 전화번호 없음" }
    }

    const messageText = buildSmsText(payload.eventType, payload.templateData)

    const response = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getSolapiAuthHeader(),
      },
      body: JSON.stringify({
        message: {
          to: payload.recipientPhone,
          from: process.env.SOLAPI_FROM_NUMBER,
          text: messageText,
          type: "SMS",
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return { channel: "sms", success: false, error }
    }

    return { channel: "sms", success: true }
  } catch (error) {
    return { channel: "sms", success: false, error: String(error) }
  }
}

function buildSmsText(eventType: string, data: Record<string, string>): string {
  const templates: Record<string, string> = {
    ORDER_PAID: `[GigaCoffee] 주문이 완료되었습니다. 주문번호: ${data.orderId}`,
    ORDER_READY: `[GigaCoffee] 음료가 준비되었습니다. 픽업해주세요! 주문번호: ${data.orderId}`,
    ORDER_CANCELLED: `[GigaCoffee] 주문이 취소되었습니다. 주문번호: ${data.orderId}`,
  }
  return templates[eventType] ?? `[GigaCoffee] ${data.message ?? "알림이 도착했습니다."}`
}
