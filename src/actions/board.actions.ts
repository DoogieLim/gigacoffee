"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { boardRepo } from "@/lib/db"
import { getAdminStoreId } from "@/lib/utils/admin-store"
import { requireAdminAction } from "@/lib/auth/action-auth"
import type { CreatePostInput, PostCategory, CreateCommentInput } from "@/types/board.types"

// 사용자 쿠키에서 선택된 매장 ID 읽기
async function getUserStoreId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get("user_store_id")?.value ?? null
}

// 사용자 게시판: 선택된 매장 공지 + 전체 공지 표시
export async function getPosts(category?: PostCategory, page = 1, limit = 20) {
  const storeId = await getUserStoreId()
  return boardRepo.findPosts({ category, page, limit, storeId: storeId ?? undefined })
}

// 관리자 게시판: admin_store_id 쿠키 기반 필터
export async function getAdminPosts(limit = 50) {
  const storeId = await getAdminStoreId()
  return boardRepo.findAllForAdmin(limit, storeId)
}

export async function createPost(input: CreatePostInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("로그인이 필요합니다.")

  return boardRepo.createPost({ ...input, authorId: user.id })
}

export async function getPost(id: string) {
  const post = await boardRepo.findById(id)
  if (!post) return null

  await boardRepo.incrementViewCount(id)
  return post
}

export async function createComment(postId: string, input: CreateCommentInput) {
  // 댓글은 관리자(admin/staff/franchise_admin)만 작성 가능
  const userId = await requireAdminAction()
  return boardRepo.createComment({ ...input, postId, authorId: userId })
}
