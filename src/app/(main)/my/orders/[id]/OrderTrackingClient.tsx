"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ORDER_STATUS_LABELS } from "@/lib/constants/payment"
import {
  ROBOT_DELIVERY_STEPS,
  RIDER_DELIVERY_STEPS,
  ROBOT_STATUS_LABELS,
  RIDER_STATUS_LABELS,
  ROBOT_PUSH_TEMPLATES,
  RIDER_PUSH_TEMPLATES,
  type DeliveryPushTemplate,
} from "@/lib/constants/delivery"
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
  delivery_status: string | null
  robot_pin: string | null
  order_items: { product_name: string; quantity: number; line_total: number }[]
}

const PICKUP_STEPS = ["paid", "preparing", "ready", "completed"] as const
const BASIC_DELIVERY_STEPS = ["paid", "preparing", "out_for_delivery", "completed"] as const

const STEP_LABELS: Record<string, string> = {
  paid: "접수 완료",
  preparing: "제작 중",
  ready: "픽업 가능",
  out_for_delivery: "배달 중",
  completed: "완료",
}

const STEP_ICONS: Record<string, string> = {
  paid: "\u2705",
  preparing: "\u2615",
  ready: "\uD83D\uDECD\uFE0F",
  out_for_delivery: "\uD83D\uDEF5",
  completed: "\uD83C\uDF89",
}

interface Props {
  initialOrder: TrackingOrder
}

export function OrderTrackingClient({ initialOrder }: Props) {
  const [order, setOrder] = useState(initialOrder)
  const isRobot = order.delivery_type === "robot"
  const isRider = order.delivery_type === "rider"
  const isDelivery = isRobot || isRider
  const hasDeliveryStatus = isDelivery && order.delivery_status

  const basicSteps = isDelivery ? BASIC_DELIVERY_STEPS : PICKUP_STEPS
  const currentStepIdx = order.status === "cancelled"
    ? -1
    : (basicSteps as readonly string[]).indexOf(order.status)

  // HMG 배달 세부 상태
  const deliverySteps = isRobot ? ROBOT_DELIVERY_STEPS : isRider ? RIDER_DELIVERY_STEPS : []
  const deliveryLabels = isRobot ? ROBOT_STATUS_LABELS : RIDER_STATUS_LABELS
  const deliveryTemplates: Record<string, DeliveryPushTemplate> = isRobot ? ROBOT_PUSH_TEMPLATES : RIDER_PUSH_TEMPLATES
  const deliveryStepIdx = hasDeliveryStatus
    ? deliverySteps.indexOf(order.delivery_status as never)
    : -1

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
          setOrder((prev) => ({
            ...prev,
            status: payload.new.status,
            delivery_status: payload.new.delivery_status,
            robot_pin: payload.new.robot_pin,
          }))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [order.id])

  const currentDeliveryTemplate = hasDeliveryStatus
    ? deliveryTemplates[order.delivery_status!] ?? null
    : null

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">주문 추적</h1>
      <p className="mb-6 text-sm text-gray-500">#{order.id.slice(0, 8).toUpperCase()}</p>

      {/* 기본 주문 상태 */}
      {order.status === "cancelled" ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-lg font-semibold text-red-700">주문이 취소되었습니다</p>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border border-border-subtle bg-white p-5 shadow-premium">
          <div className="flex items-start justify-between">
            {basicSteps.map((step, idx) => (
              <div key={step} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {idx > 0 && (
                    <div className={`h-0.5 flex-1 ${idx <= currentStepIdx ? "bg-tech" : "bg-gray-200"}`} />
                  )}
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-lg
                    ${idx < currentStepIdx ? "bg-tech" :
                      idx === currentStepIdx ? "bg-tech ring-4 ring-blue-100" :
                      "bg-gray-100"}`}
                  >
                    {idx <= currentStepIdx ? STEP_ICONS[step] : (
                      <span className="text-sm text-gray-400">{idx + 1}</span>
                    )}
                  </div>
                  {idx < basicSteps.length - 1 && (
                    <div className={`h-0.5 flex-1 ${idx < currentStepIdx ? "bg-tech" : "bg-gray-200"}`} />
                  )}
                </div>
                <p className={`mt-1.5 text-center text-xs font-medium leading-tight
                  ${idx === currentStepIdx ? "text-brand" : idx < currentStepIdx ? "text-tech" : "text-gray-400"}`}
                >
                  {STEP_LABELS[step]}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-base font-semibold text-gray-800">
            현재: {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ?? order.status}
          </p>
        </div>
      )}

      {/* HMG 배달 세부 상태 (로봇/라이더) */}
      {isDelivery && order.status !== "cancelled" && (
        <div className="mb-6 rounded-2xl border border-border-subtle bg-white p-5 shadow-premium">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              {isRobot ? "\uD83E\uDD16 로봇 배달 현황" : "\uD83D\uDEF5 라이더 배달 현황"}
            </h2>
            {order.robot_pin && (
              <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-mono font-bold text-brand">
                PIN: {order.robot_pin}
              </span>
            )}
          </div>

          {!hasDeliveryStatus ? (
            <p className="text-sm text-gray-400 text-center py-4">
              아직 배달이 시작되지 않았습니다.
            </p>
          ) : (
            <div className="space-y-0">
              {deliverySteps.map((step, idx) => {
                const isDone = idx < deliveryStepIdx
                const isActive = idx === deliveryStepIdx
                const label = deliveryLabels[step as keyof typeof deliveryLabels]

                return (
                  <div key={step} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDone
                          ? "bg-green-500 text-white"
                          : isActive
                            ? "bg-tech text-white ring-2 ring-blue-200"
                            : "bg-gray-100 text-gray-400"
                      }`}>
                        {isDone ? "\u2713" : idx + 1}
                      </div>
                      {idx < deliverySteps.length - 1 && (
                        <div className={`w-0.5 h-6 ${isDone ? "bg-green-300" : "bg-gray-200"}`} />
                      )}
                    </div>
                    <div className="pb-3 flex-1">
                      <p className={`text-sm font-medium ${
                        isActive ? "text-brand" : isDone ? "text-green-700" : "text-gray-400"
                      }`}>
                        {label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {currentDeliveryTemplate && currentDeliveryTemplate.body && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-800 mb-1">{currentDeliveryTemplate.title}</p>
              <p className="text-xs text-gray-500 whitespace-pre-line">
                {currentDeliveryTemplate.body
                  .replace("{{min}}", "15")
                  .replace("{{pin}}", order.robot_pin ?? "----")
                  .replace("{{dest}}", "지정 수령장소")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 주문 정보 */}
      <div className="rounded-2xl border border-border-subtle bg-white p-4 shadow-premium">
        <h2 className="mb-3 font-semibold text-gray-900">주문 정보</h2>
        <div className="space-y-1.5 text-sm text-gray-700">
          {order.order_items.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span>{item.product_name} &times; {item.quantity}</span>
              <span>{formatPrice(item.line_total)}</span>
            </div>
          ))}
          {order.delivery_fee > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>배달비</span>
              <span>{formatPrice(order.delivery_fee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 font-semibold text-brand">
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
