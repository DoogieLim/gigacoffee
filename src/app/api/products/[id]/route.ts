import { NextRequest } from "next/server"
import { productRepo } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api/response"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await productRepo.findById(id)

    if (!product) {
      return apiError("상품을 찾을 수 없습니다", 404)
    }

    return apiSuccess(product)
  } catch (error) {
    return apiError(`상품 조회 실패: ${String(error)}`, 500)
  }
}
