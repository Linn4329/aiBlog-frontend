import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { aiAPI } from '@/api/ai'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isError?: boolean
}

interface AIChatWindowProps {
  isOpen: boolean
  onClose: () => void
  iconPosition: { x: number; y: number }
}

export function AIChatWindow({ isOpen, onClose, iconPosition }: AIChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是 AI 助手，有什么可以帮助你的吗？',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<number | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 窗口大小和位置状态
  const [windowSize, setWindowSize] = useState({ width: 320, height: 500 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null>(null)
  const resizeStartRef = useRef({ x: 0, y: 0, width: 320, height: 500, left: 0, top: 0 })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageToSend = input.trim()
    setInput('')
    setIsLoading(true)

    // 创建一个空的AI消息占位符
    const assistantMessageId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ])

    try {
      // 使用流式API
      await aiAPI.chatStream(
        messageToSend,
        currentSessionId,
        // onChunk: 接收到内容片段时更新消息
        (chunk: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          )
        },
        // onError: 发生错误时
        (error: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: error, isError: true }
                : msg
            )
          )
        },
        // onDone: 完成时
        (hasError: boolean) => {
          setIsLoading(false)
          if (hasError) {
            // 如果有错误，移除空消息
            setMessages((prev) =>
              prev.filter((msg) => msg.id !== assistantMessageId)
            )
          }
        }
      )
    } catch (error) {
      console.error('Chat error:', error)
      setIsLoading(false)
      // 移除空消息并显示错误
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== assistantMessageId)
          .concat([
            {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: '抱歉，发生了错误，请稍后重试。',
              timestamp: new Date(),
              isError: true,
            },
          ])
      )
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 开始调整大小
  const handleResizeStart = (e: React.MouseEvent, direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw') => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: windowSize.width,
      height: windowSize.height,
      left: iconPosition.x - windowSize.width + 56,
      top: iconPosition.y - windowSize.height - 10,
    }
  }

  // 处理调整大小
  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing || !resizeDirection) return

      const deltaX = e.clientX - resizeStartRef.current.x
      const deltaY = e.clientY - resizeStartRef.current.y

      let newWidth = resizeStartRef.current.width
      let newHeight = resizeStartRef.current.height
      let newLeft = resizeStartRef.current.left
      let newTop = resizeStartRef.current.top

      // 根据方向调整大小和位置
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(300, Math.min(800, resizeStartRef.current.width + deltaX))
      }
      if (resizeDirection.includes('w')) {
        newWidth = Math.max(300, Math.min(800, resizeStartRef.current.width - deltaX))
        newLeft = resizeStartRef.current.left + deltaX
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(400, Math.min(800, resizeStartRef.current.height + deltaY))
      }
      if (resizeDirection.includes('n')) {
        newHeight = Math.max(400, Math.min(800, resizeStartRef.current.height - deltaY))
        newTop = resizeStartRef.current.top + deltaY
      }

      setWindowSize({ width: newWidth, height: newHeight })
    }

    const handleResizeEnd = () => {
      setIsResizing(false)
      setResizeDirection(null)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }
  }, [isResizing, resizeDirection])

  if (!isOpen) return null

  return (
    <div 
      className="fixed bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden z-50"
      style={{
        width: windowSize.width,
        height: windowSize.height,
        left: iconPosition.x - windowSize.width + 56,
        top: iconPosition.y - windowSize.height - 10,
      }}
    >
      {/* 顶部调整手柄 */}
      <div
        className="absolute top-0 left-0 right-0 h-2 cursor-n-resize z-10"
        onMouseDown={(e) => handleResizeStart(e, 'n')}
      />

      {/* 底部调整手柄 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize z-10"
        onMouseDown={(e) => handleResizeStart(e, 's')}
      />

      {/* 左侧调整手柄 */}
      <div
        className="absolute top-0 left-0 bottom-0 w-2 cursor-w-resize z-10"
        onMouseDown={(e) => handleResizeStart(e, 'w')}
      />

      {/* 右侧调整手柄 */}
      <div
        className="absolute top-0 right-0 bottom-0 w-2 cursor-e-resize z-10"
        onMouseDown={(e) => handleResizeStart(e, 'e')}
      />

      {/* 四角调整手柄 */}
      <div
        className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-20"
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
      />
      <div
        className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-20"
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
      />
      <div
        className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-20"
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
      />
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20"
        onMouseDown={(e) => handleResizeStart(e, 'se')}
      />

      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white cursor-move">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-semibold">AI 助手</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className="flex-shrink-0">
              {message.role === 'user' ? (
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  {message.isError ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Bot className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  )}
                </div>
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.isError
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-300 border border-red-200 dark:border-red-800'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-60 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
