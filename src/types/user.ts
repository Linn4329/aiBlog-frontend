// 用户基础信息
export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  date_joined: string
  avatar?: string
}

// 个人资料
export interface Profile {
  id: number
  username: string      // 直接在 profile 下
  email: string         // 直接在 profile 下
  avatar: string | null
  nickname?: string
  bio: string
  website: string
  location?: string
  birth_date?: string
  gender?: string
  created_at: string
  updated_at: string
  // 注意：后端没有 github 和 twitter 字段，暂时保留为可选
  github?: string
  twitter?: string
}

// 登录请求参数
export interface LoginRequest {
  username: string
  password: string
}

// 注册请求参数
export interface RegisterRequest {
  username: string
  email: string
  password: string
  password_confirm: string
}

// 登录响应
export interface LoginResponse {
  message: string
  user: User
  access_token: string
  refresh_token: string
}

// 注册响应
export interface RegisterResponse {
  message: string
  user: User
}

// 更新个人资料请求
export interface UpdateProfileRequest {
  avatar?: File
  nickname?: string
  bio?: string
  website?: string
  github?: string
  twitter?: string
}
