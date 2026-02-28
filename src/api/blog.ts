import api from './axios'
import type {
  Post,
  Tag,
  CreatePostRequest,
  UpdatePostRequest,
  CreateTagRequest,
  PostQueryParams,
  PaginatedResponse,
} from '@/types'

export const blogAPI = {
  // 获取文章列表
  getPosts: (params?: PostQueryParams) =>
    api.get<PaginatedResponse<Post>>('/blog/posts/', { params }),

  // 获取文章详情
  getPost: (id: number) =>
    api.get<{ message: string; post: Post }>(`/blog/posts/${id}/`),

  // 创建文章
  createPost: (data: CreatePostRequest) => {
    const formData = new FormData()
    
    formData.append('title', data.title)
    formData.append('content', data.content)
    
    if (data.summary) {
      formData.append('summary', data.summary)
    }
    if (data.cover_image) {
      formData.append('cover_image', data.cover_image)
    }
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tagId => {
        formData.append('tags', tagId.toString())
      })
    }
    if (data.is_published !== undefined) {
      formData.append('is_published', data.is_published.toString())
    }

    return api.post<{ message: string; post: Post }>('/blog/posts/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 更新文章
  updatePost: (id: number, data: UpdatePostRequest) => {
    const formData = new FormData()
    
    if (data.title) {
      formData.append('title', data.title)
    }
    if (data.content) {
      formData.append('content', data.content)
    }
    if (data.summary) {
      formData.append('summary', data.summary)
    }
    if (data.cover_image) {
      formData.append('cover_image', data.cover_image)
    }
    if (data.tags) {
      data.tags.forEach(tagId => {
        formData.append('tags', tagId.toString())
      })
    }
    if (data.is_published !== undefined) {
      formData.append('is_published', data.is_published.toString())
    }

    return api.patch<{ message: string; post: Post }>(`/blog/posts/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 删除文章
  deletePost: (id: number) =>
    api.delete(`/blog/posts/${id}/`),

  // 获取标签列表
  getTags: () =>
    api.get<{ message: string; tags: Tag[] }>('/blog/tags/'),

  // 创建标签
  createTag: (data: CreateTagRequest) =>
    api.post<{ message: string; tag: Tag }>('/blog/tags/', data),
}
