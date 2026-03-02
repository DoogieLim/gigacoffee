/**
 * GET /api/notifications/logs — 알림 발송 로그 조회 (관리자 전용)
 *
 * 모든 알림 발송 이력을 페이지네이션으로 반환한다.
 * 발송 성공/실패, 채널, 수신자, 이벤트 타입 등을 확인하는 데 사용한다.
 *
 * **limit 제한:** 최소 1, 최대 100 (성능 보호를 위해 서버에서 강제 적용)
 *
 * 인증: admin 역할 필요
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/notifications/logs GET
 */
import { NextRequest } from "next/server"
import { notificationRepo } from "@/lib/db"
import { requireRole } from "@/lib/api/auth"
import { apiPaginated, apiError } from "@/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ["admin"])

    const { searchParams } = new URL(request.url)
    // 1 미만 방지: Math.max(1, ...)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    // 1~100 사이로 클램핑: 너무 많은 데이터 반환 방지
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))

    const { logs, total } = await notificationRepo.findLogs({ page, limit })

    return apiPaginated(logs, total, page, limit)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return apiError(`알림 로그 조회 실패: ${String(error)}`, 500)
  }
}
