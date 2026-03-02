"use client"

import { useState } from "react"
import Link from "next/link"
import { formatPrice } from "@/lib/utils/format"
import { normalizeImageUrl } from "@/lib/utils/image"
import { useCartStore } from "@/stores/cartStore"
import { ProductOptionModal } from "./ProductOptionModal"
import type { Product } from "@/types/product.types"
import type { CartItem } from "@/types/order.types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [modalOpen, setModalOpen] = useState(false)

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if ((product.options ?? []).length > 0) {
      setModalOpen(true)
    } else {
      addItem({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: 1,
        options: [],
        image_url: product.image_url,
      })
    }
  }

  function handleModalAdd(item: Omit<CartItem, "itemKey">) {
    addItem(item)
  }

  return (
    <>
      <Link
        href={`/menu/${product.id}`}
        data-testid="product-card"
        className="group relative flex flex-col items-center p-3 transition-transform active:scale-95"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-[2.5rem] bg-neutral-100 shadow-premium">
          {product.image_url ? (
            <img
              src={normalizeImageUrl(product.image_url) || product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">☕</div>
          )}

          {/* Quick Add Button - Touch Friendly FAB style */}
          <button
            onClick={handleAddToCart}
            disabled={!product.is_available}
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-colors hover:bg-brand/90 disabled:bg-neutral-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>

          {!product.is_available && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <span className="rounded-full bg-neutral-900 px-3 py-1 text-[10px] font-black uppercase text-white">
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-col items-center text-center px-1">
          <h3 className="text-xs font-bold text-neutral-900 line-clamp-1 leading-tight">{product.name}</h3>
          <p className="mt-1 text-sm font-black text-brand">
            {formatPrice(product.price)}
          </p>
          {(product.options ?? []).length > 0 && (
            <p className="mt-0.5 text-[10px] text-neutral-400">옵션 선택 가능</p>
          )}
        </div>
      </Link>

      {modalOpen && (
        <ProductOptionModal
          product={product}
          onClose={() => setModalOpen(false)}
          onAdd={handleModalAdd}
        />
      )}
    </>
  )
}
