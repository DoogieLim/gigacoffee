/**
 * POST /api/user/set-store — 사용자 선택 매장 설정
 *
 * 사용자가 `/stores` 페이지에서 매장을 선택할 때 클라이언트 컴포넌트가 이 API를 호출한다.
 * 선택된 매장 ID는 `user_store_id` HttpOnly 쿠키에 저장되어 30일간 유지된다.
 *
 * **인증 불필요 이유:**
 * 비로그인 사용자도 매장 선택이 가능해야 한다 (로그인은 주문 시점에 요구됨).
 * 쿠키에는 공개 정보인 store_id만 저장되므로 보안 위험 없음.
 *
 * **주문 생성 시 연동:**
 * `/api/orders` POST에서 이 쿠키 값을 `orders.store_id`에 사용한다.
 *
 * 인증: 불필요 (Public)
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/user/set-store POST
 */
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  const { storeId } = (await req.json()) as { storeId: string }

  const cookieStore = await cookies()
  if (!storeId) {
    // 빈 문자열 또는 null: 매장 선택 초기화 (매장 선택 화면으로 돌아가는 경우)
    cookieStore.delete("user_store_id")
  } else {
    cookieStore.set("user_store_id", storeId, {
      httpOnly: true,           // XSS 방지
      path: "/",                // 전체 라우트에서 읽힘
      maxAge: 60 * 60 * 24 * 30, // 30일: 매번 매장 선택 강요 방지
    })
  }

  return NextResponse.json({ ok: true })
}
