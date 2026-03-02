/**
 * GET /api/inventory — 전체 재고 목록
 *
 * 모든 상품의 현재 재고 수량을 반환한다.
 *
 * **인증 불필요 이유:** 관리자 페이지에서 SSR(서버 컴포넌트)로 직접 repo를 호출하는 방식과 달리,
 * 이 API는 주로 외부 시스템(키오스크 등)에서 재고 확인용으로 사용한다.
 * 민감 정보가 아니므로 Public으로 유지 중 (변경 필요 시 requireRole 추가).
 *
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/inventory GET
 */
import { NextResponse } from "next/server"
import { inventoryRepo } from "@/lib/db"

export async function GET() {
  try {
    const data = await inventoryRepo.findAll()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
