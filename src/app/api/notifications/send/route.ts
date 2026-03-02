/**
 * POST /api/notifications/send — 알림 수동 발송
 *
 * 관리자가 특정 사용자에게 직접 알림을 발송하거나, 서버 간 호출용 엔드포인트.
 *
 * **발송 채널 (이벤트 타입별 기본값, dispatcher.ts 참고):**
 * - ORDER_PAID: 카카오 알림톡 + FCM 푸시
 * - ORDER_PREPARING: 카카오 알림톡 + FCM 푸시
 * - ORDER_READY: 카카오 알림톡 + SMS + FCM 푸시
 * - ORDER_CANCELLED: 카카오 알림톡
 * - LOW_STOCK: FCM 푸시 (관리자)
 *
 * `channels` 파라미터로 특정 채널만 지정 가능. 미지정 시 이벤트 기본 채널 사용.
 *
 * 인증: 로그인 사용자 (현재 역할 제한 없음 — 필요 시 requireRole 추가)
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/notifications/send POST
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dispatch } from "@/lib/notifications/dispatcher"
import type { NotificationEvent } from "@/lib/notifications/dispatcher"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 })
    }

    const { recipientId, eventType, channels, data } = await request.json()

    // dispatcher가 이벤트 타입에 따라 적절한 채널로 분기 발송
    const results = await dispatch({
      recipientId,
      eventType: eventType as NotificationEvent,
      templateData: data,
      channels, // 미지정 시 이벤트 기본 채널 사용
    })

    return NextResponse.json({ success: true, results })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
