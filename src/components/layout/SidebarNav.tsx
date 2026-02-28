import { NavLink } from 'react-router-dom'
import { Home, FileText, MessageCircle, User } from 'lucide-react'

const navigationItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/blog', icon: FileText, label: '博客' },
  { to: '/ai-chat', icon: MessageCircle, label: 'AI对话' },
  { to: '/profile', icon: User, label: '个人主页' },
]

export function SidebarNav() {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navigationItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`
          }
        >
          <item.icon className="h-5 w-5" />
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
