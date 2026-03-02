import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { blogAPI, aiAPI } from '@/api'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

export default function CreateBlog() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [tags, setTags] = useState<{ id: number; name: string }[]>([])
  const [isDraft] = useState(false)

  // 富文本编辑器
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '开始写作...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[300px] p-4 outline-none bg-white text-gray-900',
      },
    },
  })

  // 加载标签
  useEffect(() => {
    fetchTags()
    // 从 localStorage 恢复草稿
    const draft = localStorage.getItem('blog_draft')
    if (draft) {
      const draftData = JSON.parse(draft)
      setTitle(draftData.title || '')
      setExcerpt(draftData.excerpt || '')
      if (editor && draftData.content) {
        editor.commands.setContent(draftData.content)
      }
    }
  }, [editor])

  const fetchTags = async () => {
    try {
      const response = await blogAPI.getTags()
      setTags(response.data.tags)
    } catch (error) {
      console.error('获取标签失败:', error)
    }
  }

  // 封面上传预览
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 保存草稿到 localStorage
  const saveDraft = () => {
    const draft = {
      title,
      excerpt,
      content: editor?.getHTML() || '',
    }
    localStorage.setItem('blog_draft', JSON.stringify(draft))
    toast.success('草稿已保存')
  }

  // AI 生成摘要
  const handleAISummary = async () => {
    const content = editor?.getText() || ''
    if (!content.trim()) {
      toast.error('请先输入文章内容')
      return
    }

    setIsGeneratingSummary(true)
    try {
      const response = await aiAPI.summarize({ content })
      setExcerpt(response.data.summary)
      toast.success('AI 摘要生成成功')
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err?.response?.data?.error || '生成摘要失败')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  // 发布文章
  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error('请输入标题')
      return
    }
    if (!editor?.getText().trim()) {
      toast.error('请输入内容')
      return
    }

    setIsLoading(true)
    try {
      // 从内容中提取纯文本作为摘要
      const editorContent = editor?.getHTML() || ''
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = editorContent
      const plainText = tempDiv.textContent || tempDiv.innerText || ''
      
      // 使用用户输入的摘要，或从内容中提取前 200 字符
      const excerptValue = excerpt || plainText.substring(0, 200)
      
      const data: Record<string, unknown> = {
        title,
        content: editorContent,
        excerpt: excerptValue,
        status: 'published',
      }

      if (coverImage) {
        data.cover_image = coverImage
      }

      if (selectedTags.length > 0) {
        data.tags = selectedTags
      }

      console.log('发布文章数据:', data)
      const response = await blogAPI.createPost(data as {
        title: string
        content: string
        excerpt: string
        status: string
        cover_image?: File
        tags?: number[]
        })
      
      // 清除草稿
      localStorage.removeItem('blog_draft')
      
      toast.success(isDraft ? '草稿保存成功' : '文章发布成功')
      navigate(`/blog/${response.data.post.id}`)
    } catch (error) {
      console.error('发布失败:', error)
      const err = error as { response?: { data?: { message?: string; error?: unknown } } }
      const message = err?.response?.data?.message 
        || (typeof err?.response?.data?.error === 'string' ? err.response.data.error : JSON.stringify(err?.response?.data?.error))
        || '操作失败'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">写作</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveDraft} disabled={isLoading}>
            保存草稿
          </Button>
          <Button onClick={handlePublish} disabled={isLoading}>
            {isLoading ? '发布中...' : isDraft ? '发布草稿' : '发布文章'}
          </Button>
        </div>
      </div>

      {/* 封面图 */}
      <div className="space-y-2">
        <Label>封面图片</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          {coverPreview ? (
            <div className="relative">
              <img src={coverPreview} alt="封面预览" className="max-h-64 rounded-lg" />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setCoverImage(null)
                  setCoverPreview(null)
                }}
              >
                删除
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
                id="cover-upload"
              />
              <Label htmlFor="cover-upload" className="cursor-pointer">
                <div className="py-8">
                  <p className="text-gray-500">
                    点击上传封面图片
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    支持 JPG、PNG 格式
                  </p>
                </div>
              </Label>
            </div>
          )}
        </div>
      </div>

      {/* 标题 */}
      <div className="space-y-2">
        <Label htmlFor="title">标题</Label>
        <Input
          id="title"
          placeholder="请输入文章标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-semibold"
        />
      </div>

      {/* 摘要 */}
      <div className="space-y-2">
        <Label htmlFor="excerpt">摘要</Label>
        <Textarea
          id="excerpt"
          placeholder="请输入文章摘要（可选）"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAISummary}
          disabled={isGeneratingSummary}
          className="mt-2"
        >
          {isGeneratingSummary ? 'AI 写摘要中...' : 'AI 写摘要'}
        </Button>
      </div>

      {/* 标签选择 */}
      <div className="space-y-2">
        <Label>标签</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Button
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (selectedTags.includes(tag.id)) {
                  setSelectedTags(selectedTags.filter((id) => id !== tag.id))
                } else {
                  setSelectedTags([...selectedTags, tag.id])
                }
              }}
            >
              {tag.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 富文本编辑器 */}
      <div className="space-y-2">
        <Label>内容</Label>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-2 border-b border-gray-300">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={editor?.isActive('bold') ? 'bg-gray-200' : ''}
            >
              B
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={editor?.isActive('italic') ? 'bg-gray-200' : ''}
            >
              I
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
            >
              H2
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={editor?.isActive('bulletList') ? 'bg-gray-200' : ''}
            >
              列表
            </Button>
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
