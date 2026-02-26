"use client"

import { useState, useEffect } from "react"
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [catsRes, prodsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch(`/api/products${categoryId ? `?categoryId=${categoryId}` : ""}`),
        ])

        if (!catsRes.ok || !prodsRes.ok) {
          throw new Error("데이터 조회 실패")
        }

        const catsData = await catsRes.json()
        const prodsData = await prodsRes.json()

        setCategories(catsData.data || [])
        setProducts(prodsData.data || [])
      } catch (err) {
        setError(`메뉴 로드 실패: ${String(err)}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [categoryId])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">메뉴</h1>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <CategoryFilterClient categories={categories} selectedId={categoryId} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}
