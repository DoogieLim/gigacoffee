"use client"

import { useEffect, useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { updateOrderStatus } from "@/actions/order.actions"
import { formatDateTime, formatPrice } from "@/lib/utils/format"

type DeliveryOrder = {
  id: string
  status: string
  delivery_type: string
  delivery_address: { street?: string; detail?: string } | null
  total_amount: number
  created_at: string
  order_items: { product_name: string; quantity: number }[]
}

interface Props {
  initialOrders: DeliveryOrder[]
}

export function RiderClient({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders)
  const [pending, startTransition] = useTransition()
  const [completingId, setCompletingId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("rider-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "gigacoffee",
          table: "orders",
        },
        (payload) => {
          const updated = payload.new as DeliveryOrder
          if (payload.eventType === "UPDATE") {
            if (updated.status === "out_for_delivery") {
              // 새로 배달 중 상태가 된 주문 추가
              setOrders((prev) => {
                const exists = prev.find((o) => o.id === updated.id)
                if (exists) return prev.map((o) => o.id === updated.id ? { ...o, ...updated } : o)
                return [{ ...updated, order_items: [] }, ...prev]
              })
            } else {
              // 완료/취소된 주문 제거
              setOrders((prev) => prev.filter((o) => o.id !== updated.id))
            }
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  function handleComplete(orderId: string) {
    setCompletingId(orderId)
    startTransition(async () => {
      await updateOrderStatus(orderId, "completed")
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
      setCompletingId(null)
    })
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="text-3xl">🛵</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">라이더 화면</h1>
          <p className="text-sm text-gray-500">배달 중인 주문을 도착 완료 처리하세요</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-500">현재 배달 중인 주문이 없습니다</p>
          <p className="mt-1 text-xs text-gray-400">새 배달 주문이 들어오면 자동으로 표시됩니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-purple-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-mono font-semibold text-gray-700">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                    {order.delivery_type === "robot" ? "🤖 로봇배달" : "🛵 라이더"}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{formatDateTime(order.created_at)}</span>
              </div>

              {order.order_items.length > 0 && (
                <p className="mb-2 text-sm text-gray-600">
                  {order.order_items.map((i) => `${i.product_name} ×${i.quantity}`).join(", ")}
                </p>
              )}

              {order.delivery_address && (
                <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  <span className="mr-1 text-gray-400">📍</span>
                  {order.delivery_address.street} {order.delivery_address.detail}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-700">{formatPrice(order.total_amount)}</span>
                <button
                  onClick={() => handleComplete(order.id)}
                  disabled={pending && completingId === order.id}
                  className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {pending && completingId === order.id ? "처리 중..." : "✅ 도착 완료"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
