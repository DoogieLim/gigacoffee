"use client"

import { useState } from "react"
import { updateDeliveryStatus } from "@/actions/delivery-sim.actions"
import { useToastStore } from "@/stores/toastStore"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { formatDateTime, formatPrice } from "@/lib/utils/format"
import {
  ROBOT_DELIVERY_STEPS,
  ROBOT_BRANCH_STATUSES,
  RIDER_DELIVERY_STEPS,
  RIDER_BRANCH_STATUSES,
  ROBOT_STATUS_LABELS,
  RIDER_STATUS_LABELS,
  ROBOT_STATUS_COLORS,
  RIDER_STATUS_COLORS,
  ROBOT_PUSH_TEMPLATES,
  RIDER_PUSH_TEMPLATES,
  type DeliveryPushTemplate,
} from "@/lib/constants/delivery"
import type { Order, DeliveryStatus } from "@/types/order.types"

interface Props {
  initialOrders: Order[]
}

export function DeliverySimClient({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { addToast } = useToastStore()

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null
  const isRobot = selectedOrder?.delivery_type === "robot"
  const isRider = selectedOrder?.delivery_type === "rider"

  const steps = isRobot ? ROBOT_DELIVERY_STEPS : isRider ? RIDER_DELIVERY_STEPS : []
  const branchStatuses = isRobot ? ROBOT_BRANCH_STATUSES : isRider ? RIDER_BRANCH_STATUSES : []
  const statusLabels = isRobot ? ROBOT_STATUS_LABELS : RIDER_STATUS_LABELS
  const statusColors = isRobot ? ROBOT_STATUS_COLORS : RIDER_STATUS_COLORS
  const pushTemplates: Record<string, DeliveryPushTemplate> = isRobot ? ROBOT_PUSH_TEMPLATES : RIDER_PUSH_TEMPLATES

  const currentStatus = selectedOrder?.delivery_status as DeliveryStatus | null
  const currentStepIdx = currentStatus ? steps.indexOf(currentStatus as never) : -1

  async function handleStatusChange(status: DeliveryStatus) {
    if (!selectedOrderId) return
    setLoading(true)
    try {
      const updated = await updateDeliveryStatus(selectedOrderId, status)
      setOrders((prev) => prev.map((o) => (o.id === selectedOrderId ? { ...o, ...updated } : o)))
      addToast(`배달 상태가 "${statusLabels[status as keyof typeof statusLabels]}"(으)로 변경되었습니다.`, "success")
    } catch {
      addToast("상태 변경에 실패했습니다.", "error")
    } finally {
      setLoading(false)
    }
  }

  const currentTemplate = currentStatus
    ? pushTemplates[currentStatus] ?? null
    : null

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      {/* 주문 목록 */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="font-semibold text-gray-900">배달 주문 목록</h2>
        </div>
        <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-50">
          {orders.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-gray-400">
              배달 주문이 없습니다.<br />
              로봇 또는 라이더 배달로 주문을 생성해보세요.
            </div>
          ) : (
            orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                  selectedOrderId === order.id ? "bg-amber-50 border-l-4 border-amber-500" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-gray-500">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <Badge variant={order.delivery_type === "robot" ? "warning" : "default"}>
                    {order.delivery_type === "robot" ? "로봇" : "라이더"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{formatPrice(order.total_amount)}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(order.created_at)}</span>
                </div>
                {order.delivery_status && (
                  <div className="mt-1">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      (isRobot ? ROBOT_STATUS_COLORS : RIDER_STATUS_COLORS)[
                        order.delivery_status as keyof typeof statusColors
                      ] ?? "bg-gray-100 text-gray-600"
                    }`}>
                      {(isRobot ? ROBOT_STATUS_LABELS : RIDER_STATUS_LABELS)[
                        order.delivery_status as keyof typeof statusLabels
                      ] ?? order.delivery_status}
                    </span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* 시뮬레이터 패널 */}
      {selectedOrder ? (
        <div className="space-y-6">
          {/* 주문 요약 */}
          <div className="rounded-xl bg-white shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                주문 #{selectedOrder.id.slice(0, 8).toUpperCase()}
              </h2>
              <Badge variant={isRobot ? "warning" : "default"}>
                {isRobot ? "로봇 배달" : "라이더 배달"}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">금액</p>
                <p className="font-semibold">{formatPrice(selectedOrder.total_amount)}</p>
              </div>
              <div>
                <p className="text-gray-500">주문 상태</p>
                <p className="font-semibold">{selectedOrder.status}</p>
              </div>
              <div>
                <p className="text-gray-500">인증번호</p>
                <p className="font-mono font-semibold">{selectedOrder.robot_pin ?? "-"}</p>
              </div>
            </div>
          </div>

          {/* 상태 진행 타임라인 */}
          <div className="rounded-xl bg-white shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">배달 진행 상태</h3>
            <div className="relative">
              {steps.map((step, idx) => {
                const isActive = idx === currentStepIdx
                const isDone = idx < currentStepIdx
                const isFuture = idx > currentStepIdx
                const label = statusLabels[step as keyof typeof statusLabels]
                const template = pushTemplates[step as keyof typeof pushTemplates]

                return (
                  <div key={step} className="flex items-start gap-4 mb-1 last:mb-0">
                    {/* 타임라인 도트 + 라인 */}
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                        isDone
                          ? "bg-green-500 border-green-500 text-white"
                          : isActive
                            ? "bg-amber-500 border-amber-500 text-white ring-4 ring-amber-100"
                            : "bg-white border-gray-200 text-gray-400"
                      }`}>
                        {isDone ? "\u2713" : idx + 1}
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`w-0.5 h-8 ${isDone ? "bg-green-300" : "bg-gray-200"}`} />
                      )}
                    </div>

                    {/* 내용 + 버튼 */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${isActive ? "text-amber-700" : isDone ? "text-green-700" : "text-gray-400"}`}>
                            {label}
                          </p>
                          {template && (
                            <p className="text-xs text-gray-400 mt-0.5">{template.code}</p>
                          )}
                        </div>
                        {isFuture && !loading && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(step as DeliveryStatus)}
                          >
                            이 상태로 변경
                          </Button>
                        )}
                        {isActive && (
                          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                            현재 상태
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 분기 상태 (취소/회수 등) */}
            {branchStatuses.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">예외 상태</h4>
                <div className="flex flex-wrap gap-2">
                  {branchStatuses.map((status) => {
                    const label = statusLabels[status as keyof typeof statusLabels]
                    const color = statusColors[status as keyof typeof statusColors]
                    const isCurrentBranch = currentStatus === status
                    return (
                      <button
                        key={status}
                        onClick={() => !loading && handleStatusChange(status as DeliveryStatus)}
                        disabled={loading || isCurrentBranch}
                        className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                          isCurrentBranch
                            ? `${color} ring-2 ring-offset-1`
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        } disabled:opacity-50`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 푸시 알림 미리보기 */}
          {currentTemplate && (
            <div className="rounded-xl bg-white shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">푸시 알림 미리보기</h3>
              <div className="rounded-2xl bg-gray-900 p-4 text-white max-w-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-md bg-amber-500 flex items-center justify-center text-[10px] font-bold">G</div>
                  <span className="text-xs text-gray-400">GigaCoffee</span>
                  <span className="text-xs text-gray-500 ml-auto">지금</span>
                </div>
                <p className="text-sm font-semibold mb-1">{currentTemplate.title}</p>
                {currentTemplate.body && (
                  <p className="text-xs text-gray-300 whitespace-pre-line">
                    {currentTemplate.body
                      .replace("{{min}}", "15")
                      .replace("{{pin}}", selectedOrder.robot_pin ?? "1234")
                      .replace("{{dest}}", "3층 로비")}
                  </p>
                )}
                <div className="mt-2 flex gap-1">
                  <span className="rounded bg-gray-700 px-2 py-0.5 text-[10px] text-gray-300">
                    {currentTemplate.code}
                  </span>
                  <span className="rounded bg-gray-700 px-2 py-0.5 text-[10px] text-gray-300">
                    {currentTemplate.category}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-white shadow-sm flex items-center justify-center p-12">
          <div className="text-center">
            <div className="text-6xl mb-4 opacity-30">
              {"\uD83D\uDE97"}
            </div>
            <p className="text-gray-500">왼쪽에서 배달 주문을 선택하세요</p>
          </div>
        </div>
      )}
    </div>
  )
}
