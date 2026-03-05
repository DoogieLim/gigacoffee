import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getPost } from "@/actions/board.actions"
import { formatDateTime } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"
import { UnderConstruction } from "@/components/ui/UnderConstruction"

interface AdminBoardDetailPageProps {
  params: Promise<{ id: string }>
}

const CATEGORY_LABELS: Record<string, string> = {
  notice: "공지",
  qna: "Q&A",
  review: "후기",
  free: "자유글",
}

export default async function AdminBoardDetailPage({ params }: AdminBoardDetailPageProps) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/board"
          className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          &larr; 목록으로
        </Link>
      </div>

      {/* 게시글 내용 */}
      <div className="rounded-xl bg-white shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="default">{CATEGORY_LABELS[post.category] ?? post.category}</Badge>
          {post.is_hidden ? <Badge variant="danger">숨김</Badge> : <Badge variant="success">공개</Badge>}
          {post.is_pinned && <Badge variant="warning">고정</Badge>}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 pb-4 border-b border-gray-100">
          {post.author && (
            <div className="flex items-center gap-2">
              {post.author.avatar_url && (
                <Image
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span>{post.author.name}</span>
            </div>
          )}
          <span>{formatDateTime(post.created_at)}</span>
          <span>조회 {post.view_count}</span>
        </div>

        <div className="mt-6 text-gray-800 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </div>

        {/* 이미지 갤러리 */}
        {post.images && post.images.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">첨부 이미지</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {post.images.map((url) => (
                <div
                  key={url}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <Image
                    src={url}
                    alt="첨부 이미지"
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 사용자 페이지 링크 */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Link
            href={`/board/${post.id}`}
            className="text-sm text-amber-700 hover:text-amber-800 hover:underline"
          >
            사용자 페이지에서 보기 &rarr;
          </Link>
        </div>
      </div>

      {/* 관리 기능 (미구현) */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">게시글 관리</h2>
          <p className="text-sm text-gray-500 mt-0.5">고정, 숨김 처리, 카테고리 변경 등 관리 기능</p>
        </div>
        <UnderConstruction
          title="관리 기능 개발중"
          description="게시글 고정/숨김 토글, 카테고리 변경, 관리자 댓글 등의 기능이 곧 추가될 예정입니다."
        />
      </div>
    </div>
  )
}
