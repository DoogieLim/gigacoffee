import Image from "next/image"
import { boardRepo } from "@/lib/db"

interface CommentListProps {
  postId: string
}

export async function CommentList({ postId }: CommentListProps) {
  const comments = await boardRepo.getComments(postId)

  if (comments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-gray-500">첫 번째 댓글을 작성해보세요!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          댓글 ({comments.length})
        </h2>

        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-t pt-6 first:border-t-0 first:pt-0">
              {/* 댓글 헤더 */}
              <div className="flex items-center gap-3 mb-3">
                {comment.author?.avatar_url && (
                  <Image
                    src={comment.author.avatar_url}
                    alt={comment.author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {comment.author?.name || "익명"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* 댓글 내용 */}
              <p className="text-gray-800 whitespace-pre-wrap mb-4">
                {comment.content}
              </p>

              {/* 댓글 이미지 */}
              {comment.images && comment.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {comment.images.map((url) => (
                    <div
                      key={url}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={url}
                        alt="comment"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
