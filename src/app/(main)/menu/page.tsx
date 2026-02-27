"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { ProductGrid } from "@/components/menu/ProductGrid"
import { CategoryFilterClient } from "@/components/menu/CategoryFilterClient"
import { Spinner } from "@/components/ui/Spinner"
import type { Product, Category } from "@/types/product.types"

export default function MenuPage() {
  const searchParams = useSearchParams()
  const categoryId = searchParams.get("categoryId")

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 카테고리 목록은 한 번만 로드
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []))
      .catch(() => {})
  }, [])

  // 일반 상품 목록 로드 (검색어 없을 때)
  useEffect(() => {
    if (searchQuery.trim()) return

    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch(`/api/products${categoryId ? `?categoryId=${categoryId}` : ""}`)
        if (!res.ok) throw new Error("데이터 조회 실패")
        const data = await res.json()
        setProducts(data.data || [])
      } catch (err) {
        setError(`메뉴 로드 실패: ${String(err)}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [categoryId, searchQuery])

  // 자연어 검색 (디바운스 300ms)
  useEffect(() => {
    const q = searchQuery.trim()
    if (!q) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        setIsSearching(true)
        setError(null)
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`)
        if (!res.ok) throw new Error("검색 실패")
        const data = await res.json()
        setProducts(data.data || [])
      } catch (err) {
        setError(`검색 실패: ${String(err)}`)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  const showSpinner = searchQuery.trim() ? isSearching : isLoading

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">메뉴</h1>

      {/* AI 자연어 검색 입력 */}
      <div className="mb-4 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="AI 검색: '시원한 음료', '달콤한 디저트' 등으로 찾아보세요"
          className="w-full border border-border-warm bg-white px-4 py-3 pr-10 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 rounded-lg"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="검색 초기화"
          >
            ×
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 카테고리 필터는 검색 중이 아닐 때만 표시 */}
      {!searchQuery.trim() && (
        <div className="mb-6">
          <CategoryFilterClient categories={categories} selectedId={categoryId} />
        </div>
      )}

      {searchQuery.trim() && !isSearching && (
        <p className="mb-4 text-sm text-gray-500">
          &ldquo;{searchQuery}&rdquo; 검색 결과 {products.length}개
        </p>
      )}

      {showSpinner ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}
