"use server"

import { orderRepo } from "@/lib/db"
import { getAdminStoreId } from "@/lib/utils/admin-store"
import { requireAdminAction } from "@/lib/auth/action-auth"

export type Period = "today" | "week" | "month"

export async function getSalesData(period: Period) {
  await requireAdminAction()
  const storeId = await getAdminStoreId()

  const now = new Date()
  const from = new Date()
  if (period === "today") from.setHours(0, 0, 0, 0)
  else if (period === "week") from.setDate(now.getDate() - 7)
  else from.setDate(1)

  const orders = await orderRepo.findForSales(from, storeId)

  const salesByDate: Record<string, { amount: number; orders: number }> = {}
  let totalSales = 0

  for (const order of orders) {
    const date = order.created_at.slice(0, 10)
    if (!salesByDate[date]) salesByDate[date] = { amount: 0, orders: 0 }
    salesByDate[date].amount += order.total_amount
    salesByDate[date].orders += 1
    totalSales += order.total_amount
  }

  const sortedDates = Object.keys(salesByDate).sort()
  const dailySales = sortedDates.map((d) => ({ date: d, ...salesByDate[d] }))

  return {
    dailySales,
    kpi: {
      totalSales,
      orderCount: orders.length,
      avgOrderValue: orders.length ? Math.round(totalSales / orders.length) : 0,
    },
  }
}
