import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { boardRepo } from "@/lib/db"
import { EditPostForm } from "./EditPostForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const post = await boardRepo.findById(id)
  if (!post) notFound()

  // 작성자 본인만 수정 가능
  if (post.author_id !== user.id) redirect(`/board/${id}`)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">게시글 수정</h1>
        <EditPostForm post={post} />
      </div>
    </div>
  )
}
