"use client"

import Image from "next/image"
import { formatPrice } from "@/lib/utils/format"
import { normalizeImageUrl } from "@/lib/utils/image"
import { useCartStore } from "@/stores/cartStore"
import type { CartItem as CartItemType } from "@/types/order.types"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()
  const itemTotal = (item.price + item.options.reduce((s, o) => s + o.price_delta, 0)) * item.quantity

  const imageUrl = normalizeImageUrl(item.image_url)

  return (
    <div className="flex gap-3 py-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {imageUrl ? (
          <Image src={imageUrl} alt={item.product_name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl">☕</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex justify-between">
          <p className="font-medium text-gray-900">{item.product_name}</p>
          <button
            onClick={() => removeItem(item.itemKey)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {item.options.length > 0 && (
          <p className="text-xs text-gray-500">
            {item.options.map((o) => `${o.name}: ${o.choice}`).join(", ")}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
          <p className="text-sm font-semibold text-amber-700">{formatPrice(itemTotal)}</p>
        </div>
      </div>
    </div>
  )
}
