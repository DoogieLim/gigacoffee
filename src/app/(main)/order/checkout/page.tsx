"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useCartStore } from "@/stores/cartStore"
import { createOrder } from "@/actions/order.actions"
import { getDeliverySettings } from "@/actions/delivery.actions"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { AddressInput } from "@/components/order/AddressInput"
import { formatPrice } from "@/lib/utils/format"
import { ROUTES } from "@/lib/constants/routes"
import type { DeliverySetting, DeliveryType } from "@/types/order.types"

const DELIVERY_OPTIONS: { type: DeliveryType; label: string; description: string }[] = [
  { type: "pickup", label: "픽업", description: "매장에서 직접 수령" },
  { type: "robot", label: "로봇배달", description: "자율주행 로봇이 배달" },
  { type: "rider", label: "라이더 배달", description: "전문 라이더가 배달" },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart, deliveryType, deliveryAddress, setDeliveryType } = useCartStore()
  const [memo, setMemo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [deliverySettings, setDeliverySettings] = useState<DeliverySetting[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    getDeliverySettings().then(setDeliverySettings)
    // 로그인 상태 확인
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user))
  }, [])

  function getDeliveryFee(type: DeliveryType): number {
    if (type === "pickup") return 0
    const setting = deliverySettings.find((s) => s.type === type)
    return setting?.fee ?? 0
  }

  function isDeliveryEnabled(type: DeliveryType): boolean {
    if (type === "pickup") return true
    const setting = deliverySettings.find((s) => s.type === type)
    return setting?.is_enabled ?? false
  }

  const deliveryFee = getDeliveryFee(deliveryType)
  const itemTotal = getTotal()
  const grandTotal = itemTotal + deliveryFee

  async function handleOrder() {
    if (deliveryType !== "pickup" && !deliveryAddress) {
      alert("배달 주소를 입력해주세요.")
      return
    }
    setIsLoading(true)
    try {
      await createOrder({
        items,
        memo,
        delivery_type: deliveryType,
        delivery_address: deliveryAddress ?? undefined,
        delivery_fee: deliveryFee,
      })
      clearCart()
      router.push(ROUTES.ORDER_COMPLETE)
    } catch (error) {
      alert(error instanceof Error ? error.message : "주문에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    router.push(ROUTES.ORDER)
    return null
  }

  // 비로그인 상태 → 로그인 유도
  if (isLoggedIn === false) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-4 text-5xl">🔒</div>
        <h2 className="text-xl font-bold text-gray-900">로그인이 필요합니다</h2>
        <p className="mt-2 text-sm text-gray-500">주문하려면 로그인해주세요.<br />장바구니는 로그인 후에도 그대로 유지됩니다.</p>
        <div className="mt-8 flex flex-col gap-3">
          <Button
            onClick={() => router.push(`${ROUTES.LOGIN}?from=${ROUTES.ORDER_CHECKOUT}`)}
            className="w-full"
          >
            로그인
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`${ROUTES.REGISTER}?from=${ROUTES.ORDER_CHECKOUT}`)}
            className="w-full"
          >
            회원가입
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">주문 확인</h1>
      <div className="flex flex-col gap-4">

        {/* 수령 방법 선택 */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-3 text-xs font-medium text-neutral-500">수령 방법 선택</p>
          <div className="flex flex-col gap-2">
            {DELIVERY_OPTIONS.map((option) => {
              const enabled = isDeliveryEnabled(option.type)
              const fee = getDeliveryFee(option.type)
              const selected = deliveryType === option.type
              return (
                <button
                  key={option.type}
                  disabled={!enabled}
                  onClick={() => enabled && setDeliveryType(option.type)}
                  className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all ${
                    selected
                      ? "border-brand bg-brand/5"
                      : enabled
                        ? "border-gray-200 hover:border-gray-300"
                        : "cursor-not-allowed border-gray-100 opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      selected ? "border-brand bg-brand" : "border-gray-300"
                    }`}>
                      {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${selected ? "text-brand" : "text-gray-900"}`}>
                        {option.label}{!enabled && " (일시 중단)"}
                      </p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${selected ? "text-brand" : "text-gray-700"}`}>
                    {fee === 0 ? "무료" : formatPrice(fee)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 배달 주소 입력 (배달 유형일 때만) */}
        {deliveryType !== "pickup" && (
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="mb-3 text-xs font-medium text-neutral-500">배달 주소</p>
            <AddressInput />
          </div>
        )}

        {/* 주문 상품 목록 */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="mb-3 text-xs font-medium text-neutral-500">주문 상품</p>
          {items.map((item) => (
            <div key={item.product_id} className="flex justify-between py-1.5 text-sm">
              <span>{item.product_name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="mt-3 space-y-1.5 border-t pt-3">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>상품 금액</span>
              <span>{formatPrice(itemTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-600">
              <span>배달비</span>
              <span>{deliveryFee === 0 ? "무료" : formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>최종 결제금액</span>
              <span className="text-amber-700">{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>

        <Input
          label="요청사항 (선택)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예) 얼음 많이, 설탕 적게"
        />

        <Button size="lg" onClick={handleOrder} isLoading={isLoading} className="w-full">
          주문하기 ({formatPrice(grandTotal)})
        </Button>
      </div>
    </div>
  )
}
