/**
 * GET /api/swagger — OpenAPI 3.0 스펙 JSON (admin 전용)
 *
 * OpenAPI 3.0 스펙을 JSON 형태로 반환한다.
 * Swagger UI(/api-docs)가 이 엔드포인트를 spec URL로 사용한다.
 *
 * **접근 제한:** API 문서는 내부 개발/운영 목적 전용이므로 admin 이상 역할이 필요하다.
 * 스펙이 공개되면 API 구조, 파라미터, 인증 방식이 외부에 노출되어 공격 표면이 넓어진다.
 *
 * 스펙 정의 위치: src/lib/api/openapi.ts (단일 진실 소스)
 */
import { NextRequest, NextResponse } from "next/server"
import { openApiSpec } from "@/lib/api/openapi"
import { getAuthUser } from "@/lib/api/auth"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  // 인증 확인
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // admin/staff/franchise_admin 역할 확인
  const supabase = await createClient()
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role:roles(name)")
    .eq("user_id", user.id)

  type RoleRow = { role: { name: string } | null }
  const roles = ((roleRows ?? []) as unknown as RoleRow[]).map((r) => r.role?.name ?? "")
  const hasAdminRole = roles.some((r) => ["admin", "staff", "franchise_admin"].includes(r))

  if (!hasAdminRole) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json(openApiSpec)
}
