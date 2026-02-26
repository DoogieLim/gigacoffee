"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { updateOrderStatus } from "@/actions/order.actions"
import { OrderTable } from "@/components/admin/OrderTable"
import type { Order } from "@/types/order.types"

interface OrdersClientProps {
  initialOrders: Order[]
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)

  useEffect(() => {
    // Realtime 구독만 담당 (초기 데이터는 서버에서 받음)
    const supabase = createClient()
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setOrders((prev) => [payload.new as Order, ...prev])
        } else if (payload.eventType === "UPDATE") {
          setOrders((prev) =>
            prev.map((o) => (o.id === (payload.new as Order).id ? (payload.new as Order) : o))
          )
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function handleStatusChange(orderId: string, status: Order["status"]) {
    await updateOrderStatus(orderId, status)
  }

  return <OrderTable orders={orders} onStatusChange={handleStatusChange} />
}
