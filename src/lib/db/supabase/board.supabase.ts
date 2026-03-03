import { createServiceClient } from "@/lib/supabase/server"
import type { BoardRepository } from "../repositories/board.repository"
import type { Post, PostCategory, CreatePostInput, Comment, CreateCommentInput, UpdatePostInput, UpdateCommentInput } from "@/types/board.types"

export class SupabaseBoardRepository implements BoardRepository {
  private async db() {
    return createServiceClient()
  }

  async findPosts(options: {
    category?: PostCategory
    page: number
    limit: number
    storeId?: string | null
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

    // storeId 지정: 해당 매장 게시글 + 전체(NULL) 게시글
    // storeId 미지정: 전체(NULL) 게시글만
    if (options.storeId) {
      query = query.or(`store_id.eq.${options.storeId},store_id.is.null`)
    } else {
      query = query.is("store_id", null)
    }

    const { data, count } = await query
    return { posts: (data ?? []) as unknown as Post[], total: count ?? 0 }
  }

  async findAllForAdmin(limit = 50, storeId?: string | null): Promise<Post[]> {
    const supabase = await this.db()
    let query = supabase
      .from("posts")
      .select("id, title, category, store_id, is_hidden, is_pinned, created_at, author:profiles(name)")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (storeId) {
      query = query.or(`store_id.eq.${storeId},store_id.is.null`)
    }
    const { data } = await query
    return (data ?? []) as unknown as Post[]
  }

  async createPost(data: CreatePostInput & { authorId: string; storeId?: string | null }): Promise<Post> {
    const supabase = await this.db()
    const { authorId, storeId, ...rest } = data
    const { data: row, error } = await supabase
      .from("posts")
      .insert({
        ...rest,
        author_id: authorId,
        store_id: storeId ?? null,
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

  async updatePost(id: string, data: UpdatePostInput, userId: string, isAdmin: boolean): Promise<Post> {
    const supabase = await this.db()
    const { data: post } = await supabase.from("posts").select("author_id").eq("id", id).single()
    if (!post) throw new Error("게시글을 찾을 수 없습니다.")
    if (!isAdmin && post.author_id !== userId) throw new Error("수정 권한이 없습니다.")
    const { data: row, error } = await supabase
      .from("posts")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, author:profiles(name, avatar_url)")
      .single()
    if (error) throw new Error("게시글 수정에 실패했습니다.")
    return row as unknown as Post
  }

  async deletePost(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const supabase = await this.db()
    const { data: post } = await supabase.from("posts").select("author_id").eq("id", id).single()
    if (!post) throw new Error("게시글을 찾을 수 없습니다.")
    if (!isAdmin && post.author_id !== userId) throw new Error("삭제 권한이 없습니다.")
    const { error } = await supabase.from("posts").delete().eq("id", id)
    if (error) throw new Error("게시글 삭제에 실패했습니다.")
  }

  async updateComment(id: string, data: UpdateCommentInput, userId: string): Promise<Comment> {
    const supabase = await this.db()
    const { data: comment } = await supabase.from("comments").select("author_id").eq("id", id).single()
    if (!comment) throw new Error("댓글을 찾을 수 없습니다.")
    if (comment.author_id !== userId) throw new Error("수정 권한이 없습니다.")
    const { data: row, error } = await supabase
      .from("comments")
      .update(data)
      .eq("id", id)
      .select("*, author:profiles(name, avatar_url)")
      .single()
    if (error) throw new Error("댓글 수정에 실패했습니다.")
    return row as unknown as Comment
  }

  async deleteComment(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const supabase = await this.db()
    const { data: comment } = await supabase.from("comments").select("author_id").eq("id", id).single()
    if (!comment) throw new Error("댓글을 찾을 수 없습니다.")
    if (!isAdmin && comment.author_id !== userId) throw new Error("삭제 권한이 없습니다.")
    const { error } = await supabase.from("comments").delete().eq("id", id)
    if (error) throw new Error("댓글 삭제에 실패했습니다.")
  }
}
