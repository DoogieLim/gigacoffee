export type PostCategory = "notice" | "qna" | "review" | "free"

export interface Post {
  id: string
  author_id: string
  category: PostCategory
  title: string
  content: string
  images: string[]
  is_pinned: boolean
  is_hidden: boolean
  view_count: number
  created_at: string
  updated_at: string
  author?: { name: string; avatar_url: string | null }
  comment_count?: number
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  images: string[]
  is_hidden: boolean
  created_at: string
  author?: { name: string; avatar_url: string | null }
}

export interface CreatePostInput {
  category: PostCategory
  title: string
  content: string
  images?: string[]
}

export interface CreateCommentInput {
  content: string
  images?: string[]
}
