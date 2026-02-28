// 通用API响应
export interface ApiResponse<T = unknown> {
  message?: string
  data?: T
}

// 分页响应
export interface PaginatedResponse<T> {
  message: string
  results: T[]
  count: number
  next: string | null
  previous: string | null
}

// 错误响应
export interface ErrorResponse {
  message: string
  errors?: Record<string, string[]>
  status_code?: number
}

// 分页请求参数
export interface PaginationParams {
  page?: number
  page_size?: number
}

// 文章列表查询参数
export interface PostQueryParams extends PaginationParams {
  tag?: string
  search?: string
  author?: number
  is_published?: boolean
}
