"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"
import { createOrder } from "@/actions/order.actions"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { formatPrice } from "@/lib/utils/format"
import { ROUTES } from "@/lib/constants/routes"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [memo, setMemo] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleOrder() {
    setIsLoading(true)
    try {
      await createOrder({ items, memo })
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

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">주문 확인</h1>
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-gray-200 p-4">
          {items.map((item) => (
            <div key={item.product_id} className="flex justify-between py-2 text-sm">
              <span>{item.product_name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
            <span>합계</span>
            <span className="text-amber-700">{formatPrice(getTotal())}</span>
          </div>
        </div>
        <Input
          label="요청사항 (선택)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예) 얼음 많이, 설탕 적게"
        />
        <Button size="lg" onClick={handleOrder} isLoading={isLoading} className="w-full">
          주문하기
        </Button>
      </div>
    </div>
  )
}
