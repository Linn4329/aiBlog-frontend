import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

// 懒加载页面组件
const Home = lazy(() => import('@/pages/Home'))
const BlogList = lazy(() => import('@/pages/Blog'))
const BlogDetail = lazy(() => import('@/pages/Blog/BlogDetail'))
const CreateBlog = lazy(() => import('@/pages/Blog/CreateBlog'))
const AIChat = lazy(() => import('@/pages/AI'))
const Profile = lazy(() => import('@/pages/Profile'))
const EditProfile = lazy(() => import('@/pages/Profile/EditProfile'))
const Login = lazy(() => import('@/pages/Auth/Login'))
const Register = lazy(() => import('@/pages/Auth/Register'))

// 加载占位组件
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
      </div>
    </div>
  )
}

// 路由配置
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // 公开路由
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'blog',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BlogList />
          </Suspense>
        ),
      },
      {
        path: 'blog/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BlogDetail />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: 'register',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Register />
          </Suspense>
        ),
      },

      // 受保护路由（需要登录）
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'blog/create',
            element: (
              <Suspense fallback={<PageLoader />}>
                <CreateBlog />
              </Suspense>
            ),
          },
          {
            path: 'ai-chat',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AIChat />
              </Suspense>
            ),
          },
          {
            path: 'profile/edit',
            element: (
              <Suspense fallback={<PageLoader />}>
                <EditProfile />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
])
