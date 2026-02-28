// 聊天消息
export interface ChatMessage {
  id: number
  session: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// 聊天会话
export interface ChatSession {
  id: number
  user: number
  title: string
  created_at: string
  updated_at: string
}

// 发送消息请求
export interface SendMessageRequest {
  message: string
  session_id?: number
}

// SSE消息类型
export interface SSEMessage {
  type: 'session' | 'content' | 'done' | 'error'
  session_id?: number
  text?: string
  has_error?: boolean
  error?: string
}

// 生成摘要请求
export interface SummarizeRequest {
  content: string
}

// 生成摘要响应
export interface SummarizeResponse {
  summary: string
}
