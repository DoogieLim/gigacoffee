import { createServiceClient } from "@/lib/supabase/server"
import type { BoardRepository } from "../repositories/board.repository"
import type { Post, PostCategory, CreatePostInput } from "@/types/board.types"

export class SupabaseBoardRepository implements BoardRepository {
  private async db() {
    return createServiceClient()
  }

  async findPosts(options: {
    category?: PostCategory
    page: number
    limit: number
  }): Promise<{ posts: Post[]; total: number }> {
    const supabase = await this.db()
    let query = supabase
      .from("posts")
      .select("*, author:profiles(name, avatar_url)", { count: "exact" })
      .eq("is_hidden", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .range((options.page - 1) * options.limit, options.page * options.limit - 1)

    if (options.category) query = query.eq("category", options.category)

    const { data, count } = await query
    return { posts: (data ?? []) as unknown as Post[], total: count ?? 0 }
  }

  async findAllForAdmin(limit = 50): Promise<Post[]> {
    const supabase = await this.db()
    const { data } = await supabase
      .from("posts")
      .select("id, title, category, is_hidden, is_pinned, created_at, author:profiles(name)")
      .order("created_at", { ascending: false })
      .limit(limit)
    return (data ?? []) as unknown as Post[]
  }

  async createPost(data: CreatePostInput & { authorId: string }): Promise<Post> {
    const supabase = await this.db()
    const { authorId, ...rest } = data
    const { data: row, error } = await supabase
      .from("posts")
      .insert({ ...rest, author_id: authorId })
      .select()
      .single()
    if (error) throw new Error("게시글 작성에 실패했습니다.")
    return row as unknown as Post
  }
}
