import { NextRequest } from "next/server"
import { productRepo } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    const categories = await productRepo.findCategories(true)
    return apiSuccess(categories)
  } catch (error) {
    return apiError(`카테고리 조회 실패: ${String(error)}`, 500)
  }
}
