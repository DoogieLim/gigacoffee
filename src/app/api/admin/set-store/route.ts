/**
 * POST /api/admin/set-store — 관리자 활성 매장 전환 (franchise_admin 전용)
 *
 * franchise_admin이 관리자 대시보드에서 조회할 매장을 전환한다.
 * 선택 매장 ID는 `admin_store_id` HttpOnly 쿠키에 저장되어 30일간 유지된다.
 *
 * **권한 설계:**
 * - `franchise_admin`: 모든 매장 자유 전환 가능 (storeId=null이면 전체 보기)
 * - `store_admin` / `store_staff`: 자신의 매장 고정, 이 API 호출 불가
 *
 * **쿠키 경로:** `path: "/admin"` — 관리자 라우트에서만 읽힘 (사용자 페이지 노출 방지)
 *
 * 인증: franchise_admin 역할 필요
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/admin/set-store POST
 */
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { roleRepo } from "@/lib/db"

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // roleRepo.isFranchiseAdmin: user_roles.store_id IS NULL AND role IN ('admin', 'franchise_admin') 확인
  const isFranchiseAdmin = await roleRepo.isFranchiseAdmin(user.id)
  if (!isFranchiseAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { storeId } = (await req.json()) as { storeId: string | null }

  const cookieStore = await cookies()
  if (!storeId) {
    // storeId=null: "전체 보기" 모드 — 쿠키 삭제 시 모든 매장 합산 데이터 표시
    cookieStore.delete("admin_store_id")
  } else {
    cookieStore.set("admin_store_id", storeId, {
      httpOnly: true,      // XSS 방지: JS에서 읽기 불가
      path: "/admin",      // 관리자 라우트에서만 전송
      maxAge: 60 * 60 * 24 * 30, // 30일 유지
    })
  }

  return NextResponse.json({ ok: true })
}
