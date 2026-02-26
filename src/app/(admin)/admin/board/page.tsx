import { boardRepo } from "@/lib/db"
import { formatDateTime } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"

export default async function AdminBoardPage() {
  const posts = await boardRepo.findAllForAdmin(50)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">게시판 관리</h1>
      <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="px-6 py-3 font-medium">제목</th>
              <th className="px-6 py-3 font-medium">카테고리</th>
              <th className="px-6 py-3 font-medium">작성자</th>
              <th className="px-6 py-3 font-medium">상태</th>
              <th className="px-6 py-3 font-medium">작성일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-900 max-w-xs truncate">{post.title}</td>
                <td className="px-6 py-3 text-gray-600">{post.category}</td>
                <td className="px-6 py-3 text-gray-600">{post.author?.name ?? "-"}</td>
                <td className="px-6 py-3">
                  {post.is_hidden ? <Badge variant="danger">숨김</Badge> : <Badge variant="success">공개</Badge>}
                  {post.is_pinned && <Badge variant="warning" className="ml-1">고정</Badge>}
                </td>
                <td className="px-6 py-3 text-gray-600">{formatDateTime(post.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
