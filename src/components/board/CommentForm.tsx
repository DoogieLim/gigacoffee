"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createComment } from "@/actions/board.actions"
import { Button } from "@/components/ui/Button"
import { ImageUploader } from "./ImageUploader"

interface CommentFormProps {
  postId: string
}

export function CommentForm({ postId }: CommentFormProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      alert("댓글 내용을 입력해주세요.")
      return
    }

    setLoading(true)
    try {
      await createComment(postId, { content, images })
      setContent("")
      setImages([])
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "댓글 작성에 실패했습니다."
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">댓글 작성</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력해주세요"
          rows={4}
          className="block w-full px-4 py-2 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            resize-vertical"
          required
        />

        <ImageUploader
          images={images}
          onChange={setImages}
          maxFiles={2}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "작성 중..." : "댓글 작성"}
          </Button>
        </div>
      </form>
    </div>
  )
}
