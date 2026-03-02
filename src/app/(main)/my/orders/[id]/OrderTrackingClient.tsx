"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ORDER_STATUS_LABELS } from "@/lib/constants/payment"
import { formatDateTime, formatPrice } from "@/lib/utils/format"

type TrackingOrder = {
  id: string
  status: string
  delivery_type: string
  delivery_address: { street?: string; detail?: string } | null
  total_amount: number
  delivery_fee: number
  memo: string | null
  created_at: string
  order_items: { product_name: string; quantity: number; line_total: number }[]
}

const PICKUP_STEPS = ["paid", "preparing", "ready", "completed"] as const
const DELIVERY_STEPS = ["paid", "preparing", "out_for_delivery", "completed"] as const

const STEP_LABELS: Record<string, string> = {
  paid: "접수 완료",
  preparing: "제작 중",
  ready: "픽업 가능",
  out_for_delivery: "배달 중",
  completed: "완료",
}

const STEP_ICONS: Record<string, string> = {
  paid: "✅",
  preparing: "☕",
  ready: "🛍️",
  out_for_delivery: "🛵",
  completed: "🎉",
}

interface Props {
  initialOrder: TrackingOrder
}

export function OrderTrackingClient({ initialOrder }: Props) {
  const [order, setOrder] = useState(initialOrder)
  const isDelivery = order.delivery_type === "robot" || order.delivery_type === "rider"
  const steps = isDelivery ? DELIVERY_STEPS : PICKUP_STEPS

  const currentStepIdx = order.status === "cancelled"
    ? -1
    : (steps as readonly string[]).indexOf(order.status)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`order-tracking-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "gigacoffee",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          setOrder((prev) => ({ ...prev, status: payload.new.status }))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [order.id])

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">주문 추적</h1>
      <p className="mb-6 text-sm text-gray-500">#{order.id.slice(0, 8).toUpperCase()}</p>

      {/* 상태 단계 표시 */}
      {order.status === "cancelled" ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-lg font-semibold text-red-700">주문이 취소되었습니다</p>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-start justify-between">
            {steps.map((step, idx) => (
              <div key={step} className="flex flex-1 flex-col items-center">
                {/* 아이콘 + 연결선 */}
                <div className="flex w-full items-center">
                  {idx > 0 && (
                    <div className={`h-0.5 flex-1 ${idx <= currentStepIdx ? "bg-amber-500" : "bg-gray-200"}`} />
                  )}
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-lg
                    ${idx < currentStepIdx ? "bg-amber-500" :
                      idx === currentStepIdx ? "bg-amber-500 ring-4 ring-amber-100" :
                      "bg-gray-100"}`}
                  >
                    {idx <= currentStepIdx ? STEP_ICONS[step] : (
                      <span className="text-sm text-gray-400">{idx + 1}</span>
                    )}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 ${idx < currentStepIdx ? "bg-amber-500" : "bg-gray-200"}`} />
                  )}
                </div>
                {/* 레이블 */}
                <p className={`mt-1.5 text-center text-xs font-medium leading-tight
                  ${idx === currentStepIdx ? "text-amber-700" : idx < currentStepIdx ? "text-amber-500" : "text-gray-400"}`}
                >
                  {STEP_LABELS[step]}
                </p>
              </div>
            ))}
          </div>
          {/* 현재 상태 텍스트 */}
          <p className="mt-4 text-center text-base font-semibold text-gray-800">
            현재: {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ?? order.status}
          </p>
        </div>
      )}

      {/* 주문 정보 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-gray-900">주문 정보</h2>
        <div className="space-y-1.5 text-sm text-gray-700">
          {order.order_items.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span>{item.product_name} × {item.quantity}</span>
              <span>{formatPrice(item.line_total)}</span>
            </div>
          ))}
          {order.delivery_fee > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>배달비</span>
              <span>{formatPrice(order.delivery_fee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 font-semibold text-amber-700">
            <span>합계</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>
        {order.delivery_address && (
          <p className="mt-3 text-sm text-gray-500">
            배달 주소: {order.delivery_address.street} {order.delivery_address.detail}
          </p>
        )}
        {order.memo && (
          <p className="mt-1 text-sm text-gray-500">메모: {order.memo}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">{formatDateTime(order.created_at)}</p>
      </div>
    </div>
  )
}
