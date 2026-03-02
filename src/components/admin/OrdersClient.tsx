"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { updateOrderStatus } from "@/actions/order.actions"
import { OrderTable } from "@/components/admin/OrderTable"
import { useToastStore } from "@/stores/toastStore"
import type { Order } from "@/types/order.types"

interface OrdersClientProps {
  initialOrders: Order[]
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [changingId, setChangingId] = useState<string | null>(null)
  const { addToast } = useToastStore()

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "gigacoffee", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new as Order, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((o) => (o.id === (payload.new as Order).id ? (payload.new as Order) : o))
            )
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function handleStatusChange(orderId: string, status: Order["status"]) {
    setChangingId(orderId)
    try {
      await updateOrderStatus(orderId, status)
      // Realtime이 반영되지 않을 경우를 대비해 로컬 상태도 업데이트
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      )
      addToast("주문 상태가 변경되었습니다.", "success")
    } catch {
      addToast("상태 변경에 실패했습니다.", "error")
    } finally {
      setChangingId(null)
    }
  }

  return (
    <OrderTable
      orders={orders}
      onStatusChange={handleStatusChange}
      changingId={changingId}
    />
  )
}
