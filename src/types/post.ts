// 标签
export interface Tag {
  id: number
  name: string
  created_at: string
}

// 文章
export interface Post {
  id: number
  title: string
  content: string
  summary: string
  cover_image: string | null
  author: {
    id: number
    username: string
    email: string
  }
  tags: Tag[]
  is_published: boolean
  view_count: number
  created_at: string
  updated_at: string
}

// 创建文章请求
export interface CreatePostRequest {
  title: string
  content: string
  summary?: string
  cover_image?: File
  tags?: number[] // 标签ID数组
  is_published?: boolean
}

// 更新文章请求
export interface UpdatePostRequest {
  title?: string
  content?: string
  summary?: string
  cover_image?: File
  tags?: number[]
  is_published?: boolean
}

// 创建标签请求
export interface CreateTagRequest {
  name: string
}
