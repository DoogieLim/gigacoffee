import { NextRequest } from "next/server"
import { productRepo } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId") || undefined

    const products = await productRepo.findAll({
      categoryId,
      availableOnly: true,
    })

    return apiSuccess(products)
  } catch (error) {
    return apiError(`상품 조회 실패: ${String(error)}`, 500)
  }
}
