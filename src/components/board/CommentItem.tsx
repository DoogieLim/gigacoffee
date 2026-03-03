"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { updateComment, deleteComment } from "@/actions/board.actions"
import { Button } from "@/components/ui/Button"
import type { Comment } from "@/types/board.types"

interface CommentItemProps {
  comment: Comment
  currentUserId: string | null
  isAdmin: boolean
}

export function CommentItem({ comment, currentUserId, isAdmin }: CommentItemProps) {
  const router = useRouter()
  const isAuthor = currentUserId === comment.author_id
  const canEdit = isAuthor
  const canDelete = isAuthor || isAdmin

  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [saving, setSaving] = useState(false)

  const handleUpdate = async () => {
    if (!editContent.trim()) return
    setSaving(true)
    try {
      await updateComment(comment.id, { content: editContent })
      setEditing(false)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "수정에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return
    try {
      await deleteComment(comment.id)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.")
    }
  }

  return (
    <div className="border-t pt-6 first:border-t-0 first:pt-0">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {comment.author?.avatar_url && (
            <Image
              src={comment.author.avatar_url}
              alt={comment.author.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <div>
            <p className="font-semibold text-gray-900">{comment.author?.name || "익명"}</p>
            <p className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        {(canEdit || canDelete) && !editing && (
          <div className="flex gap-1">
            {canEdit && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1"
              >
                수정
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="text-xs text-red-400 hover:text-red-600 px-2 py-1"
              >
                삭제
              </button>
            )}
          </div>
        )}
      </div>

      {/* 내용 */}
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => { setEditing(false); setEditContent(comment.content) }}>
              취소
            </Button>
            <Button size="sm" isLoading={saving} onClick={handleUpdate}>
              저장
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 whitespace-pre-wrap mb-4">{comment.content}</p>
      )}

      {/* 이미지 */}
      {!editing && comment.images && comment.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {comment.images.map((url) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image src={url} alt="comment" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
