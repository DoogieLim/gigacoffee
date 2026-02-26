"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils/format"
import { normalizeImageUrl } from "@/lib/utils/image"
import { useCartStore } from "@/stores/cartStore"
import { Spinner } from "@/components/ui/Spinner"
import type { Product } from "@/types/product.types"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) {
          throw new Error("상품을 찾을 수 없습니다")
        }
        const data = await res.json()
        setProduct(data.data)
      } catch (err) {
        setError(String(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (product) {
      addItem({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity,
        options: [],
        image_url: product.image_url,
      })
      router.push("/order")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          <p>{error || "상품을 찾을 수 없습니다"}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 text-amber-700 hover:underline"
        >
          ← 뒤로가기
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 text-amber-700 hover:underline"
      >
        ← 뒤로가기
      </button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* 이미지 */}
        <div className="flex items-center justify-center">
          {product.image_url ? (
            <img
              src={normalizeImageUrl(product.image_url) || product.image_url}
              alt={product.name}
              className="max-w-sm rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-96 w-full items-center justify-center rounded-lg bg-gray-100 text-6xl">
              ☕
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {product.category && (
            <p className="mt-2 text-sm text-gray-500">{product.category.name}</p>
          )}

          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-lg text-gray-600">{product.description}</p>
          </div>

          {!product.is_available && (
            <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-yellow-800">
              품절된 상품입니다
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-500">가격</p>
            <p className="mt-2 text-3xl font-bold text-amber-700">
              {formatPrice(product.price)}
            </p>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-gray-300">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-lg"
              >
                −
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-lg"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.is_available}
            className="mt-8 w-full rounded-lg bg-amber-700 py-4 text-lg font-medium text-white transition-colors hover:bg-amber-800 disabled:bg-gray-300 disabled:text-gray-500"
          >
            장바구니에 담기
          </button>

          <button
            onClick={() => router.push("/menu")}
            className="mt-3 w-full rounded-lg border border-gray-300 py-4 text-lg font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            계속 쇼핑하기
          </button>
        </div>
      </div>
    </div>
  )
}
