import { roleRepo } from "@/lib/db"
import { createClient } from "@/lib/supabase/server"
import { ROLE_LABELS } from "@/lib/constants/roles"
import { Badge } from "@/components/ui/Badge"
import { AdminRequestActions } from "@/components/admin/AdminRequestActions"

export default async function RolesPage() {
  const [userRoles, pendingRequests, supabase] = await Promise.all([
    roleRepo.findUserRoles(),
    roleRepo.findPendingAdminRequests(),
    createClient(),
  ])

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdmin = userRoles.some((r) => r.userId === user?.id && r.role?.name === "admin")

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">권한 관리</h1>
        <p className="mt-1 text-sm text-gray-500">사용자 역할 및 관리자 접근 요청을 관리합니다.</p>
      </div>

      {/* 관리자 승인 대기 목록 */}
      {isAdmin && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            관리자 접근 요청
            {pendingRequests.length > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                {pendingRequests.length}
              </span>
            )}
          </h2>
          {pendingRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-400">
              대기 중인 요청이 없습니다.
            </div>
          ) : (
            <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="px-6 py-3 font-medium">이름</th>
                    <th className="px-6 py-3 font-medium">이메일</th>
                    <th className="px-6 py-3 font-medium">요청 사유</th>
                    <th className="px-6 py-3 font-medium">요청일</th>
                    <th className="px-6 py-3 font-medium">처리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium">{req.profile?.name ?? "-"}</td>
                      <td className="px-6 py-3 text-gray-600">{req.profile?.email ?? "-"}</td>
                      <td className="max-w-xs px-6 py-3 text-gray-600">
                        <p className="truncate">{req.reason ?? "-"}</p>
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="px-6 py-3">
                        <AdminRequestActions requestId={req.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 사용자 역할 목록 */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">사용자 역할</h2>
        <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="px-6 py-3 font-medium">이름</th>
                <th className="px-6 py-3 font-medium">이메일</th>
                <th className="px-6 py-3 font-medium">역할</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userRoles.map((ur) => {
                const role = ur.role?.name
                return (
                  <tr key={ur.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{ur.profile?.name}</td>
                    <td className="px-6 py-3 text-gray-600">{ur.profile?.email}</td>
                    <td className="px-6 py-3">
                      <Badge variant={role === "admin" ? "danger" : role === "staff" ? "warning" : "default"}>
                        {role ? ROLE_LABELS[role as keyof typeof ROLE_LABELS] : "-"}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
