import { useState, useEffect } from 'react'


interface User {
  id: number
  username: string
  email: string
  avatar?: string
}

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => void
  logout: () => void
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 检查本地存储的 token
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userInfo = localStorage.getItem('user_info')
    
    if (token && userInfo) {
      try {
        setUser(JSON.parse(userInfo))
      } catch (error) {
        console.error('解析用户信息失败:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_info')
      }
    }
    
    setIsLoading(false)
  }, [])

  // 登录方法
  const login = (token: string) => {
    localStorage.setItem('access_token', token)
    // 实际项目中这里会调用 API 获取用户信息
    // 临时简化版：直接解析 JWT payload（不推荐生产环境使用）
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userInfo: User = {
        id: payload.user_id,
        username: payload.username || '用户',
        email: payload.email || '',
      }
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      setUser(userInfo)
    } catch (error) {
      console.error('解析 token 失败:', error)
    }
  }

  // 登出方法
  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_info')
    setUser(null)
  }

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }
}
