import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ReactNode } from 'react'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"          // 使用 class 属性切换主题
      defaultTheme="light"        // 默认亮色主题
      enableSystem                // 启用系统主题检测
      disableTransitionOnChange   // 切换时禁用过渡动画（避免闪烁）
    >
      {children}
    </NextThemesProvider>
  )
}
