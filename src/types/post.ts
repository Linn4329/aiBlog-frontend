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
  content?: string  // 列表页可能不返回
  excerpt: string   // 后端是 excerpt，不是 summary
  cover_image: string | null
  author: string    // 后端返回的是用户名字符串，不是对象
  author_id?: number // 作者ID
  tags: Tag[]
  status: 'draft' | 'published' | 'archived'  // 后端是 status，不是 is_published
  view_count: number
  created_at: string
  updated_at: string
}

// 创建文章请求
export interface CreatePostRequest {
  title: string
  content: string
  excerpt: string
  status: string
  cover_image?: File
  tags?: number[] // 标签ID数组
}

// 更新文章请求
export interface UpdatePostRequest {
  title?: string
  content?: string
  excerpt?: string
  cover_image?: File
  tags?: number[]
  status?: string
}

// 创建标签请求
export interface CreateTagRequest {
  name: string
}

// 文章查询参数
export interface PostQueryParams {
  search?: string
  tag?: string
  page?: number
}

// 更新文章请求
export interface UpdatePostRequest {
  title?: string
  content?: string
  excerpt?: string
  cover_image?: File
  tags?: number[]
  status?: string
}
