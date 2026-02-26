import type { PaymentMethod } from "@/types/order.types"

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: "신용/체크카드",
  kakao_pay: "카카오페이",
  naver_pay: "네이버페이",
  toss: "토스",
  bank_transfer: "무통장입금",
}

export const ORDER_STATUS_LABELS = {
  pending: "결제 대기",
  paid: "결제 완료",
  preparing: "준비 중",
  ready: "픽업 가능",
  completed: "완료",
  cancelled: "취소됨",
} as const

export const ORDER_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
} as const
