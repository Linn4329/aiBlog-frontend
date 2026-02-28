import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authAPI } from '@/api'
import { useAuth } from '@/context/AuthContext'
import type { User } from '@/types'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    }

    if (!formData.password) {
      newErrors.password = '请输入密码'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

// 处理提交
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!validateForm()) {
    return
  }

  setIsLoading(true)

  try {
    const response = await authAPI.login(formData)
    const { user, access_token } = response.data

    // 更新全局状态
    login(access_token, user as User)

    toast.success('登录成功！')
    
    // 跳转到首页
    navigate('/')
  } catch (error) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
      || '登录失败，请检查用户名和密码'
    toast.error(message)
  } finally {
    setIsLoading(false)
  }
}


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">欢迎回来</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            登录到 AI Blog
          </p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* 用户名 */}
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="请输入用户名"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* 密码 */}
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="请输入密码"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* 提交按钮 */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </Button>

          {/* 注册链接 */}
          <div className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              还没有账号？
            </span>{' '}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              立即注册
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
