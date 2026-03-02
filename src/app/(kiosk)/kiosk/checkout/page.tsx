"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"
import { createOrder } from "@/actions/order.actions"
import { requestPayment } from "@/lib/portone/client"
import { formatPrice } from "@/lib/utils/format"
import { ROUTES } from "@/lib/constants/routes"
import type { DeliveryType } from "@/types/order.types"
import type { PortoneEasyPayProvider } from "@/lib/portone/types"

type KioskPayMethod = "CARD" | "KAKAOPAY"

const KIOSK_PAY_METHODS: { method: KioskPayMethod; label: string; emoji: string }[] = [
  { method: "CARD", label: "신용/체크카드", emoji: "💳" },
  { method: "KAKAOPAY", label: "카카오페이", emoji: "💛" },
]

const KIOSK_OPTIONS: { type: Extract<DeliveryType, "dine-in" | "pickup">; label: string; description: string; emoji: string }[] = [
  { type: "dine-in", label: "매장에서 먹기", description: "자리에 앉아 편하게 즐기세요", emoji: "🪑" },
  { type: "pickup", label: "테이크아웃", description: "포장하여 가지고 가세요", emoji: "🛍" },
]

export default function KioskCheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart, setDeliveryType } = useCartStore()
  const [orderType, setOrderType] = useState<"dine-in" | "pickup">("dine-in")
  const [memo, setMemo] = useState("")
  const [payMethod, setPayMethod] = useState<KioskPayMethod>("CARD")
  const [isLoading, setIsLoading] = useState(false)

  const itemTotal = getTotal()

  async function handleOrder() {
    setIsLoading(true)
    try {
      setDeliveryType(orderType)

      // 1) 주문 생성 (status='pending')
      const order = await createOrder({
        items,
        memo,
        delivery_type: orderType,
        delivery_fee: 0,
      })

      // 2) PortOne 결제 (키오스크: 매장 정보로 고객 정보 대체)
      const storePhone = process.env.NEXT_PUBLIC_STORE_PHONE ?? "01000000000"
      const paymentResult = await requestPayment({
        paymentId: order.id,
        orderName: `GigaCoffee 키오스크 주문 (${items.length}건)`,
        totalAmount: itemTotal,
        payMethod: payMethod === "KAKAOPAY" ? "EASY_PAY" : "CARD",
        easyPayProvider: payMethod === "KAKAOPAY" ? "KAKAOPAY" as PortoneEasyPayProvider : undefined,
        customerName: "기가커피 현장고객",
        customerPhone: storePhone,
      })

      // 3) 서버 검증 + 주문 상태 업데이트
      const res = await fetch("/api/payment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: paymentResult.paymentId,
          txId: paymentResult.txId,
          order_id: order.id,
          item_count: items.length,
          delivery_type: orderType,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "결제 검증에 실패했습니다.")
      }

      clearCart()
      router.push("/kiosk/complete")
    } catch (error) {
      alert(error instanceof Error ? error.message : "주문에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    router.push("/kiosk")
    return null
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <button onClick={() => router.back()} className="mb-6 text-sm text-gray-400 hover:text-amber-400">
        ← 메뉴로
      </button>

      <h1 className="mb-8 text-3xl font-bold text-white">주문 확인</h1>

      <div className="flex flex-col gap-6">
        {/* 주문 유형 선택 */}
        <div className="rounded-2xl border border-gray-700 bg-gray-900 p-6">
          <p className="mb-4 text-sm font-medium text-gray-400">이용 방법을 선택해주세요</p>
          <div className="grid grid-cols-2 gap-4">
            {KIOSK_OPTIONS.map((option) => {
              const selected = orderType === option.type
              return (
                <button
                  key={option.type}
                  onClick={() => setOrderType(option.type)}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 py-8 transition-all active:scale-95 ${
                    selected
                      ? "border-amber-400 bg-amber-400/10 text-amber-400"
                      : "border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  <span className="mb-3 text-5xl">{option.emoji}</span>
                  <p className="text-lg font-bold">{option.label}</p>
                  <p className="mt-1 text-xs opacity-70">{option.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* 주문 상품 */}
        <div className="rounded-2xl border border-gray-700 bg-gray-900 p-6">
          <p className="mb-4 text-sm font-medium text-gray-400">주문 상품</p>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium text-white">{item.product_name}</span>
                  {item.options.length > 0 && (
                    <span className="ml-2 text-gray-500">
                      ({item.options.map((o) => o.choice).join(", ")})
                    </span>
                  )}
                  <span className="ml-2 text-gray-400">× {item.quantity}</span>
                </div>
                <span className="font-semibold text-white">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-gray-700 pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span className="text-gray-300">합계</span>
              <span className="text-amber-400">{formatPrice(itemTotal)}</span>
            </div>
          </div>
        </div>

        {/* 결제 수단 */}
        <div className="rounded-2xl border border-gray-700 bg-gray-900 p-6">
          <p className="mb-4 text-sm font-medium text-gray-400">결제 수단</p>
          <div className="grid grid-cols-2 gap-4">
            {KIOSK_PAY_METHODS.map(({ method, label, emoji }) => {
              const selected = payMethod === method
              return (
                <button
                  key={method}
                  onClick={() => setPayMethod(method)}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 py-6 transition-all active:scale-95 ${
                    selected
                      ? "border-amber-400 bg-amber-400/10 text-amber-400"
                      : "border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  <span className="mb-2 text-4xl">{emoji}</span>
                  <p className="text-base font-bold">{label}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* 요청사항 */}
        <div className="rounded-2xl border border-gray-700 bg-gray-900 p-6">
          <p className="mb-3 text-sm font-medium text-gray-400">요청사항 (선택)</p>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예) 얼음 많이, 설탕 적게"
            className="w-full rounded-xl border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <button
          onClick={handleOrder}
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-amber-500 py-6 text-2xl font-bold text-gray-900 transition-colors hover:bg-amber-400 disabled:bg-gray-700 disabled:text-gray-500 active:scale-95"
        >
          {isLoading ? (
            <>
              <svg className="mr-3 h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              결제 중...
            </>
          ) : `${formatPrice(itemTotal)} 결제하기`}
        </button>
      </div>
    </div>
  )
}
