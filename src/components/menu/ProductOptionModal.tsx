"use client"

import { useState, useEffect } from "react"
import { formatPrice } from "@/lib/utils/format"
import type { Product, SelectedOption } from "@/types/product.types"
import type { CartItem } from "@/types/order.types"

interface ProductOptionModalProps {
  product: Product
  onClose: () => void
  onAdd: (item: Omit<CartItem, "itemKey">) => void
}

export function ProductOptionModal({ product, onClose, onAdd }: ProductOptionModalProps) {
  // 각 옵션의 선택된 choice index (기본: 첫 번째)
  const [selected, setSelected] = useState<Record<number, number>>(() =>
    Object.fromEntries((product.options ?? []).map((_, i) => [i, 0]))
  )
  const [quantity, setQuantity] = useState(1)

  // 배경 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  const optionsDelta = (product.options ?? []).reduce((sum, opt, i) => {
    const choiceIdx = selected[i] ?? 0
    return sum + (opt.choices[choiceIdx]?.price_delta ?? 0)
  }, 0)
  const unitPrice = product.price + optionsDelta
  const totalPrice = unitPrice * quantity

  function handleAdd() {
    const selectedOptions: SelectedOption[] = (product.options ?? []).map((opt, i) => {
      const choiceIdx = selected[i] ?? 0
      const choice = opt.choices[choiceIdx]
      return {
        name: opt.name,
        choice: choice.label,
        price_delta: choice.price_delta,
      }
    })
    onAdd({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity,
      options: selectedOptions,
      image_url: product.image_url,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 모달 패널 */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">{product.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">기본가 {formatPrice(product.price)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 옵션 목록 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {(product.options ?? []).map((opt, optIdx) => (
            <div key={optIdx}>
              <p className="text-sm font-semibold text-gray-800 mb-2">{opt.name}</p>
              <div className="flex flex-wrap gap-2">
                {opt.choices.map((choice, choiceIdx) => {
                  const isSelected = selected[optIdx] === choiceIdx
                  return (
                    <button
                      key={choiceIdx}
                      type="button"
                      onClick={() => setSelected((prev) => ({ ...prev, [optIdx]: choiceIdx }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        isSelected
                          ? "bg-brand text-white border-brand"
                          : "bg-white text-gray-700 border-gray-300 hover:border-brand"
                      }`}
                    >
                      {choice.label}
                      {choice.price_delta !== 0 && (
                        <span className="ml-1 text-xs opacity-80">
                          {choice.price_delta > 0 ? "+" : ""}
                          {formatPrice(choice.price_delta)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* 수량 */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">수량</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-brand hover:text-brand transition-colors"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-bold text-gray-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-brand hover:text-brand transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 푸터: 합계 + 담기 버튼 */}
        <div className="px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleAdd}
            className="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm hover:bg-brand/90 transition-colors flex items-center justify-center gap-2"
          >
            <span>장바구니 담기</span>
            <span className="opacity-90">{formatPrice(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
