import type { Post, PostCategory, CreatePostInput, Comment, CreateCommentInput } from "@/types/board.types"

export interface BoardRepository {
  findPosts(options: {
    category?: PostCategory
    page: number
    limit: number
  }): Promise<{ posts: Post[]; total: number }>
  findAllForAdmin(limit?: number): Promise<Post[]>
  createPost(data: CreatePostInput & { authorId: string }): Promise<Post>
  findById(id: string): Promise<Post | null>
  incrementViewCount(id: string): Promise<void>
  getComments(postId: string): Promise<Comment[]>
  createComment(data: CreateCommentInput & { postId: string; authorId: string }): Promise<Comment>
}
