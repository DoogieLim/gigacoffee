import { NextRequest } from "next/server"
import { notificationRepo } from "@/lib/db"
import { requireRole } from "@/lib/api/auth"
import { apiPaginated, apiError } from "@/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    // admin 권한 필요
    await requireRole(request, ["admin"])

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
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
