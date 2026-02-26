"use client"

import Link from "next/link"
import { formatPrice } from "@/lib/utils/format"
import { normalizeImageUrl } from "@/lib/utils/image"
import { useCartStore } from "@/stores/cartStore"
import type { Product } from "@/types/product.types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)

  function handleAddToCart() {
    addItem({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
      options: [],
      image_url: product.image_url,
    })
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/menu/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.image_url ? (
            <img
              src={normalizeImageUrl(product.image_url) || product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">☕</div>
          )}
          {!product.is_available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700">
                품절
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <Link href={`/menu/${product.id}`}>
          <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
        </Link>
        <p className="mt-auto pt-2 text-sm font-semibold text-amber-700">
          {formatPrice(product.price)}
        </p>
        <button
          onClick={handleAddToCart}
          disabled={!product.is_available}
          className="mt-2 w-full rounded-lg bg-amber-700 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-800 disabled:bg-gray-200 disabled:text-gray-500 active:scale-95"
        >
          장바구니 담기
        </button>
      </div>
    </div>
  )
}
