import Link from "next/link"
import { getAdminPosts } from "@/actions/board.actions"
import { formatDateTime } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"

const CATEGORY_LABELS: Record<string, string> = {
  notice: "공지",
  qna: "Q&A",
  review: "후기",
  free: "자유글",
}

export default async function AdminBoardPage() {
  const posts = await getAdminPosts(50)

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
              <th className="px-6 py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium max-w-xs truncate">
                  <Link href={`/board/${post.id}`} className="text-gray-900 hover:text-amber-700 hover:underline">
                    {post.title}
                  </Link>
                </td>
                <td className="px-6 py-3 text-gray-600">{CATEGORY_LABELS[post.category] ?? post.category}</td>
                <td className="px-6 py-3 text-gray-600">{post.author?.name ?? "-"}</td>
                <td className="px-6 py-3">
                  {post.is_hidden ? <Badge variant="danger">숨김</Badge> : <Badge variant="success">공개</Badge>}
                  {post.is_pinned && <Badge variant="warning" className="ml-1">고정</Badge>}
                </td>
                <td className="px-6 py-3 text-gray-600">{formatDateTime(post.created_at)}</td>
                <td className="px-6 py-3">
                  <div className="flex gap-1">
                    <Link
                      href={`/admin/board/${post.id}`}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                    >
                      상세
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
