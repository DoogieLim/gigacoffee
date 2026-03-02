/**
 * GET /api/test/notifications — 알림 채널 테스트 (개발환경 전용)
 *
 * SMS, 카카오 알림톡, FCM 웹 푸시 발송이 정상 작동하는지 검증한다.
 *
 * **프로덕션 보호:** `NODE_ENV === "production"`이면 즉시 403 반환.
 * 빌드 시점에 제거되지 않고 런타임 체크를 사용한 이유:
 * Next.js standalone 빌드에서 tree-shaking으로 라우트 파일이 제거되지 않을 수 있음.
 *
 * **Solapi HMAC-SHA256 인증:**
 * Solapi API는 API Key + Secret으로 서명한 HMAC-SHA256 Authorization 헤더를 요구한다.
 * `date`: ISO 8601 형식 (밀리초 제거) + `salt`: UUID + `signature`: HMAC(date+salt)
 *
 * **FCM 토큰 조회:** fcm_token은 profiles 테이블에 저장된다.
 * 브라우저에서 /my 페이지 방문 + 알림 권한 허용 시 자동 등록됨.
 *
 * 인증: 불필요 (개발환경 전용, 프로덕션에서 403)
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/test/notifications GET
 */
import { NextResponse } from "next/server"
import { createHmac } from "crypto"

/**
 * Solapi HMAC-SHA256 인증 헤더 생성
 * 형식: `HMAC-SHA256 apiKey=..., date=..., salt=..., signature=...`
 */
function getSolapiAuthHeader(): string {
  // 밀리초(.dddZ)를 제거한 ISO 8601 형식 (Solapi 요구 형식)
  const date = new Date().toISOString().replace(/\.\d{3}Z$/, "Z")
  const salt = crypto.randomUUID()
  const signature = createHmac("sha256", process.env.SOLAPI_API_SECRET!)
    .update(date + salt)
    .digest("hex")
  return `HMAC-SHA256 apiKey=${process.env.SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`
}

async function testSms(phone: string) {
  if (!process.env.SOLAPI_API_KEY || !process.env.SOLAPI_API_SECRET) {
    return { channel: "sms", success: false, error: "SOLAPI_API_KEY 또는 SOLAPI_API_SECRET 미설정" }
  }
  if (!process.env.SOLAPI_FROM_NUMBER) {
    return { channel: "sms", success: false, error: "SOLAPI_FROM_NUMBER 미설정" }
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
          to: phone,
          from: process.env.SOLAPI_FROM_NUMBER,
          text: "[GigaCoffee] SMS 테스트 메시지입니다. 정상 수신 시 SMS 발송이 작동합니다.",
          type: "SMS",
        },
      }),
    })

    const body = await res.json()
    if (!res.ok) {
      return { channel: "sms", success: false, error: JSON.stringify(body), status: res.status }
    }
    return { channel: "sms", success: true, data: body }
  } catch (err) {
    return { channel: "sms", success: false, error: String(err) }
  }
}

async function testKakao(phone: string) {
  const channelId = process.env.SOLAPI_KAKAO_CHANNEL_ID

  if (!process.env.SOLAPI_API_KEY || !process.env.SOLAPI_API_SECRET) {
    return { channel: "kakao", success: false, error: "SOLAPI 키 미설정" }
  }
  if (!channelId) {
    return { channel: "kakao", success: false, error: "SOLAPI_KAKAO_CHANNEL_ID 미설정" }
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
          to: phone,
          from: process.env.SOLAPI_FROM_NUMBER,
          kakaoOptions: {
            pfId: channelId,
            templateId: "ORDER_PAID",
            variables: {
              orderId: "TEST-0001",
              deliveryType: "pickup",
            },
          },
        },
      }),
    })

    const body = await res.json()
    if (!res.ok) {
      return { channel: "kakao", success: false, error: JSON.stringify(body), status: res.status, channelId }
    }
    return { channel: "kakao", success: true, data: body, channelId }
  } catch (err) {
    return { channel: "kakao", success: false, error: String(err) }
  }
}

async function testFcm(fcmToken: string) {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    return { channel: "push", success: false, error: "Firebase 환경변수 미설정" }
  }

  try {
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

    await getMessaging().send({
      token: fcmToken,
      notification: {
        title: "GigaCoffee 푸시 테스트",
        body: "FCM 웹 푸시가 정상 작동합니다!",
      },
      data: { eventType: "TEST" },
    })

    return { channel: "push", success: true }
  } catch (err) {
    return { channel: "push", success: false, error: String(err) }
  }
}

async function getFcmTokenFromDb(userId: string): Promise<string | null> {
  try {
    const { createServiceClient } = await import("@/lib/supabase/server")
    const supabase = await createServiceClient()
    const { data } = await supabase
      .from("profiles")
      .select("fcm_token")
      .eq("id", userId)
      .single()
    return (data as { fcm_token?: string | null } | null)?.fcm_token ?? null
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "테스트 엔드포인트는 프로덕션에서 비활성화됩니다." }, { status: 403 })
  }

  const url = new URL(req.url)
  const channel = url.searchParams.get("channel") ?? "all"
  const phone = url.searchParams.get("phone") ?? process.env.ADMIN_PHONE ?? ""
  const userId = url.searchParams.get("userId") ?? process.env.ADMIN_USER_ID ?? ""

  if (!phone) {
    return NextResponse.json({ error: "phone 파라미터 또는 ADMIN_PHONE 환경변수 필요" }, { status: 400 })
  }

  const results: Record<string, unknown> = {
    env: {
      SOLAPI_API_KEY: !!process.env.SOLAPI_API_KEY,
      SOLAPI_API_SECRET: !!process.env.SOLAPI_API_SECRET,
      SOLAPI_FROM_NUMBER: process.env.SOLAPI_FROM_NUMBER ?? "❌ 미설정",
      SOLAPI_KAKAO_CHANNEL_ID: process.env.SOLAPI_KAKAO_CHANNEL_ID ?? "❌ 미설정",
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ?? "❌ 미설정",
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    },
    targetPhone: phone,
    targetUserId: userId,
  }

  // FCM 토큰 조회
  let fcmToken: string | null = null
  if (userId && (channel === "push" || channel === "all")) {
    fcmToken = await getFcmTokenFromDb(userId)
    results.fcmTokenStatus = fcmToken ? "✅ 있음" : "❌ 없음 (브라우저 알림 권한 허용 필요)"
  }

  // 채널별 테스트
  if (channel === "sms" || channel === "all") {
    results.sms = await testSms(phone)
  }

  if (channel === "kakao" || channel === "all") {
    results.kakao = await testKakao(phone)
  }

  if (channel === "push" || channel === "all") {
    if (!fcmToken) {
      results.push = { channel: "push", success: false, error: "FCM 토큰 없음 — 브라우저에서 /my 페이지 방문 후 알림 허용 필요" }
    } else {
      results.push = await testFcm(fcmToken)
    }
  }

  return NextResponse.json(results, { status: 200 })
}
