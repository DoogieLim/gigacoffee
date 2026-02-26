import { NextRequest } from "next/server"
import { orderRepo } from "@/lib/db"
import { requireRole } from "@/lib/api/auth"
import { apiSuccess, apiError } from "@/lib/api/response"

type Period = "today" | "week" | "month"

export async function GET(request: NextRequest) {
  try {
    // admin 권한 필요
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
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }

    const orders = await orderRepo.findForSales(fromDate)

    const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0)
    const totalOrders = orders.length
    const paidOrders = orders.filter((o) => o.status === "paid").length
    const completedOrders = orders.filter((o) => o.status === "completed").length

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
