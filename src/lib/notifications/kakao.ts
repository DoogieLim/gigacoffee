import { createHmac } from "crypto"
import type { NotificationPayload, NotificationResult } from "./types"

function getSolapiAuthHeader(): string {
  const date = new Date().toISOString().replace(/\.\d{3}Z$/, "Z")
  const salt = crypto.randomUUID()
  const signature = createHmac("sha256", process.env.SOLAPI_API_SECRET!)
    .update(date + salt)
    .digest("hex")
  return `HMAC-SHA256 apiKey=${process.env.SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`
}

export async function sendKakaoNotification(
  payload: NotificationPayload
): Promise<NotificationResult> {
  try {
    if (!payload.recipientPhone) {
      return { channel: "kakao", success: false, error: "수신자 전화번호 없음" }
    }

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
          kakaoOptions: {
            pfId: process.env.SOLAPI_KAKAO_CHANNEL_ID,
            templateId: payload.eventType,
            variables: payload.templateData,
          },
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return { channel: "kakao", success: false, error }
    }

    return { channel: "kakao", success: true }
  } catch (error) {
    return { channel: "kakao", success: false, error: String(error) }
  }
}
