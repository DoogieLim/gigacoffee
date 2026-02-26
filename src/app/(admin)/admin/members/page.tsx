import { memberRepo } from "@/lib/db"
import { formatDate } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"

export default async function MembersPage() {
  const members = await memberRepo.findAll()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
      <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="px-6 py-3 font-medium">이름</th>
              <th className="px-6 py-3 font-medium">이메일</th>
              <th className="px-6 py-3 font-medium">전화번호</th>
              <th className="px-6 py-3 font-medium">상태</th>
              <th className="px-6 py-3 font-medium">가입일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-900">{member.name}</td>
                <td className="px-6 py-3 text-gray-600">{member.email}</td>
                <td className="px-6 py-3 text-gray-600">{member.phone ?? "-"}</td>
                <td className="px-6 py-3">
                  <Badge variant={member.is_active ? "success" : "danger"}>
                    {member.is_active ? "활성" : "비활성"}
                  </Badge>
                </td>
                <td className="px-6 py-3 text-gray-600">{formatDate(member.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
