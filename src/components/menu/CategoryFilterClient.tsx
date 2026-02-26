"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils/cn"
import type { Category } from "@/types/product.types"

interface CategoryFilterClientProps {
  categories: Category[]
  selectedId: string | null
}

export function CategoryFilterClient({ categories, selectedId }: CategoryFilterClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSelect = (id: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (id) {
      params.set("categoryId", id)
    } else {
      params.delete("categoryId")
    }
    router.push(`/menu?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => handleSelect(null)}
        className={cn(
          "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          selectedId === null
            ? "bg-amber-700 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        )}
      >
        전체
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelect(cat.id)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            selectedId === cat.id
              ? "bg-amber-700 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
