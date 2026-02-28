import { Link } from 'react-router-dom'
import { Bot } from 'lucide-react'

export function SidebarHeader() {
  return (
    <Link 
      to="/" 
      className="flex items-center gap-2 px-4 py-6 border-b border-gray-200 dark:border-gray-800"
    >
      <Bot className="h-8 w-8 text-blue-600" />
      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
        AI Blog
      </span>
    </Link>
  )
}
