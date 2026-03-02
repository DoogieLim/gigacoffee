import type { Post, PostCategory, CreatePostInput, Comment, CreateCommentInput } from "@/types/board.types"

export interface BoardRepository {
  findPosts(options: {
    category?: PostCategory
    page: number
    limit: number
    storeId?: string | null  // undefined/null = 전체공지만, string = 해당 매장 + 전체
  }): Promise<{ posts: Post[]; total: number }>
  findAllForAdmin(limit?: number, storeId?: string | null): Promise<Post[]>
  createPost(data: CreatePostInput & { authorId: string; storeId?: string | null }): Promise<Post>
  findById(id: string): Promise<Post | null>
  incrementViewCount(id: string): Promise<void>
  getComments(postId: string): Promise<Comment[]>
  createComment(data: CreateCommentInput & { postId: string; authorId: string }): Promise<Comment>
}
