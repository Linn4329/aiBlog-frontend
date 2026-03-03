import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { User, Settings, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '@/context/AuthContext'
import { profileAPI } from '@/api'
import type { Profile } from '@/types'

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)

  // 加载用户资料
  const loadProfile = async () => {
    if (isAuthenticated) {
      try {
        const response = await profileAPI.get()
        const profile = response.data.profile
        // 添加基础URL到头像路径
        if (profile.avatar && !profile.avatar.startsWith('http')) {
          profile.avatar = `http://localhost:8000${profile.avatar}`
        }
        setProfile(profile)
      } catch (error) {
        console.error('加载用户资料失败:', error)
      }
    }
  }

  useEffect(() => {
    loadProfile()
  }, [isAuthenticated])

  // 监听profile更新事件
  useEffect(() => {
    const handleProfileUpdate = () => {
      loadProfile()
    }
    window.addEventListener('profile-updated', handleProfileUpdate)
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate)
    }
  }, [])

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg"
      >
        <User className="h-5 w-5" />
        <span>登录</span>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar || user?.avatar} alt={profile?.nickname || user?.username} />
            <AvatarFallback>{(profile?.nickname || user?.username)?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-gray-700 dark:text-gray-300">{profile?.nickname || user?.username}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>我的账户</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>个人主页</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile/edit" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>设置</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2">
          <span className="flex-1">主题</span>
          <ThemeToggle />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
          <LogOut className="h-4 w-4 mr-2" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
