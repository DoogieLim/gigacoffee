import type { Metadata } from "next"
import { CartSummary } from "@/components/order/CartSummary"

export const metadata: Metadata = { title: "장바구니 - GigaCoffee" }

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">장바구니</h1>
      <CartSummary />
    </div>
  )
}
