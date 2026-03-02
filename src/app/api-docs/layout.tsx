/**
 * /api-docs 레이아웃 — admin 권한 필수
 *
 * API 문서는 내부 개발/운영 목적 전용이므로 인터넷에 공개하지 않는다.
 * API 구조, 파라미터, 인증 방식이 외부에 노출되면 공격 표면이 넓어지기 때문이다.
 *
 * **접근 정책:**
 * - 미인증 → /login 리다이렉트
 * - 인증됐지만 admin/staff/franchise_admin 역할 없음 → /login 리다이렉트
 * - 위 역할 중 하나라도 있으면 접근 허용
 *
 * **왜 middleware가 아닌 layout인가:**
 * 현재 프로젝트에 Next.js middleware(src/middleware.ts)가 없으며,
 * /api-docs 단일 경로 보호를 위해 미들웨어를 새로 만드는 것보다
 * layout.tsx 서버 컴포넌트에서 처리하는 것이 범위가 명확하고 유지보수가 쉽다.
 */
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ROUTES } from "@/lib/constants/routes"

async function requireAdminAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(ROUTES.LOGIN)
  }

  // user_roles + roles JOIN으로 역할 확인
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role:roles(name)")
    .eq("user_id", user.id)

  type RoleRow = { role: { name: string } | null }
  const roles = ((roleRows ?? []) as unknown as RoleRow[]).map((r) => r.role?.name ?? "")
  const hasAdminRole = roles.some((r) => ["admin", "staff", "franchise_admin"].includes(r))

  if (!hasAdminRole) {
    // 인증됐지만 권한 없음 — 로그인 페이지로 (403 대신 리다이렉트)
    redirect(ROUTES.LOGIN)
  }
}

export default async function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminAuth()

  return (
    <>
      {/* 권한 확인 완료 — 콘텐츠 렌더링 */}
      {children}
    </>
  )
}
