import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, TrendingUp, Clock, Tag as TagIcon } from 'lucide-react'
import { blogAPI } from '@/api'
import type { Post, Tag } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function Home() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // 搜索跳转
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/blog?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  useEffect(() => {
    Promise.all([
      blogAPI.getPosts(),
      blogAPI.getTags()
    ]).then(([postsRes, tagsRes]) => {
      setPosts(postsRes.data.posts)
      setTags(tagsRes.data.tags)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  // 热门文章（按浏览量排序，取前 5 篇）
  const hotPosts = [...posts]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 5)

  // 最新文章（取前 6 篇）
  const latestPosts = posts.slice(0, 6)

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-8">
      {/* Hero 区域 */}
      <section className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <h1 className="text-4xl font-bold mb-4">欢迎来到 AI Blog</h1>
        <p className="text-gray-600 mb-6">分享知识，记录成长</p>
        <div className="max-w-md mx-auto flex gap-2">
          <Input
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* 热门文章 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold">热门文章</h2>
        </div>
        <div className="space-y-3">
          {hotPosts.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="flex items-center gap-4 p-3 bg-white rounded-lg hover:shadow-md transition"
            >
              <span className="text-2xl font-bold text-gray-300">{index + 1}</span>
              <div className="flex-1">
                <h3 className="font-medium">{post.title}</h3>
                <p className="text-sm text-gray-500">{post.view_count} 次浏览</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 最新文章 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-bold">最新文章</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {latestPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {post.cover_image && (
                <img src={post.cover_image} alt="" className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-medium mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <span>{post.author}</span>
                  <span>·</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 标签云 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TagIcon className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-bold">热门标签</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/blog?tag=${tag.id}`}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
