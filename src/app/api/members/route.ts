import { NextRequest } from "next/server"
import { memberRepo } from "@/lib/db"
import { requireRole } from "@/lib/api/auth"
import { apiSuccess, apiError } from "@/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    // admin 권한 필요
    await requireRole(request, ["admin"])

    const members = await memberRepo.findAll()
    return apiSuccess(members)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return apiError(`회원 조회 실패: ${String(error)}`, 500)
  }
}
