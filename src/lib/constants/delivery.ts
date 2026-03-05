/**
 * HMG 푸시 템플릿 기반 배달 상태 정의
 *
 * 로봇 배달: pRO001~pRO007
 * 라이더 배달: pRI001~pRI006
 * 매장 픽업: pRO008~pRO009
 */

import type { RobotDeliveryStatus, RiderDeliveryStatus } from "@/types/order.types"

// ── 로봇 배달 상태 흐름 ──
export const ROBOT_DELIVERY_STEPS: RobotDeliveryStatus[] = [
  "robot_order_accepted",    // pRO001 주문 접수 완료
  "robot_delivery_started",  // pRO002 배달 시작
  "robot_arriving_soon",     // pRO003 배달 도착 예정
  "robot_pickup_requested",  // pRO004 수령 요청 (도착)
  "robot_completed",         // 수령 완료
]

// 분기 상태 (정상 흐름에서 벗어나는 경우)
export const ROBOT_BRANCH_STATUSES: RobotDeliveryStatus[] = [
  "robot_pickup_delayed",    // pRO005 수령 지연
  "robot_returning",         // pRO006 배달 회수
  "robot_cancelled",         // pRO007 주문 취소
]

// ── 라이더 배달 상태 흐름 ──
export const RIDER_DELIVERY_STEPS: RiderDeliveryStatus[] = [
  "rider_assigned",          // 라이더 배정
  "rider_picked_up",         // 매장 픽업 완료
  "rider_delivering",        // 배달 중
  "rider_arriving_soon",     // 도착 예정
  "rider_arrived",           // 도착
  "rider_completed",         // 수령 완료
]

export const RIDER_BRANCH_STATUSES: RiderDeliveryStatus[] = [
  "rider_cancelled",         // 취소
]

// ── 상태 라벨 ──
export const ROBOT_STATUS_LABELS: Record<RobotDeliveryStatus, string> = {
  robot_order_accepted: "주문 접수 완료",
  robot_delivery_started: "로봇 배달 시작",
  robot_arriving_soon: "로봇 도착 예정",
  robot_pickup_requested: "수령 요청",
  robot_pickup_delayed: "수령 지연",
  robot_returning: "물품 회수 중",
  robot_cancelled: "주문 취소",
  robot_completed: "수령 완료",
}

export const RIDER_STATUS_LABELS: Record<RiderDeliveryStatus, string> = {
  rider_assigned: "라이더 배정",
  rider_picked_up: "매장 픽업 완료",
  rider_delivering: "배달 중",
  rider_arriving_soon: "도착 예정",
  rider_arrived: "도착",
  rider_cancelled: "취소",
  rider_completed: "배달 완료",
}

// ── 상태 색상 ──
export const ROBOT_STATUS_COLORS: Record<RobotDeliveryStatus, string> = {
  robot_order_accepted: "bg-blue-100 text-blue-800",
  robot_delivery_started: "bg-indigo-100 text-indigo-800",
  robot_arriving_soon: "bg-purple-100 text-purple-800",
  robot_pickup_requested: "bg-amber-100 text-amber-800",
  robot_pickup_delayed: "bg-orange-100 text-orange-800",
  robot_returning: "bg-red-100 text-red-800",
  robot_cancelled: "bg-red-100 text-red-800",
  robot_completed: "bg-green-100 text-green-800",
}

export const RIDER_STATUS_COLORS: Record<RiderDeliveryStatus, string> = {
  rider_assigned: "bg-blue-100 text-blue-800",
  rider_picked_up: "bg-indigo-100 text-indigo-800",
  rider_delivering: "bg-purple-100 text-purple-800",
  rider_arriving_soon: "bg-violet-100 text-violet-800",
  rider_arrived: "bg-amber-100 text-amber-800",
  rider_cancelled: "bg-red-100 text-red-800",
  rider_completed: "bg-green-100 text-green-800",
}

// ── HMG 푸시 템플릿 ──
export interface DeliveryPushTemplate {
  code: string
  category: string
  title: string
  body: string
  variables: string[]
}

