"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createPost } from "@/actions/board.actions"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ImageUploader } from "@/components/board/ImageUploader"
import type { PostCategory } from "@/types/board.types"

const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "notice", label: "공지" },
  { value: "qna", label: "Q&A" },
  { value: "review", label: "후기" },
  { value: "free", label: "자유글" },
]

export default function WritePostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<PostCategory>("free")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.")
      return
    }

    setLoading(true)
    try {
      const post = await createPost({
        category,
        title,
        content,
        images,
      })

      if (post) {
        router.push(`/board/${post.id}`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "게시글 작성에 실패했습니다."
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">새 게시글 작성</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* 카테고리 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as PostCategory)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요"
              required
            />
          </div>

          {/* 내용 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력해주세요"
              rows={8}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                resize-vertical"
              required
            />
          </div>

          {/* 이미지 첨부 */}
          <ImageUploader images={images} onChange={setImages} maxFiles={5} />

          {/* 버튼 */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button type="submit" isLoading={loading}>
              작성
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
