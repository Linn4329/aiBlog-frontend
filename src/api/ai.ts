import api from './axios'
import type { SummarizeRequest, SummarizeResponse, SSEMessage, ChatSession, ChatMessage, ChatSessionListItem } from '@/types'

export const aiAPI = {
  // 生成文章摘要
  summarize: (data: SummarizeRequest) =>
    api.post<SummarizeResponse>('/ai/summarize/', data),

  // 流式对话
  chatStream: async (
    message: string,
    sessionId?: number,
    onChunk?: (chunk: string) => void,
    onError?: (error: string) => void,
    onDone?: (hasError: boolean) => void
  ) => {
    const token = localStorage.getItem('access_token')
    const response = await fetch('http://localhost:8000/api/ai/chat/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message, session_id: sessionId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: SSEMessage = JSON.parse(line.slice(6))

              if (data.type === 'session' && data.session_id) {
                // 会话ID，可用于保存会话
                console.log('Session ID:', data.session_id)
              } else if (data.type === 'content' && data.text && onChunk) {
                // 流式内容
                onChunk(data.text)
              } else if (data.type === 'error' && onError) {
                // 错误信息
                const errorMessage = data.error || '未知错误'
                onError(errorMessage)
              } else if (data.type === 'done' && onDone) {
                // 完成
                onDone(data.has_error || false)
              }
            } catch (e) {
              console.error('Failed to parse SSE message:', e)
            }
          }
        }
      }
    } finally {
      reader?.releaseLock()
    }
  },

  // 获取会话列表
  getSessions: () => api.get<ChatSessionListItem[]>('/ai/sessions/'),

  // 创建新会话
  createSession: (data: { title?: string; session_type?: string }) =>
    api.post<ChatSession>('/ai/sessions/', data),

  // 获取会话详情
  getSession: (sessionId: number) =>
    api.get<ChatSession>(`/ai/sessions/${sessionId}/`),

  // 更新会话
  updateSession: (sessionId: number, data: { title?: string }) =>
    api.put<ChatSession>(`/ai/sessions/${sessionId}/`, data),

  // 删除会话
  deleteSession: (sessionId: number) =>
    api.delete(`/ai/sessions/${sessionId}/`),

  // 获取会话消息
  getSessionMessages: (sessionId: number) =>
    api.get<ChatMessage[]>(`/ai/sessions/${sessionId}/messages/`),
}
