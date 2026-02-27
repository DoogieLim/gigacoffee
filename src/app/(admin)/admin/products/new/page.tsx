import Link from "next/link"
import { productRepo } from "@/lib/db"
import { ProductForm } from "@/components/admin/ProductForm"

export default async function NewProductPage() {
  const categories = await productRepo.findCategories(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700">
          ← 상품 목록
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">상품 추가</h1>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}
