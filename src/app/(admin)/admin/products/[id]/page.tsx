export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { productRepo } from "@/lib/db"
import { ProductForm } from "@/components/admin/ProductForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    productRepo.findById(id).catch((err: unknown) => { console.error("[EditProductPage] findById error:", err); return null }),
    productRepo.findCategories(false).catch((err: unknown) => { console.error("[EditProductPage] findCategories error:", err); return [] }),
  ])

  if (!product) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700">
          ← 상품 목록
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">상품 수정</h1>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <ProductForm categories={categories} product={product} />
      </div>
    </div>
  )
}
