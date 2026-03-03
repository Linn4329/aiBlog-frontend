import api from './axios'
import type { Profile, UpdateProfileRequest } from '@/types'

export const profileAPI = {
  // 获取个人资料
  get: () =>
    api.get<{ message: string; profile: Profile }>('/profiles/'),

  // 更新个人资料
  update: (data: UpdateProfileRequest) => {
    const formData = new FormData()
    
    if (data.avatar) {
      formData.append('avatar', data.avatar)
    }
    if (data.nickname) {
      formData.append('nickname', data.nickname)
    }
    if (data.bio) {
      formData.append('bio', data.bio)
    }
    if (data.website) {
      formData.append('website', data.website)
    }
    if (data.github) {
      formData.append('github', data.github)
    }
    if (data.twitter) {
      formData.append('twitter', data.twitter)
    }

    return api.post<{ message: string; profile: Profile }>('/profiles/', formData)
  },
}
