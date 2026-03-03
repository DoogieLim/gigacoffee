"use client"

import { useRouter } from "next/navigation"
import { deletePost } from "@/actions/board.actions"
import { Button } from "@/components/ui/Button"

interface PostActionsProps {
  postId: string
  authorId: string
  currentUserId: string | null
  isAdmin: boolean
}

export function PostActions({ postId, authorId, currentUserId, isAdmin }: PostActionsProps) {
  const router = useRouter()
  const isAuthor = currentUserId === authorId
  const canEdit = isAuthor
  const canDelete = isAuthor || isAdmin

  if (!canEdit && !canDelete) return null

  const handleDelete = async () => {
    if (!confirm("게시글을 삭제하시겠습니까?")) return
    try {
      await deletePost(postId)
      router.push("/board")
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.")
    }
  }

  return (
    <div className="flex gap-2">
      {canEdit && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`/board/${postId}/edit`)}
        >
          수정
        </Button>
      )}
      {canDelete && (
        <Button size="sm" variant="outline" onClick={handleDelete} className="text-red-600 border-red-300 hover:bg-red-50">
          삭제
        </Button>
      )}
    </div>
  )
}
