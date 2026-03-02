import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { roleRepo, storeRepo } from "@/lib/db"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { ROUTES } from "@/lib/constants/routes"
import type { AdminStoreContext } from "@/types/store.types"

async function getAdminContext(): Promise<{ context: AdminStoreContext } | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // 권한 확인: franchise_admin(store_id IS NULL) 여부
  const isFranchiseAdmin = await roleRepo.isFranchiseAdmin(user.id)

  // 관리 가능한 매장 목록
  const managedStores = isFranchiseAdmin
    ? await storeRepo.findAll(true) // 전체 활성 매장
    : await roleRepo.findUserStores(user.id) // 본인 매장만

  // 관리자 역할 검증 (admin / staff / franchise_admin 중 하나 이상)
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role:roles(name)")
    .eq("user_id", user.id)

  const roles = ((roleRows ?? []) as unknown as Array<{ role: { name: string } | null }>).map(
    (r) => r.role?.name ?? ""
  )
  const isAdmin = roles.some((r) => ["admin", "staff", "franchise_admin"].includes(r))
  if (!isAdmin) return null

  // 쿠키에서 현재 선택된 매장 ID 읽기
  const cookieStore = await cookies()
  const rawStoreId = cookieStore.get("admin_store_id")?.value ?? null

  // franchise_admin은 null("전체") 허용, store_admin은 자신의 매장만 허용
  let currentStoreId: string | null
  if (isFranchiseAdmin) {
    currentStoreId = rawStoreId ?? null
  } else {
    currentStoreId =
      managedStores.find((s) => s.id === rawStoreId)?.id ?? managedStores[0]?.id ?? null
  }

  const context: AdminStoreContext = {
    isFranchiseAdmin,
    currentStoreId,
    managedStores,
  }

  return { context }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const result = await getAdminContext()

  if (!result) {
    redirect(ROUTES.LOGIN)
  }

  const { context } = result

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 모바일 경고 배너 */}
      <div className="fixed inset-x-0 top-0 z-50 bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white lg:hidden">
        관리자 페이지는 PC(1024px 이상)에서 사용해주세요.
      </div>

      {/* 사이드바 */}
      <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0">
        <AdminSidebar context={context} />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-1 flex-col overflow-auto">
        <main className="flex-1 bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  )
}
