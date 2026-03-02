import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Calendar, User, Eye, Tag, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { blogAPI } from '@/api'
import type { Post } from '@/types'

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchPost()
    }
  }, [id])

  const fetchPost = async () => {
    setIsLoading(true)
    try {
      const response = await blogAPI.getPost(Number(id))
      setPost(response.data.post)
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || '获取文章详情失败'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">文章不存在</p>
        <Link to="/blog">
          <Button className="mt-4">返回文章列表</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 返回按钮 */}
      <Link to="/blog">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回文章列表
        </Button>
      </Link>

      {/* 文章头部 */}
      <article className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* 封面图 */}
        {post.cover_image && (
          <div className="aspect-video bg-gray-100 dark:bg-gray-800">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 文章信息 */}
        <div className="p-8 space-y-6">
          {/* 标题 */}
          <h1 className="text-3xl font-bold">{post.title}</h1>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pb-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{post.view_count} 次浏览</span>
            </div>
          </div>

          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded-full"
                >
                  <Tag className="h-3 w-3" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* 摘要 */}
          {post.excerpt && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-blue-600">
              <p className="text-gray-700 dark:text-gray-300 italic">{post.excerpt}</p>
            </div>
          )}

          {/* 正文 */}
          <div className="prose dark:prose-invert max-w-none">
            {post.content ? (
              <div className="whitespace-pre-wrap">{post.content}</div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">暂无内容</p>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
