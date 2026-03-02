/**
 * GET /api/members — 전체 회원 목록 (관리자 전용)
 *
 * 가입한 모든 회원의 프로필을 반환한다.
 * 개인정보가 포함되므로 admin 역할로만 제한된다.
 *
 * 인증: admin 역할 필요 (staff 제외)
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/members GET
 */
import { NextRequest } from "next/server"
import { memberRepo } from "@/lib/db"
import { requireRole } from "@/lib/api/auth"
import { apiSuccess, apiError } from "@/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    // admin 전용: 개인정보 포함으로 staff 접근 불가
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
