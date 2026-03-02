"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useCartStore } from "@/stores/cartStore"
import { createOrder } from "@/actions/order.actions"
import { getStoreDeliverySettings } from "@/actions/delivery.actions"
import { requestPayment } from "@/lib/portone/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { AddressInput } from "@/components/order/AddressInput"
import { formatPrice } from "@/lib/utils/format"
import { ROUTES } from "@/lib/constants/routes"
import type { DeliverySetting, DeliveryType } from "@/types/order.types"
import type { PortoneEasyPayProvider } from "@/lib/portone/types"

const DELIVERY_OPTIONS: { type: DeliveryType; label: string; description: string }[] = [
  { type: "pickup", label: "픽업", description: "매장에서 직접 수령" },
  { type: "robot", label: "로봇배달", description: "자율주행 로봇이 배달" },
  { type: "rider", label: "라이더 배달", description: "전문 라이더가 배달" },
]

type PayMethod = "CARD" | "KAKAOPAY"

const PAY_METHODS: { method: PayMethod; label: string; icon: string; description: string }[] = [
  { method: "CARD", label: "신용/체크카드", icon: "💳", description: "국내외 모든 카드" },
  { method: "KAKAOPAY", label: "카카오페이", icon: "💛", description: "카카오페이 간편결제" },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart, deliveryType, deliveryAddress, setDeliveryType, currentStoreId } = useCartStore()
  const [memo, setMemo] = useState("")
  const [payMethod, setPayMethod] = useState<PayMethod>("CARD")
  const [isLoading, setIsLoading] = useState(false)
  const [deliverySettings, setDeliverySettings] = useState<DeliverySetting[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userPhone, setUserPhone] = useState<string | undefined>()
  const [inputPhone, setInputPhone] = useState("")
  const [userId, setUserId] = useState<string | undefined>()

  useEffect(() => {
    if (currentStoreId) getStoreDeliverySettings(currentStoreId).then(setDeliverySettings)
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user
      if (!user) { setIsLoggedIn(false); return }
      setIsLoggedIn(true)
      setUserId(user.id)
      setUserEmail(user.email ?? "")
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, phone")
        .eq("id", user.id)
        .single()
      setUserName((profile as { name?: string; phone?: string | null } | null)?.name ?? user.email ?? "")
      setUserPhone((profile as { name?: string; phone?: string | null } | null)?.phone ?? undefined)
    })
  }, [currentStoreId])

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

  const effectivePhone = userPhone || inputPhone

  async function handleOrder() {
    if (deliveryType !== "pickup" && !deliveryAddress) {
      alert("배달 주소를 입력해주세요.")
      return
    }
    if (!effectivePhone) {
      alert("주문 알림(문자·카카오톡·푸시) 발송을 위해 휴대폰 번호를 입력해주세요.")
      return
    }
    const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/
    if (!phoneRegex.test(effectivePhone.replace(/-/g, ""))) {
      alert("올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)")
      return
    }
    setIsLoading(true)
    try {
      // 신규 입력된 전화번호를 프로필에 저장
      if (!userPhone && inputPhone && userId) {
        const supabase = createClient()
        await supabase.from("profiles").update({ phone: inputPhone }).eq("id", userId)
      }

      // 1) 주문 생성 (status='pending')
      const order = await createOrder({
        items,
        memo,
        delivery_type: deliveryType,
        delivery_address: deliveryAddress ?? undefined,
        delivery_fee: deliveryFee,
        store_id: currentStoreId ?? undefined,
      })

      // 2) PortOne 결제 요청
      const paymentResult = await requestPayment({
        paymentId: order.id,
        orderName: `GigaCoffee 주문 (${items.length}건)`,
        totalAmount: grandTotal,
        payMethod: payMethod === "KAKAOPAY" ? "EASY_PAY" : "CARD",
        easyPayProvider: payMethod === "KAKAOPAY" ? "KAKAOPAY" as PortoneEasyPayProvider : undefined,
        customerName: userName,
        customerEmail: userEmail,
        customerPhone: effectivePhone,
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
          delivery_type: deliveryType,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "결제 검증에 실패했습니다.")
      }

      clearCart()
      router.push(`${ROUTES.ORDER_COMPLETE}?orderId=${order.id}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : "결제에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    router.push(ROUTES.ORDER)
    return null
  }

  if (isLoggedIn === false) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-4 text-5xl">🔒</div>
        <h2 className="text-xl font-bold text-gray-900">로그인이 필요합니다</h2>
        <p className="mt-2 text-sm text-gray-500">주문하려면 로그인해주세요.<br />장바구니는 로그인 후에도 그대로 유지됩니다.</p>
        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={() => router.push(`${ROUTES.LOGIN}?from=${ROUTES.ORDER_CHECKOUT}`)} className="w-full">
            로그인
          </Button>
          <Button variant="outline" onClick={() => router.push(`${ROUTES.REGISTER}?from=${ROUTES.ORDER_CHECKOUT}`)} className="w-full">
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

        {/* 배달 주소 입력 */}
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

        {/* 연락처 (전화번호 미등록 시 입력 요구) */}
        {!userPhone && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-1 text-xs font-medium text-amber-800">
              휴대폰 번호 입력 <span className="text-red-500">*필수</span>
            </p>
            <p className="mb-3 text-xs text-amber-700">
              주문 알림(문자·카카오톡·푸시)을 받으려면 번호가 필요합니다.
            </p>
            <Input
              type="tel"
              value={inputPhone}
              onChange={(e) => setInputPhone(e.target.value)}
              placeholder="010-1234-5678"
            />
          </div>
        )}

        {/* 요청사항 */}
        <Input
          label="요청사항 (선택)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예) 얼음 많이, 설탕 적게"
        />

        {/* 결제 수단 선택 */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-3 text-xs font-medium text-neutral-500">결제 수단</p>
          <div className="grid grid-cols-2 gap-2">
            {PAY_METHODS.map(({ method, label, icon, description }) => {
              const selected = payMethod === method
              return (
                <button
                  key={method}
                  onClick={() => setPayMethod(method)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-4 text-center transition-all ${
                    selected
                      ? "border-brand bg-brand/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className={`text-sm font-semibold ${selected ? "text-brand" : "text-gray-900"}`}>
                    {label}
                  </span>
                  <span className="text-xs text-gray-400">{description}</span>
                </button>
              )
            })}
          </div>
        </div>

        <Button size="lg" onClick={handleOrder} isLoading={isLoading} className="w-full">
          {formatPrice(grandTotal)} 결제하기
        </Button>
      </div>
    </div>
  )
}
