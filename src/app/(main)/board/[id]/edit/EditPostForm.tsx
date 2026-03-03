"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updatePost } from "@/actions/board.actions"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ImageUploader } from "@/components/board/ImageUploader"
import type { PostCategory, Post } from "@/types/board.types"

const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "notice", label: "공지" },
  { value: "qna", label: "Q&A" },
  { value: "review", label: "후기" },
  { value: "free", label: "자유글" },
]

export function EditPostForm({ post }: { post: Post }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<PostCategory>(post.category)
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.content)
  const [images, setImages] = useState<string[]>(post.images ?? [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.")
      return
    }
    setLoading(true)
    try {
      await updatePost(post.id, { category, title, content, images })
      router.push(`/board/${post.id}`)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "수정에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as PostCategory)}
          className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">제목</label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력해주세요"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">내용</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          required
        />
      </div>

      <ImageUploader images={images} onChange={setImages} maxFiles={5} />

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>취소</Button>
        <Button type="submit" isLoading={loading}>수정 완료</Button>
      </div>
    </form>
  )
}
