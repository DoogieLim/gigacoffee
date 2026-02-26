"use client"

import { formatDateTime, formatPrice } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"
import { ORDER_STATUS_LABELS } from "@/lib/constants/payment"
import type { Order } from "@/types/order.types"

interface OrderTableProps {
  orders: Order[]
  onStatusChange?: (orderId: string, status: Order["status"]) => void
}

const statusVariant: Record<Order["status"], "default" | "info" | "warning" | "success" | "danger"> = {
  pending: "warning",
  paid: "info",
  preparing: "warning",
  ready: "success",
  completed: "default",
  cancelled: "danger",
}

export function OrderTable({ orders, onStatusChange }: OrderTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-3 pr-4 font-medium">주문번호</th>
            <th className="pb-3 pr-4 font-medium">주문시각</th>
            <th className="pb-3 pr-4 font-medium">금액</th>
            <th className="pb-3 pr-4 font-medium">상태</th>
            {onStatusChange && <th className="pb-3 font-medium">변경</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="py-3 pr-4 font-mono text-xs text-gray-600">{order.id.slice(0, 8)}...</td>
              <td className="py-3 pr-4 text-gray-600">{formatDateTime(order.created_at)}</td>
              <td className="py-3 pr-4 font-semibold">{formatPrice(order.total_amount)}</td>
              <td className="py-3 pr-4">
                <Badge variant={statusVariant[order.status]}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </td>
              {onStatusChange && (
                <td className="py-3">
                  <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value as Order["status"])}
                    className="rounded border border-gray-300 px-2 py-1 text-xs"
                  >
                    {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
