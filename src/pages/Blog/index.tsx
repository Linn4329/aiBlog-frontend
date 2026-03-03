import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Calendar, User, Eye, Tag, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { blogAPI } from '@/api'
import type { Post, Tag as TagType } from '@/types'

export default function BlogList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // 从 URL 获取搜索参数
  const urlSearch = searchParams.get('search') || ''
  const urlTag = searchParams.get('tag') || ''

  useEffect(() => {
    fetchTags()
    // 设置 URL 参数到状态
    if (urlSearch) setSearchQuery(urlSearch)
    if (urlTag) setSelectedTag(urlTag)
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [currentPage, selectedTag, urlSearch])

  const fetchTags = async () => {
    try {
      const response = await blogAPI.getTags()
      setTags(response.data.tags)
    } catch (error) {
      console.error('获取标签失败:', error)
    }
  }

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const params: Record<string, unknown> = { page: currentPage }
      if (selectedTag) {
        params.tag = selectedTag
      }
      if (urlSearch) {
        params.search = urlSearch
      }

      const response = await blogAPI.getPosts(params)
      const data = response.data
      
      setPosts(data.posts || [])
      setTotalPages(Math.ceil((data.count || 0) / 10))
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || '获取文章列表失败'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // 搜索
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() })
    } else {
      setSearchParams({})
    }
    setCurrentPage(1)
  }

  // 清除搜索
  const clearSearch = () => {
    setSearchQuery('')
    setSearchParams({})
    setCurrentPage(1)
  }

  const handleTagClick = (tagId: string) => {
    if (selectedTag === tagId) {
      setSelectedTag(null)
      searchParams.delete('tag')
      setSearchParams(searchParams)
    } else {
      setSelectedTag(tagId)
      searchParams.set('tag', tagId)
      setSearchParams(searchParams)
    }
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 搜索框 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          <Input
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            搜索
          </Button>
          {urlSearch && (
            <Button variant="outline" onClick={clearSearch}>
              <X className="h-4 w-4 mr-2" />
              清除
            </Button>
          )}
        </div>
        {urlSearch && (
          <p className="mt-2 text-sm text-gray-500">
            搜索结果："{urlSearch}" - 共 {posts.length} 篇文章
          </p>
        )}
      </div>

      {/* 标签筛选 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">标签筛选</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Button
              key={tag.id}
              variant={selectedTag === String(tag.id) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTagClick(String(tag.id))}
            >
              <Tag className="h-4 w-4 mr-1" />
              {tag.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 文章列表 */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">暂无文章</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow"
            >
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
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold line-clamp-2">{post.title}</h3>
                
                <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                  {post.excerpt || '暂无摘要'}
                </p>

                {/* 标签 */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* 元信息 */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.view_count}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            上一页
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  )
}
