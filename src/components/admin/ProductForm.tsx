"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { createProduct, updateProduct, deleteProduct } from "@/actions/product.actions"
import type { Product, Category } from "@/types/product.types"

interface ProductFormProps {
  categories: Category[]
  product?: Product
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product

  const [name, setName] = useState(product?.name ?? "")
  const [categoryId, setCategoryId] = useState(product?.category_id ?? (categories[0]?.id ?? ""))
  const [price, setPrice] = useState(String(product?.price ?? ""))
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !price || !categoryId) {
      setError("상품명, 카테고리, 가격은 필수입니다.")
      return
    }
    setIsLoading(true)
    setError("")
    try {
      const data = {
        categoryId,
        name: name.trim(),
        price: parseInt(price),
        imageUrl: imageUrl.trim() || null,
        description: description.trim() || null,
        isAvailable,
      }
      if (isEdit) {
        await updateProduct(product.id, data)
      } else {
        await createProduct(data)
      }
      router.push("/admin/products")
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm("이 상품을 삭제하시겠습니까?")) return
    setIsDeleting(true)
    try {
      await deleteProduct(product!.id)
      router.push("/admin/products")
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.")
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <Input
        label="상품명"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="아메리카노"
        required
      />

      <Select
        label="카테고리"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        options={categoryOptions}
      />

      <Input
        label="가격 (원)"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="4500"
        min="0"
        required
      />

      <Input
        label="이미지 URL (선택)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://..."
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-widest text-ink-secondary">
          설명 (선택)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="상품 설명을 입력하세요"
          rows={3}
          className="w-full border border-border-warm bg-white px-3 py-2.5 text-sm text-ink rounded-none placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-600"
        />
        <span className="text-sm text-gray-700">판매 중 (체크 해제 시 품절 처리)</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {isEdit ? "수정 완료" : "상품 추가"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/products")}
        >
          취소
        </Button>
        {isEdit && (
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            삭제
          </Button>
        )}
      </div>
    </form>
  )
}
