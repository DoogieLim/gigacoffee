"use client"

import Link from "next/link"
import { useCartStore } from "@/stores/cartStore"
import { CartItem } from "./CartItem"
import { Button } from "@/components/ui/Button"
import { formatPrice } from "@/lib/utils/format"
import { ROUTES } from "@/lib/constants/routes"

export function CartSummary() {
  const { items, getTotal } = useCartStore()
  const total = getTotal()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-gray-500">
        <span className="text-5xl">🛒</span>
        <p>장바구니가 비어있습니다.</p>
        <Link href={ROUTES.MENU}>
          <Button variant="outline">메뉴 보러가기</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <CartItem key={item.product_id} item={item} />
        ))}
      </div>
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">상품 금액</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
          <span>총 결제금액</span>
          <span className="text-amber-700">{formatPrice(total)}</span>
        </div>
      </div>
      <Link href={ROUTES.ORDER_CHECKOUT}>
        <Button className="w-full" size="lg">
          주문하기 ({formatPrice(total)})
        </Button>
      </Link>
    </div>
  )
}
