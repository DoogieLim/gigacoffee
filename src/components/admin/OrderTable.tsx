"use client"

import { formatDateTime, formatPrice } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"
import { ORDER_STATUS_LABELS } from "@/lib/constants/payment"
import type { Order, DeliveryType } from "@/types/order.types"

const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  "dine-in": "매장",
  pickup: "픽업",
  robot: "로봇배달",
  rider: "라이더",
}

const deliveryVariant: Record<DeliveryType, "default" | "info" | "warning" | "success"> = {
  "dine-in": "success",
  pickup: "default",
  robot: "info",
  rider: "warning",
}

const statusVariant: Record<Order["status"], "default" | "info" | "warning" | "success" | "danger"> = {
  pending: "warning",
  paid: "info",
  preparing: "warning",
  out_for_delivery: "info",
  ready: "success",
  completed: "default",
  cancelled: "danger",
}

function getStatusOptions(deliveryType: DeliveryType): Order["status"][] {
  if (deliveryType === "robot" || deliveryType === "rider") {
    return ["paid", "preparing", "out_for_delivery", "completed", "cancelled"]
  }
  return ["paid", "preparing", "ready", "completed", "cancelled"]
}

interface OrderTableProps {
  orders: Order[]
  onStatusChange?: (orderId: string, status: Order["status"]) => void
  changingId?: string | null
}

export function OrderTable({ orders, onStatusChange, changingId }: OrderTableProps) {
  if (orders.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">주문이 없습니다.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-gray-500">
            <th className="pb-3 pr-4 font-medium">주문번호</th>
            <th className="pb-3 pr-4 font-medium">시각</th>
            <th className="pb-3 pr-4 font-medium">유형</th>
            <th className="pb-3 pr-4 font-medium">주문 내역</th>
            <th className="pb-3 pr-4 font-medium">금액</th>
            <th className="pb-3 pr-4 font-medium">상태</th>
            {onStatusChange && <th className="pb-3 font-medium">상태 변경</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => {
            const deliveryType = (order.delivery_type ?? "pickup") as DeliveryType
            const isChanging = changingId === order.id
            const items = order.order_items ?? []

            return (
              <tr key={order.id} className={isChanging ? "opacity-60" : ""}>
                <td className="py-3 pr-4 font-mono text-xs text-gray-500">
                  {order.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">
                  {formatDateTime(order.created_at)}
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={deliveryVariant[deliveryType]}>
                    {DELIVERY_TYPE_LABELS[deliveryType]}
                  </Badge>
                </td>
                <td className="py-3 pr-4 max-w-[200px]">
                  {items.length > 0 ? (
                    <ul className="space-y-0.5">
                      {(items as { product_name: string; quantity: number }[]).map((item, i) => (
                        <li key={i} className="text-xs text-gray-700">
                          {item.product_name}
                          <span className="ml-1 text-gray-400">×{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                  {order.memo && (
                    <p className="mt-1 text-xs text-amber-600">요청: {order.memo}</p>
                  )}
                </td>
                <td className="py-3 pr-4 font-semibold whitespace-nowrap">
                  {formatPrice(order.total_amount)}
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={statusVariant[order.status]}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </td>
                {onStatusChange && (
                  <td className="py-3">
                    <select
                      value={order.status}
                      disabled={isChanging}
                      onChange={(e) => onStatusChange(order.id, e.target.value as Order["status"])}
                      className="rounded border border-gray-300 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {getStatusOptions(deliveryType).map((value) => (
                        <option key={value} value={value}>
                          {ORDER_STATUS_LABELS[value]}
                        </option>
                      ))}
                    </select>
                    {isChanging && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-400">
                        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        저장 중
                      </span>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
