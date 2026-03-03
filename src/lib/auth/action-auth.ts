/**
 * Server Action 공통 권한 헬퍼
 *
 * Server Actions(`"use server"` 파일)에서 import해서 사용한다.
 * 권한 부족 시 Error를 throw하므로 호출 측에서 try-catch 처리 필요.
 *
 * 역할 구조:
 *   admin / franchise_admin / staff → 관리자 기능 전체
 *   rider                          → 배송 상태(out_for_delivery, completed)만 변경
 *   (역할 없음)                    → 일반 사용자 (주문, 문의 게시글 작성)
 */
import { createClient } from "@/lib/supabase/server"

const ADMIN_ROLES = ["admin", "staff", "franchise_admin"]

/** 현재 로그인 유저의 역할 목록을 반환한다. */
async function fetchRoles(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("user_roles")
    .select("role:roles(name)")
    .eq("user_id", userId)
  return ((data ?? []) as unknown as Array<{ role: { name: string } | null }>)
    .map((r) => r.role?.name ?? "")
    .filter(Boolean)
}

/**
 * admin / staff / franchise_admin 역할이 필요한 작업에 사용.
 * @returns 현재 유저의 userId
 * @throws Error("인증이 필요합니다.") | Error("권한이 없습니다.")
 */
export async function requireAdminAction(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("인증이 필요합니다.")

  const roles = await fetchRoles(user.id)
  if (!roles.some((r) => ADMIN_ROLES.includes(r))) {
    throw new Error("권한이 없습니다.")
  }
  return user.id
}

/**
 * 로그인한 유저의 역할을 함께 반환한다. (역할별 분기가 필요한 경우 사용)
 * 지정한 allowedRoles 중 하나도 없으면 throw.
 * @returns { userId, roles }
 */
export async function requireAnyRole(
  allowedRoles: string[]
): Promise<{ userId: string; roles: string[] }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("인증이 필요합니다.")

  const roles = await fetchRoles(user.id)
  if (!roles.some((r) => allowedRoles.includes(r))) {
    throw new Error("권한이 없습니다.")
  }
  return { userId: user.id, roles }
}

/**
 * 로그인만 필요한 작업에 사용.
 * @returns 현재 유저의 userId
 */
export async function requireLoginAction(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("로그인이 필요합니다.")
  return user.id
}
