import Link from "next/link"
import { getPosts } from "@/actions/board.actions"
import { formatDate } from "@/lib/utils/format"
import { Button } from "@/components/ui/Button"
import { ROUTES } from "@/lib/constants/routes"

export default async function BoardPage() {
  const { posts } = await getPosts()

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">게시판</h1>
        <Link href={ROUTES.BOARD + "/write"}>
          <Button size="sm">글쓰기</Button>
        </Link>
      </div>
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {posts.length === 0 ? (
          <p className="py-12 text-center text-gray-500">게시글이 없습니다.</p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/board/${post.id}`}
              className="flex flex-col gap-1 px-4 py-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                {post.is_pinned && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                    공지
                  </span>
                )}
                <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
              </div>
              <div className="flex gap-3 text-xs text-gray-500">
                <span>{post.author?.name ?? "익명"}</span>
                <span>{formatDate(post.created_at)}</span>
                <span>조회 {post.view_count}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
