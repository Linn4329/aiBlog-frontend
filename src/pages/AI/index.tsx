import { useState, useEffect, useRef } from 'react'
import { Plus, MessageSquare, Trash2, Bot, User, Send, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { aiAPI } from '@/api/ai'
import type { ChatMessage, ChatSession, ChatSessionListItem } from '@/types'

export default function AIChat() {
  const [sessions, setSessions] = useState<ChatSessionListItem[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 加载会话列表
  const loadSessions = async () => {
    setIsLoadingSessions(true)
    setError(null)
    try {
      const response = await aiAPI.getSessions()
      setSessions(response.data)
    } catch (err) {
      console.error('Failed to load sessions:', err)
      setError('加载会话列表失败')
    } finally {
      setIsLoadingSessions(false)
    }
  }

  // 创建新会话
  const createNewSession = () => {
    setCurrentSession(null)
    setMessages([])
    setInput('')
    setError(null)
  }

  // 删除会话
  const deleteSession = async (sessionId: number) => {
    try {
      await aiAPI.deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (currentSession?.id === sessionId) {
        createNewSession()
      }
    } catch (err) {
      console.error('Failed to delete session:', err)
      setError('删除会话失败')
    }
  }

  // 加载会话消息
  const loadSessionMessages = async (session: ChatSessionListItem) => {
    setCurrentSession(session as ChatSession)
    setIsLoading(true)
    setError(null)
    try {
      const response = await aiAPI.getSessionMessages(session.id)
      setMessages(response.data)
    } catch (err) {
      console.error('Failed to load messages:', err)
      setError('加载消息失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const messageToSend = input.trim()
    setInput('')
    setIsLoading(true)
    setError(null)

    // 如果没有当前会话，创建新会话
    let sessionId = currentSession?.id
    if (!sessionId) {
      const response = await aiAPI.createSession({ title: messageToSend.slice(0, 20) })
      const newSession = response.data
      setSessions((prev) => [newSession, ...prev])
      setCurrentSession(newSession)
      sessionId = newSession.id
    }

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: Date.now(),
      session: sessionId || 0,
      role: 'user',
      content: messageToSend,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])

    // 创建AI消息占位符
    const assistantMessageId = Date.now() + 1
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        session: sessionId || 0,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      },
    ])

    try {
      // 使用流式API
      await aiAPI.chatStream(
        messageToSend,
        sessionId,
        // onChunk
        (chunk: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          )
        },
        // onError
        (error: string) => {
          setError(error)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: error }
                : msg
            )
          )
        },
        // onDone
        (hasError: boolean) => {
          setIsLoading(false)
          if (hasError) {
            setMessages((prev) =>
              prev.filter((msg) => msg.id !== assistantMessageId)
            )
          }
        }
      )
    } catch (err) {
      console.error('Chat error:', err)
      setError('发送消息失败，请稍后重试')
      setIsLoading(false)
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessageId)
      )
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 左侧会话列表 */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Button
            onClick={createNewSession}
            className="w-full"
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            新建对话
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>暂无对话记录</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentSession?.id === session.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => loadSessionMessages(session)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate flex-1">
                      {session.title || '未命名对话'}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {session.message_count || 0}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSession(session.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {session.last_message && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {session.last_message.role === 'user' ? '用户: ' : 'AI: '}
                      {session.last_message.content}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(session.updated_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 右侧对话区域 */}
      <div className="flex-1 flex flex-col">
        {/* 对话头部 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-semibold">
              {currentSession?.title || '新对话'}
            </h1>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-900 dark:text-red-300">{error}</p>
            </div>
          )}

          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <Bot className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg mb-2">开始新的对话</p>
              <p className="text-sm">输入消息开始与AI助手交流</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                  )}
                </div>
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-60 mt-1 block">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="输入消息... (Shift+Enter 换行)"
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
