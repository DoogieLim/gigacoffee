"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getPersonalizedRecommendations } from "@/actions/recommendation.actions"
import { ProductCard } from "@/components/menu/ProductCard"
import type { Product } from "@/types/product.types"

export function RecommendationBanner() {
  const { getUser } = useAuth()
  const [recommendations, setRecommendations] = useState<Product[]>([])

  useEffect(() => {
    getUser()
      .then((user) => {
        if (!user?.id) return
        return getPersonalizedRecommendations(user.id)
      })
      .then((recs) => {
        if (recs) setRecommendations(recs)
      })
      .catch(() => {})
  }, [getUser])

  if (recommendations.length === 0) return null

  return (
    <div className="mb-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
        당신을 위한 추천
      </p>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {recommendations.map((product) => (
          <div key={product.id} className="w-36 flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}
