"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"
import { createOrder } from "@/actions/order.actions"
import { formatPrice } from "@/lib/utils/format"
import { ROUTES } from "@/lib/constants/routes"
import type { DeliveryType } from "@/types/order.types"

const KIOSK_OPTIONS: { type: Extract<DeliveryType, "dine-in" | "pickup">; label: string; description: string; emoji: string }[] = [
  { type: "dine-in", label: "매장에서 먹기", description: "자리에 앉아 편하게 즐기세요", emoji: "🪑" },
  { type: "pickup", label: "테이크아웃", description: "포장하여 가지고 가세요", emoji: "🛍" },
]

export default function KioskCheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart, setDeliveryType } = useCartStore()
  const [orderType, setOrderType] = useState<"dine-in" | "pickup">("dine-in")
  const [memo, setMemo] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const itemTotal = getTotal()

  async function handleOrder() {
    setIsLoading(true)
    try {
      setDeliveryType(orderType)
      await createOrder({
        items,
        memo,
        delivery_type: orderType,
        delivery_fee: 0,
      })
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
          className="w-full rounded-2xl bg-amber-500 py-6 text-2xl font-bold text-gray-900 transition-colors hover:bg-amber-400 disabled:bg-gray-700 disabled:text-gray-500 active:scale-95"
        >
          {isLoading ? "주문 중..." : `주문하기 (${formatPrice(itemTotal)})`}
        </button>
      </div>
    </div>
  )
}
