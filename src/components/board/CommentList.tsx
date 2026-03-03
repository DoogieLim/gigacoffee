import { boardRepo } from "@/lib/db"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/actions/auth.actions"
import { CommentItem } from "./CommentItem"

interface CommentListProps {
  postId: string
}

const ADMIN_ROLES = ["admin", "franchise_admin", "staff"]

export async function CommentList({ postId }: CommentListProps) {
  const [comments, supabase, currentUser] = await Promise.all([
    boardRepo.getComments(postId),
    createClient(),
    getCurrentUser(),
  ])

  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id ?? null
  const isAdmin = !!(currentUser?.role && ADMIN_ROLES.includes(currentUser.role))

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
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
