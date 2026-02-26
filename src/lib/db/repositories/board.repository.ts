import type { Post, PostCategory, CreatePostInput } from "@/types/board.types"

export interface BoardRepository {
  findPosts(options: {
    category?: PostCategory
    page: number
    limit: number
  }): Promise<{ posts: Post[]; total: number }>
  findAllForAdmin(limit?: number): Promise<Post[]>
  createPost(data: CreatePostInput & { authorId: string }): Promise<Post>
}
