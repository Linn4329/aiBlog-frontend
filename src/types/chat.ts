// 聊天消息
export interface ChatMessage {
  id: number
  session: number
  role: 'user' | 'assistant' | 'system'
  content: string
  prompt_tokens?: number
  completion_tokens?: number
  created_at: string
}

// 聊天会话
export interface ChatSession {
  id: number
  user: number
  title: string
  session_type: 'consult' | 'summary'
  created_at: string
  updated_at: string
  messages?: ChatMessage[]
}

// 会话列表项（包含最后一条消息和消息数量）
export interface ChatSessionListItem {
  id: number
  title: string
  session_type: 'consult' | 'summary'
  created_at: string
  updated_at: string
  last_message?: {
    content: string
    role: string
    created_at: string
  }
  message_count: number
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
  error_type?: 'timeout' | 'api_error'
}

// 生成摘要请求
export interface SummarizeRequest {
  content: string
}

// 生成摘要响应
export interface SummarizeResponse {
  summary: string
}
