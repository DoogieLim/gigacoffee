import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import { getPost } from "@/actions/board.actions"
import { CommentList } from "@/components/board/CommentList"
import { CommentForm } from "@/components/board/CommentForm"

interface PostPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPost(params.id)
  if (!post) return {}

  return {
    title: post.title,
    description: post.content.substring(0, 120),
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.id)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 게시글 헤더 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          {/* 카테고리 배지 */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              {post.category === "notice"
                ? "공지"
                : post.category === "qna"
                  ? "Q&A"
                  : post.category === "review"
                    ? "후기"
                    : "자유글"}
            </span>
          </div>

          {/* 제목 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* 메타 정보 */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 pb-4 border-b">
            {post.author && (
              <div className="flex items-center gap-2">
                {post.author.avatar_url && (
                  <Image
                    src={post.author.avatar_url}
                    alt={post.author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span>{post.author.name}</span>
              </div>
            )}
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
            <span>조회 {post.view_count}</span>
          </div>

          {/* 내용 */}
          <div className="mt-6 prose max-w-none">
            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* 이미지 갤러리 */}
          {post.images && post.images.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">첨부 이미지</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {post.images.map((url) => (
                  <div
                    key={url}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={url}
                      alt="post"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 댓글 섹션 */}
        <div className="space-y-6">
          <CommentForm postId={post.id} />
          <CommentList postId={post.id} />
        </div>
      </div>
    </div>
  )
}
