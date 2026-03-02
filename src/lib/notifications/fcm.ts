import type { NotificationPayload, NotificationResult } from "./types"

interface FcmMessage {
  token: string
  notification: { title: string; body: string }
  data?: Record<string, string>
}

// Firebase Admin SDK를 통한 FCM 서버 발송
export async function sendPushNotification(
  payload: NotificationPayload
): Promise<NotificationResult> {
  try {
    if (!payload.recipientFcmToken) {
      return { channel: "push", success: false, error: "FCM 토큰 없음" }
    }

    const { title, body } = buildPushMessage(payload.eventType, payload.templateData)

    // Firebase Admin SDK 동적 import (서버 전용)
    const { initializeApp, getApps, cert } = await import("firebase-admin/app")
    const { getMessaging } = await import("firebase-admin/messaging")

    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      })
    }

    const message: FcmMessage = {
      token: payload.recipientFcmToken,
      notification: { title, body },
      data: { eventType: payload.eventType, ...payload.templateData },
    }

    await getMessaging().send(message)
    return { channel: "push", success: true }
  } catch (error) {
    return { channel: "push", success: false, error: String(error) }
  }
}

function buildPushMessage(
  eventType: string,
  data: Record<string, string>
): { title: string; body: string } {
  const deliveryLabel = data.deliveryType === "robot" ? "로봇" : "라이더"
  const messages: Record<string, { title: string; body: string }> = {
    ORDER_PAID:             { title: "주문 접수 완료", body: "주문이 접수되었습니다. 곧 제작을 시작합니다." },
    ORDER_PREPARING:        { title: "음료 제작 중", body: "바리스타가 음료를 제작하고 있습니다." },
    ORDER_OUT_FOR_DELIVERY: { title: "배달 출발!", body: `${deliveryLabel}이 배달을 시작했습니다.` },
    ORDER_READY:            { title: "픽업 가능!", body: "음료가 준비됐습니다. 카운터에서 찾아가세요!" },
    ORDER_COMPLETED:        { title: "배달 완료", body: "음료가 도착했습니다. 맛있게 드세요!" },
    ORDER_CANCELLED:        { title: "주문 취소", body: "주문이 취소되었습니다." },
    LOW_STOCK: {
      title: "재고 부족 알림",
      body: `[${data.productName}] 재고가 ${data.quantity}개 이하입니다.`,
    },
    NEW_ORDER: {
      title: "새 주문 도착",
      body: data.orderSummary ?? "새 주문이 들어왔습니다.",
    },
  }
  return messages[eventType] ?? { title: "GigaCoffee 알림", body: data.message ?? "알림이 도착했습니다." }
}
