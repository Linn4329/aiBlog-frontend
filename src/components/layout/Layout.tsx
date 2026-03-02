import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { AIFloatingWidget } from '@/components/ai/AIFloatingWidget'

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          <Outlet />
        </div>
      </main>

      {/* AI 浮窗 */}
      <AIFloatingWidget />
    </div>
  )
}
