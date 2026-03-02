import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { User, Mail, Calendar, Globe, Github, Twitter } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { profileAPI } from '@/api'
import { useAuth } from '@/context/AuthContext'
import type { Profile } from '@/types'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.get()
      console.log('API 响应:', response.data)  // 添加这行
      setProfile(response.data.profile)
    } catch (error) {
      console.error('API 错误:', error)  // 添加这行
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || '获取个人资料失败'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">无法加载个人资料</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 头部信息 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-8">
        <div className="flex items-start gap-6">
          {/* 头像 */}
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar || undefined} alt={profile.username} />
            <AvatarFallback className="text-2xl">
              {profile.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* 基本信息 */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {profile.bio || '这个人很懒，什么都没写...'}
              </p>
            </div>

            {/* 详细信息 */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>ID: {profile.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  加入于 {new Date(profile.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>

            {/* 社交链接 */}
            {(profile.website || profile.github || profile.twitter) && (
              <div className="flex gap-4 pt-2">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    <Globe className="h-4 w-4" />
                    <span>网站</span>
                  </a>
                )}
                {profile.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 dark:text-gray-300"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={profile.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-500"
                  >
                    <Twitter className="h-4 w-4" />
                    <span>Twitter</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* 编辑按钮（如果是自己的主页） */}
          {user && user.username === profile.username && (
            <Button variant="outline">
              编辑资料
            </Button>
          )}
        </div>
      </div>

      {/* 统计信息（可选，后续扩展） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">文章数</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-center">
          <div className="text-3xl font-bold text-green-600">0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">浏览量</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">AI对话</div>
        </div>
      </div>
    </div>
  )
}
