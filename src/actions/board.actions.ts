"use server"

import { createClient } from "@/lib/supabase/server"
import { boardRepo } from "@/lib/db"
import type { CreatePostInput, PostCategory } from "@/types/board.types"

export async function getPosts(category?: PostCategory, page = 1, limit = 20) {
  return boardRepo.findPosts({ category, page, limit })
}

export async function createPost(input: CreatePostInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("로그인이 필요합니다.")

  return boardRepo.createPost({ ...input, authorId: user.id })
}