export const ROBOT_PUSH_TEMPLATES: Record<RobotDeliveryStatus, DeliveryPushTemplate> = {
  robot_order_accepted: {
    code: "pRO001",
    category: "ROBOT_ORDER",
    title: "로봇 주문이 접수됐어요",
    body: "약 {{min}}분 내 배송 예정입니다\n* 인증번호 : {{pin}}",
    variables: ["min", "pin"],
  },
  robot_delivery_started: {
    code: "pRO002",
    category: "ROBOT_ORDER",
    title: "로봇이 배송을 시작했어요",
    body: "",
    variables: [],
  },
  robot_arriving_soon: {
    code: "pRO003",
    category: "ROBOT_ORDER",
    title: "로봇이 곧 도착해요",
    body: "지정된 수령장소로 와주세요\n* 수령장소 : {{dest}}",
    variables: ["dest"],
  },
  robot_pickup_requested: {
    code: "pRO004",
    category: "ROBOT_ORDER",
    title: "로봇이 수령 장소에 도착했어요",
    body: "빠른 수령 부탁드립니다\n* 인증번호 : {{pin}}",
    variables: ["pin"],
  },
  robot_pickup_delayed: {
    code: "pRO005",
    category: "ROBOT_ORDER",
    title: "로봇이 물품 수령을 기다리고 있어요",
    body: "{{min}}분 내 미수령시 물품이 회수됩니다.\n* 수령장소 : {{dest}}\n* 인증번호 : {{pin}}",
    variables: ["min", "dest", "pin"],
  },
  robot_returning: {
    code: "pRO006",
    category: "ROBOT_ORDER",
    title: "수령 시간 초과로 물품 회수중이에요",
    body: "회수 완료 후 매장에서 직접 수령 가능합니다.",
    variables: [],
  },
  robot_cancelled: {
    code: "pRO007",
    category: "ROBOT_ORDER",
    title: "로봇 주문이 취소되었습니다",
    body: "매장 사정으로 인해 접수가 취소되었습니다.\n매장으로 문의하시기 바랍니다.",
    variables: [],
  },
  robot_completed: {
    code: "pRO004_DONE",
    category: "ROBOT_ORDER",
    title: "수령이 완료되었습니다",
    body: "이용해 주셔서 감사합니다.",
    variables: [],
  },
}

export const RIDER_PUSH_TEMPLATES: Record<RiderDeliveryStatus, DeliveryPushTemplate> = {
  rider_assigned: {
    code: "pRI001",
    category: "RIDER_ORDER",
    title: "라이더가 배정되었어요",
    body: "곧 매장에서 픽업 후 출발합니다.",
    variables: [],
  },
  rider_picked_up: {
    code: "pRI002",
    category: "RIDER_ORDER",
    title: "라이더가 매장에서 픽업했어요",
    body: "배달이 곧 시작됩니다.",
    variables: [],
  },
  rider_delivering: {
    code: "pRI003",
    category: "RIDER_ORDER",
    title: "라이더가 배달 중이에요",
    body: "약 {{min}}분 내 도착 예정입니다.",
    variables: ["min"],
  },
  rider_arriving_soon: {
    code: "pRI004",
    category: "RIDER_ORDER",
    title: "라이더가 곧 도착해요",
    body: "수령 장소에서 기다려주세요.",
    variables: [],
  },
  rider_arrived: {
    code: "pRI005",
    category: "RIDER_ORDER",
    title: "라이더가 도착했어요",
    body: "빠른 수령 부탁드립니다.",
    variables: [],
  },
  rider_cancelled: {
    code: "pRI006",
    category: "RIDER_ORDER",
    title: "라이더 배달이 취소되었습니다",
    body: "매장으로 문의하시기 바랍니다.",
    variables: [],
  },
  rider_completed: {
    code: "pRI007",
    category: "RIDER_ORDER",
    title: "배달이 완료되었습니다",
    body: "이용해 주셔서 감사합니다.",
    variables: [],
  },
}

// ── 아이콘 매핑 ──
export const ROBOT_STATUS_ICONS: Record<RobotDeliveryStatus, string> = {
  robot_order_accepted: "clipboard-check",
  robot_delivery_started: "truck",
  robot_arriving_soon: "map-pin",
  robot_pickup_requested: "bell",
  robot_pickup_delayed: "clock",
  robot_returning: "rotate-ccw",
  robot_cancelled: "x-circle",
  robot_completed: "check-circle",
}

export const RIDER_STATUS_ICONS: Record<RiderDeliveryStatus, string> = {
  rider_assigned: "user-check",
  rider_picked_up: "package",
  rider_delivering: "truck",
  rider_arriving_soon: "map-pin",
  rider_arrived: "bell",
  rider_cancelled: "x-circle",
  rider_completed: "check-circle",
}
