/**
 * API 인증 유틸리티
 *
 * Next.js App Router의 Route Handler(API Routes)에서 사용하는 인증 헬퍼.
 * Supabase Auth 세션을 검증하고, 권한 검사까지 수행한다.
 *
 * ## 설계 결정
 * Next.js App Router에서는 Request 객체가 아닌 쿠키 기반으로 세션이 전달된다.
 * `createClient()`가 내부적으로 Next.js `cookies()`를 사용하므로,
 * `request` 파라미터는 현재 미사용이지만 미래 JWT 직접 검증 등의 인증 방식 교체를 위해 유지한다.
 *
 * ## 권한 에러 처리 패턴
 * `requireAuth` / `requireRole`은 권한 부족 시 Response 객체를 throw한다.
 * Route Handler에서 `catch (error) { if (error instanceof Response) return error }` 패턴으로 처리.
 */
import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { apiError } from "./response"
import type { AuthUser } from "@/lib/auth/types"

/**
 * 현재 로그인 사용자 정보를 반환한다. 미로그인이면 null 반환.
 *
 * profiles 테이블에서 이름/전화번호 등 추가 정보를 JOIN하여 반환한다.
 * 에러 발생 시 null 반환 (throw 하지 않음) — 공개 API에서 선택적 인증에 사용.
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // profiles 테이블에서 추가 정보 조회 (알림 발송, FCM 토큰 갱신 등에 필요)
    const { data: profileData } = await supabase
      .from("profiles")
      .select("name, phone, avatar_url, fcm_token")
      .eq("id", user.id)
      .single()

    type ProfileData = {
      name: string
      phone: string | null
      avatar_url: string | null
      fcm_token: string | null
    }
    const profile = profileData as unknown as ProfileData | null

    return {
      id: user.id,
      email: user.email ?? "",
      // name이 없으면 이메일을 대체값으로 사용 (소셜 로그인 직후 프로필 미완성 상태 대응)
      name: profile?.name ?? user.email ?? "",
      phone: profile?.phone ?? null,
      avatar_url: profile?.avatar_url ?? null,
      fcm_token: profile?.fcm_token ?? null,
    }
  } catch {
    return null
  }
}

/**
 * 인증 필수 엔드포인트용 래퍼.
 * 미로그인 시 401 Response를 throw하므로 Route Handler에서 try-catch 처리 필요.
 *
 * @throws {Response} 401 미인증
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request)
  if (!user) {
    throw apiError("인증이 필요합니다", 401)
  }
  return user
}

/**
 * 특정 역할(role) 필수 엔드포인트용 래퍼.
 * 인증 확인 후 `gigacoffee.roles` 테이블에서 역할을 검사한다.
 *
 * ## 역할 구조
 * - `admin`: 프랜차이즈 전체 또는 매장 관리자
 * - `staff`: 매장 스태프 (주문 상태 변경, 재고 조정 가능)
 * - (일반 사용자는 roles 레코드 없음)
 *
 * @param roles 허용할 역할 목록. 예: ["admin", "staff"]
 * @throws {Response} 401 미인증 | 403 권한 부족
 */
export async function requireRole(
  request: NextRequest,
  roles: string[]
): Promise<AuthUser> {
  const user = await requireAuth(request)
  const supabase = await createClient()

  const { data: roleData } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .single()

  // TypeScript 타입 캐스팅: Supabase 자동 생성 타입과 실제 반환 타입 불일치로 인한 우회
  // roles 테이블의 스키마: { user_id: uuid, role: text }
  type RoleData = { role: string }
  const userRole = (roleData as unknown as RoleData | null)?.role

  if (!userRole || !roles.includes(userRole)) {
    throw apiError("권한이 없습니다", 403)
  }

  return user
}
