import Link from "next/link"
import { productRepo } from "@/lib/db"
import { formatPrice } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"

export default async function AdminProductsPage() {
  const products = await productRepo.findAll()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
        <Link href="/admin/products/new">
          <Button size="sm">상품 추가</Button>
        </Link>
      </div>
      <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="px-6 py-3 font-medium">상품명</th>
              <th className="px-6 py-3 font-medium">카테고리</th>
              <th className="px-6 py-3 font-medium">가격</th>
              <th className="px-6 py-3 font-medium">판매 상태</th>
              <th className="px-6 py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-3 text-gray-600">{product.category?.name ?? "-"}</td>
                <td className="px-6 py-3 text-gray-600">{formatPrice(product.price)}</td>
                <td className="px-6 py-3">
                  <Badge variant={product.is_available ? "success" : "danger"}>
                    {product.is_available ? "판매중" : "품절"}
                  </Badge>
                </td>
                <td className="px-6 py-3">
                  <Link href={`/admin/products/${product.id}`}>
                    <Button variant="ghost" size="sm">수정</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
