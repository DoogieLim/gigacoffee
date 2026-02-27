import { createServiceClient } from "@/lib/supabase/server"
import type { BoardRepository } from "../repositories/board.repository"
import type { Post, PostCategory, CreatePostInput, Comment, CreateCommentInput } from "@/types/board.types"

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
      .insert({
        ...rest,
        author_id: authorId,
        images: rest.images ?? [],
      })
      .select()
      .single()
    if (error) throw new Error("게시글 작성에 실패했습니다.")
    return row as unknown as Post
  }

  async findById(id: string): Promise<Post | null> {
    const supabase = await this.db()
    const { data } = await supabase
      .from("posts")
      .select("*, author:profiles(name, avatar_url)")
      .eq("id", id)
      .eq("is_hidden", false)
      .single()
    return (data ?? null) as unknown as Post | null
  }

  async incrementViewCount(id: string): Promise<void> {
    const supabase = await this.db()
    const { data: post } = await supabase
      .from("posts")
      .select("view_count")
      .eq("id", id)
      .single()

    if (post) {
      await supabase
        .from("posts")
        .update({ view_count: (post.view_count ?? 0) + 1 })
        .eq("id", id)
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    const supabase = await this.db()
    const { data } = await supabase
      .from("comments")
      .select("*, author:profiles(name, avatar_url)")
      .eq("post_id", postId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: true })
    return (data ?? []) as unknown as Comment[]
  }

  async createComment(
    data: CreateCommentInput & { postId: string; authorId: string }
  ): Promise<Comment> {
    const supabase = await this.db()
    const { postId, authorId, ...rest } = data
    const { data: row, error } = await supabase
      .from("comments")
      .insert({
        ...rest,
        post_id: postId,
        author_id: authorId,
        images: rest.images ?? [],
      })
      .select()
      .single()
    if (error) throw new Error("댓글 작성에 실패했습니다.")
    return row as unknown as Comment
  }
}
