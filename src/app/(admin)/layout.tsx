import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { ROUTES } from "@/lib/constants/routes"

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const service = await createServiceClient()
  const { data } = await service
    .from("user_roles")
    .select("role:roles(name)")
    .eq("user_id", user.id)

  const rows = (data ?? []) as unknown as Array<{ role: { name: string } | null }>
  const roles = rows.map((r) => r.role?.name)
  const isAdmin = roles.includes("admin") || roles.includes("staff")
  return isAdmin ? user : null
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser()

  if (!user) {
    redirect(ROUTES.LOGIN)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 모바일 경고 배너 */}
      <div className="fixed inset-x-0 top-0 z-50 bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white lg:hidden">
        관리자 페이지는 PC(1024px 이상)에서 사용해주세요.
      </div>

      {/* 사이드바 */}
      <div className="hidden lg:flex lg:w-60 lg:flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-1 flex-col overflow-auto">
        <main className="flex-1 bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  )
}
