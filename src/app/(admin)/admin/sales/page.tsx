"use client"

import { useState, useEffect } from "react"
import { getSalesData } from "@/actions/sales.actions"
import type { Period } from "@/actions/sales.actions"
import { StatsCard } from "@/components/admin/StatsCard"
import { DailySalesChart } from "@/components/admin/SalesChart"
import { Button } from "@/components/ui/Button"
import { formatPrice } from "@/lib/utils/format"

export default function SalesPage() {
  const [period, setPeriod] = useState<Period>("week")
  const [dailySales, setDailySales] = useState<{ date: string; amount: number; orders: number }[]>([])
  const [kpi, setKpi] = useState({ totalSales: 0, orderCount: 0, avgOrderValue: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    getSalesData(period).then(({ dailySales, kpi }) => {
      setDailySales(dailySales)
      setKpi(kpi)
      setIsLoading(false)
    })
  }, [period])

  const periodButtons: { key: Period; label: string }[] = [
    { key: "today", label: "오늘" },
    { key: "week", label: "이번 주" },
    { key: "month", label: "이번 달" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">매출 분석</h1>
        <div className="flex gap-2">
          {periodButtons.map((b) => (
            <Button
              key={b.key}
              variant={period === b.key ? "primary" : "outline"}
              size="sm"
              onClick={() => setPeriod(b.key)}
            >
              {b.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard title="총 매출" value={formatPrice(kpi.totalSales)} />
        <StatsCard title="주문 수" value={`${kpi.orderCount}건`} />
        <StatsCard title="평균 객단가" value={formatPrice(kpi.avgOrderValue)} />
      </div>

      {!isLoading && dailySales.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">일별 매출 추이</h2>
          <DailySalesChart dailySales={dailySales} />
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-12 text-gray-500">데이터 로딩 중...</div>
      )}
    </div>
  )
}
