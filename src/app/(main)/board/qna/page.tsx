import Link from "next/link"
import { getPosts } from "@/actions/board.actions"
import { formatDate } from "@/lib/utils/format"
import { Button } from "@/components/ui/Button"
import { ROUTES } from "@/lib/constants/routes"

export const metadata = {
  title: "고객 문의 | GigaCoffee",
  description: "GigaCoffee 고객 문의 게시판입니다.",
}

export default async function QnABoardPage() {
  const { posts } = await getPosts("qna")

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">고객 문의</h1>
          <p className="mt-1 text-sm text-gray-500">
            궁금한 점이나 불편한 점을 남겨주세요. 빠르게 답변드리겠습니다.
          </p>
        </div>
        <Link href={`${ROUTES.BOARD}/write?category=qna`}>
          <Button size="sm">문의 작성</Button>
        </Link>
      </div>

      {/* 안내 배너 */}
      <div className="mb-4 flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <svg
          className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>영업일 기준 1~2일 내 답변드립니다. 주문·결제 문의는 주문 번호를 함께 남겨주세요.</span>
      </div>

      {/* 게시글 목록 */}
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <svg
              className="mb-3 h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
            <p className="text-gray-500">아직 문의 내역이 없습니다.</p>
            <Link href={`${ROUTES.BOARD}/write?category=qna`} className="mt-4">
              <Button size="sm" variant="outline">
                첫 문의 남기기
              </Button>
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/board/${post.id}`}
              className="flex flex-col gap-1.5 px-4 py-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                {/* 답변 상태 배지 */}
                {(post.comment_count ?? 0) > 0 ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                    답변 완료
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    답변 대기
                  </span>
                )}
                {post.is_pinned && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                    공지
                  </span>
                )}
                <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
              </div>
              <div className="flex gap-3 text-xs text-gray-500">
                <span>{post.author?.name ?? "익명"}</span>
                <span>{formatDate(post.created_at)}</span>
                <span>조회 {post.view_count}</span>
                {(post.comment_count ?? 0) > 0 && (
                  <span className="text-green-600">댓글 {post.comment_count}</span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
