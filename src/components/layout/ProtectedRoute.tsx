import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  // 1. 加载中：显示加载提示
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-semibold text-gray-600 dark:text-gray-400">
            加载中...
          </div>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto" />
        </div>
      </div>
    )
  }

  // 2. 未登录：重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 3. 已登录：渲染子路由
  return <Outlet />
}
