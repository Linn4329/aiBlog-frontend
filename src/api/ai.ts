import api from './axios'
import type { SummarizeRequest, SummarizeResponse } from '@/types'

export const aiAPI = {
  // 生成文章摘要
  summarize: (data: SummarizeRequest) =>
    api.post<SummarizeResponse>('/ai/summarize/', data),

  // 发送聊天消息（返回普通响应）
  chat: (message: string, sessionId?: number) =>
    api.post('/ai/chat/', {
      message,
      session_id: sessionId,
    }),
}
