import { NavLink, useLocation } from 'react-router-dom'
import { Home, FileText, User, PenLine } from 'lucide-react'

const navigationItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/blog', icon: FileText, label: '博客' },
  { to: '/blog/create', icon: PenLine, label: '写文章', requiresAuth: true },
  { to: '/profile', icon: User, label: '个人主页' },
]

export function SidebarNav() {
  const location = useLocation()
  
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navigationItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={() => {
            const path = location.pathname
            // 精确匹配首页
            const isExactMatch = item.to === '/' && path === '/'
            // 博客页面需要排除 /blog/create 子路径
            const isBlogMatch = item.to === '/blog' && path.startsWith('/blog') && !path.startsWith('/blog/create')
            // 其他页面正常匹配
            const isOtherMatch = item.to !== '/' && item.to !== '/blog' && path.startsWith(item.to)
            
            const isActiveResult = isExactMatch || isBlogMatch || isOtherMatch
            
            return `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActiveResult
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }}
        >
          <item.icon className="h-5 w-5" />
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
