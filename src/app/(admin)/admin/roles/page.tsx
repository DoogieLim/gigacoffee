import { roleRepo } from "@/lib/db"
import { ROLE_LABELS } from "@/lib/constants/roles"
import { Badge } from "@/components/ui/Badge"

export default async function RolesPage() {
  const userRoles = await roleRepo.findUserRoles()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">권한 관리</h1>
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
  )
}
