/**
 * GET /api/sales — 매출 분석 데이터 (관리자 전용)
 *
 * 기간별 매출 통계를 반환한다. 관리자 대시보드의 SalesChart 컴포넌트에서 사용.
 *
 * **period 기간 계산:**
 * - `today`: 당일 00:00:00(자정)부터 현재 — `new Date(y, m, d)` 사용
 * - `week` / `month`: 현재 시각으로부터 7일/30일 전 — 밀리초 연산
 * today만 자정 기준인 이유: "오늘 매출"은 하루 단위 집계가 자연스럽기 때문
 *
 * 인증: admin 역할 필요 (staff 제외)
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/sales GET
 */
import { NextRequest } from "next/server"
import { orderRepo } from "@/lib/db"
import { requireRole } from "@/lib/api/auth"
import { apiSuccess, apiError } from "@/lib/api/response"

type Period = "today" | "week" | "month"

export async function GET(request: NextRequest) {
  try {
    // admin 전용 (staff 제외): 매출 데이터는 민감 정보
    await requireRole(request, ["admin"])

    const { searchParams } = new URL(request.url)
    const period = (searchParams.get("period") || "today") as Period

    const now = new Date()
    let fromDate: Date

    switch (period) {
      case "week":
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "today":
      default:
        // 당일 자정 기준 (오늘 00:00:00) — 로컬 타임존 기준
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }

    const orders = await orderRepo.findForSales(fromDate)

    const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0)
    const totalOrders = orders.length
    const paidOrders = orders.filter((o) => o.status === "paid").length
    const completedOrders = orders.filter((o) => o.status === "completed").length

    // 날짜별 매출 집계: Recharts 차트 데이터 포맷으로 가공
    const salesByDate: Record<string, { total: number; count: number }> = {}
    orders.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split("T")[0]
      if (!salesByDate[date]) {
        salesByDate[date] = { total: 0, count: 0 }
      }
      salesByDate[date].total += order.total_amount
      salesByDate[date].count += 1
    })

    return apiSuccess({
      period,
      fromDate: fromDate.toISOString(),
      toDate: now.toISOString(),
      totalSales,
      totalOrders,
      paidOrders,
      completedOrders,
      salesByDate,
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return apiError(`매출 데이터 조회 실패: ${String(error)}`, 500)
  }
}
