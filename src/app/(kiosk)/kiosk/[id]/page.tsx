"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils/format"
import { normalizeImageUrl } from "@/lib/utils/image"
import { useCartStore } from "@/stores/cartStore"
import type { Product, SelectedOption } from "@/types/product.types"

export default function KioskProductPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const p: Product = data.data
        setProduct(p)
        const defaults: Record<string, string> = {}
        p.options?.forEach((opt) => {
          if (opt.choices.length > 0) defaults[opt.name] = opt.choices[0].label
        })
        setSelectedOptions(defaults)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  const optionTotal = product?.options?.reduce((sum, opt) => {
    const choice = opt.choices.find((c) => c.label === selectedOptions[opt.name])
    return sum + (choice?.price_delta ?? 0)
  }, 0) ?? 0

  const totalPrice = product ? (product.price + optionTotal) * quantity : 0

  function handleAddToCart() {
    if (!product) return
    const options: SelectedOption[] = product.options?.map((opt) => {
      const label = selectedOptions[opt.name] ?? opt.choices[0]?.label ?? ""
      const choice = opt.choices.find((c) => c.label === label)
      return { name: opt.name, choice: label, price_delta: choice?.price_delta ?? 0 }
    }) ?? []

    addItem({ product_id: product.id, product_name: product.name, price: product.price, quantity, options, image_url: product.image_url })
    router.push("/kiosk")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <button onClick={() => router.back()} className="mb-6 text-sm text-gray-400 hover:text-amber-400">
        ← 뒤로
      </button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* 이미지 */}
        <div className="flex items-center justify-center rounded-2xl bg-gray-900 p-8 text-8xl">
          {product.image_url ? (
            <img src={normalizeImageUrl(product.image_url) || product.image_url} alt={product.name} className="max-h-64 rounded-xl object-cover" />
          ) : "☕"}
        </div>

        {/* 정보 */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-white">{product.name}</h1>
          {product.description && (
            <p className="mt-3 text-sm leading-relaxed text-gray-400">{product.description}</p>
          )}

          {/* 옵션 선택 */}
          {product.options && product.options.length > 0 && (
            <div className="mt-6 space-y-4">
              {product.options.map((opt) => (
                <div key={opt.name}>
                  <p className="mb-2 text-sm font-medium text-gray-300">{opt.name}</p>
                  <div className="flex gap-3">
                    {opt.choices.map((choice) => {
                      const selected = selectedOptions[opt.name] === choice.label
                      return (
                        <button
                          key={choice.label}
                          onClick={() => setSelectedOptions((prev) => ({ ...prev, [opt.name]: choice.label }))}
                          className={`rounded-xl px-6 py-3 text-base font-bold transition-all active:scale-95 ${
                            selected
                              ? "bg-amber-500 text-gray-900"
                              : "border border-gray-600 text-gray-300 hover:border-amber-400"
                          }`}
                        >
                          {choice.label}
                          {choice.price_delta !== 0 && (
                            <span className="ml-1 font-normal text-sm">
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

          <div className="mt-8 border-t border-gray-700 pt-6">
            <p className="text-4xl font-bold text-amber-400">{formatPrice(product.price + optionTotal)}</p>
          </div>

          {/* 수량 */}
          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center gap-4 rounded-xl border border-gray-600 px-2">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="py-3 px-3 text-2xl text-gray-300 hover:text-white">−</button>
              <span className="w-10 text-center text-xl font-bold text-white">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="py-3 px-3 text-2xl text-gray-300 hover:text-white">+</button>
            </div>
            <p className="text-gray-400">총 {formatPrice(totalPrice)}</p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.is_available}
            className="mt-8 w-full rounded-2xl bg-amber-500 py-5 text-xl font-bold text-gray-900 transition-colors hover:bg-amber-400 disabled:bg-gray-700 disabled:text-gray-500 active:scale-95"
          >
            담기
          </button>
        </div>
      </div>
    </div>
  )
}
