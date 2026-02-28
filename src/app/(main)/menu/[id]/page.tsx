"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils/format"
import { normalizeImageUrl } from "@/lib/utils/image"
import { useCartStore } from "@/stores/cartStore"
import { Spinner } from "@/components/ui/Spinner"
import type { Product, SelectedOption } from "@/types/product.types"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) throw new Error("상품을 찾을 수 없습니다")
        const data = await res.json()
        const p: Product = data.data
        setProduct(p)
        // 옵션 기본값: 각 옵션의 첫 번째 선택지
        const defaults: Record<string, string> = {}
        p.options?.forEach((opt) => {
          if (opt.choices.length > 0) defaults[opt.name] = opt.choices[0].label
        })
        setSelectedOptions(defaults)
      } catch (err) {
        setError(String(err))
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const optionTotal = product?.options?.reduce((sum, opt) => {
    const choice = opt.choices.find((c) => c.label === selectedOptions[opt.name])
    return sum + (choice?.price_delta ?? 0)
  }, 0) ?? 0

  const totalPrice = product ? (product.price + optionTotal) * quantity : 0

  const handleAddToCart = () => {
    if (!product) return

    const options: SelectedOption[] = product.options?.map((opt) => {
      const label = selectedOptions[opt.name] ?? opt.choices[0]?.label ?? ""
      const choice = opt.choices.find((c) => c.label === label)
      return { name: opt.name, choice: label, price_delta: choice?.price_delta ?? 0 }
    }) ?? []

    addItem({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity,
      options,
      image_url: product.image_url,
    })
    router.push("/order")
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
        <button onClick={() => router.back()} className="mt-4 text-amber-700 hover:underline">
          ← 뒤로가기
        </button>
      </div>
    )
  }

  const hasOptions = product.options && product.options.length > 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button onClick={() => router.back()} className="mb-6 text-amber-700 hover:underline">
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

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-gray-600">{product.description}</p>
          )}

          {!product.is_available && (
            <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-yellow-800">
              품절된 상품입니다
            </div>
          )}

          {/* 옵션 선택 */}
          {hasOptions && (
            <div className="mt-6 space-y-4">
              {product.options.map((opt) => (
                <div key={opt.name}>
                  <p className="mb-2 text-sm font-medium text-gray-700">{opt.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {opt.choices.map((choice) => {
                      const selected = selectedOptions[opt.name] === choice.label
                      return (
                        <button
                          key={choice.label}
                          onClick={() =>
                            setSelectedOptions((prev) => ({ ...prev, [opt.name]: choice.label }))
                          }
                          className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all ${
                            selected
                              ? "border-amber-700 bg-amber-700 text-white"
                              : "border-gray-200 text-gray-700 hover:border-amber-300"
                          }`}
                        >
                          {choice.label}
                          {choice.price_delta !== 0 && (
                            <span className="ml-1 font-normal">
                              ({choice.price_delta > 0 ? "+" : ""}{formatPrice(choice.price_delta)})
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-500">가격</p>
            <p className="mt-2 text-3xl font-bold text-amber-700">
              {formatPrice(product.price + optionTotal)}
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
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-lg">
                +
              </button>
            </div>
            <p className="text-sm text-gray-500">총 {formatPrice(totalPrice)}</p>
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
