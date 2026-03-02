"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { createProduct, updateProduct, deleteProduct } from "@/actions/product.actions"
import type { Product, Category, ProductOption } from "@/types/product.types"

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
  const [options, setOptions] = useState<ProductOption[]>(product?.options ?? [])
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  function addOption() {
    setOptions((prev) => [...prev, { name: "", choices: [{ label: "", price_delta: 0 }] }])
  }

  function removeOption(optIdx: number) {
    setOptions((prev) => prev.filter((_, i) => i !== optIdx))
  }

  function updateOptionName(optIdx: number, value: string) {
    setOptions((prev) =>
      prev.map((opt, i) => (i === optIdx ? { ...opt, name: value } : opt))
    )
  }

  function addChoice(optIdx: number) {
    setOptions((prev) =>
      prev.map((opt, i) =>
        i === optIdx
          ? { ...opt, choices: [...opt.choices, { label: "", price_delta: 0 }] }
          : opt
      )
    )
  }

  function removeChoice(optIdx: number, choiceIdx: number) {
    setOptions((prev) =>
      prev.map((opt, i) =>
        i === optIdx
          ? { ...opt, choices: opt.choices.filter((_, ci) => ci !== choiceIdx) }
          : opt
      )
    )
  }

  function updateChoiceLabel(optIdx: number, choiceIdx: number, value: string) {
    setOptions((prev) =>
      prev.map((opt, i) =>
        i === optIdx
          ? {
              ...opt,
              choices: opt.choices.map((c, ci) =>
                ci === choiceIdx ? { ...c, label: value } : c
              ),
            }
          : opt
      )
    )
  }

  function updateChoicePriceDelta(optIdx: number, choiceIdx: number, value: string) {
    const parsed = parseInt(value) || 0
    setOptions((prev) =>
      prev.map((opt, i) =>
        i === optIdx
          ? {
              ...opt,
              choices: opt.choices.map((c, ci) =>
                ci === choiceIdx ? { ...c, price_delta: parsed } : c
              ),
            }
          : opt
      )
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !price || !categoryId) {
      setError("상품명, 카테고리, 가격은 필수입니다.")
      return
    }
    // 옵션 유효성 검사: 이름 또는 선택지 label이 빈 경우
    for (const opt of options) {
      if (!opt.name.trim()) {
        setError("옵션명을 입력해주세요.")
        return
      }
      for (const choice of opt.choices) {
        if (!choice.label.trim()) {
          setError("선택지 이름을 입력해주세요.")
          return
        }
      }
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
        options,
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

      {/* 옵션 관리 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-widest text-ink-secondary">
            주문 옵션 (선택)
          </label>
          <button
            type="button"
            onClick={addOption}
            className="text-xs text-brand hover:text-brand/80 font-medium"
          >
            + 옵션 추가
          </button>
        </div>

        {options.length === 0 && (
          <p className="text-xs text-ink-muted">옵션이 없습니다. 온도, 사이즈 등을 추가할 수 있습니다.</p>
        )}

        {options.map((opt, optIdx) => (
          <div key={optIdx} className="border border-border-warm rounded p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={opt.name}
                onChange={(e) => updateOptionName(optIdx, e.target.value)}
                placeholder="옵션명 (예: 온도, 사이즈)"
                className="flex-1 border border-border-warm bg-white px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
              />
              <button
                type="button"
                onClick={() => removeOption(optIdx)}
                className="text-gray-400 hover:text-red-500 text-lg leading-none px-1"
                aria-label="옵션 삭제"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-1.5 pl-2">
              {opt.choices.map((choice, choiceIdx) => (
                <div key={choiceIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={choice.label}
                    onChange={(e) => updateChoiceLabel(optIdx, choiceIdx, e.target.value)}
                    placeholder="선택지 (예: HOT, ICE)"
                    className="flex-1 border border-border-warm bg-white px-2 py-1 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/15"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-ink-muted">+</span>
                    <input
                      type="number"
                      value={choice.price_delta}
                      onChange={(e) => updateChoicePriceDelta(optIdx, choiceIdx, e.target.value)}
                      onFocus={(e) => e.target.select()}
                      step={500}
                      min={0}
                      className="w-20 border border-border-warm bg-white px-2 py-1 text-sm text-ink text-right focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/15"
                    />
                    <span className="text-xs text-ink-muted">원</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeChoice(optIdx, choiceIdx)}
                    disabled={opt.choices.length <= 1}
                    className="text-gray-400 hover:text-red-500 disabled:opacity-30 text-base leading-none px-0.5"
                    aria-label="선택지 삭제"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addChoice(optIdx)}
                className="self-start text-xs text-gray-500 hover:text-brand mt-0.5"
              >
                + 선택지 추가
              </button>
            </div>
          </div>
        ))}
      </div>

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
