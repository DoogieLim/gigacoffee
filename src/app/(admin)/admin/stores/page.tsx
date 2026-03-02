import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { roleRepo, storeRepo } from "@/lib/db"
import { ROUTES } from "@/lib/constants/routes"
import { StoresClient } from "@/components/admin/StoresClient"

export default async function AdminStoresPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const isFranchiseAdmin = await roleRepo.isFranchiseAdmin(user.id)
  if (!isFranchiseAdmin) redirect(ROUTES.ADMIN)

  const stores = await storeRepo.findAll()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">매장 관리</h1>
          <p className="mt-1 text-sm text-gray-500">프랜차이즈 매장을 등록하고 관리합니다.</p>
        </div>
      </div>
      <StoresClient initialStores={stores} />
    </div>
  )
}
