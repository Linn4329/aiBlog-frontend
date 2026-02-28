import api from './axios'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '@/types'

export const authAPI = {
  // 用户登录
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/auth/login/', data),

  // 用户注册
  register: (data: RegisterRequest) =>
    api.post<RegisterResponse>('/auth/register/', data),

  // 获取当前用户信息
  getProfile: () =>
    api.get<{ message: string; user: User }>('/auth/profile/'),
}
