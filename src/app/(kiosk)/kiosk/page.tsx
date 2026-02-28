"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"
import { formatPrice } from "@/lib/utils/format"
import { normalizeImageUrl } from "@/lib/utils/image"
import type { Product, Category } from "@/types/product.types"

export default function KioskMenuPage() {
  const router = useRouter()
  const cartItemCount = useCartStore((s) => s.items.length)
  const cartTotal = useCartStore((s) => s.getTotal())
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetch("/api/products").then((r) => r.json()), fetch("/api/categories").then((r) => r.json())])
      .then(([pRes, cRes]) => {
        setProducts(pRes.data ?? [])
        setCategories(cRes.data ?? [])
      })
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-800 bg-gray-900 px-4 py-3">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            !selectedCategory ? "bg-amber-500 text-gray-900" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              selectedCategory === cat.id
                ? "bg-amber-500 text-gray-900"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 상품 그리드 */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 lg:grid-cols-4">
            {filtered.filter((p) => p.is_available).map((product) => (
              <button
                key={product.id}
                onClick={() => router.push(`/kiosk/${product.id}`)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 transition-all hover:border-amber-400 hover:shadow-lg hover:shadow-amber-900/20 active:scale-95"
              >
                <div className="flex aspect-square items-center justify-center bg-gray-800 text-5xl">
                  {product.image_url ? (
                    <img
                      src={normalizeImageUrl(product.image_url) || product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "☕"
                  )}
                </div>
                <div className="p-3 text-left">
                  <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                  <p className="mt-1 text-sm font-bold text-amber-400">{formatPrice(product.price)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 하단 장바구니 바 */}
      {cartItemCount > 0 && (
        <div className="border-t border-gray-800 bg-gray-900 p-4">
          <button
            onClick={() => router.push("/kiosk/checkout")}
            className="flex w-full items-center justify-between rounded-2xl bg-amber-500 px-6 py-4 text-gray-900 transition-colors hover:bg-amber-400 active:scale-95"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-amber-400">
              {cartItemCount}
            </span>
            <span className="text-lg font-bold">장바구니 확인</span>
            <span className="text-lg font-bold">{formatPrice(cartTotal)}</span>
          </button>
        </div>
      )}
    </div>
  )
}
