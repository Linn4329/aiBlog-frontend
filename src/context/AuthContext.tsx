import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { User } from '@/types'

// 状态类型
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Action类型
type AuthAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }

// Context类型
interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void
  logout: () => void
}

// 初始状态
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    default:
      return state
  }
}

// 创建Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // 初始化：从localStorage恢复登录状态
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userInfo = localStorage.getItem('user_info')

    if (token && userInfo) {
      try {
        const user = JSON.parse(userInfo)
        dispatch({ type: 'SET_USER', payload: user })
      } catch (error) {
        console.error('解析用户信息失败:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_info')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // 登录方法
  const login = (token: string, user: User) => {
    localStorage.setItem('access_token', token)
    localStorage.setItem('user_info', JSON.stringify(user))
    dispatch({ type: 'SET_USER', payload: user })
  }

  // 登出方法
  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_info')
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 自定义Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
