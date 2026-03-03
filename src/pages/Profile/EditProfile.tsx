import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { profileAPI } from '@/api'
import { Upload, X } from 'lucide-react'

export default function EditProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // 加载用户资料
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const response = await profileAPI.get()
      console.log('加载资料响应:', response.data)
      setNickname(response.data.profile.nickname || '')
      setBio(response.data.profile.bio || '')
      setWebsite(response.data.profile.website || '')
      // 添加基础URL到头像路径
      const avatar = response.data.profile.avatar
      if (avatar && !avatar.startsWith('http')) {
        setAvatarPreview(`http://localhost:8000${avatar}`)
      } else {
        setAvatarPreview(avatar || null)
      }
    } catch (error) {
      console.error('加载资料失败:', error)
      toast.error('获取资料失败')
    } finally {
      setLoading(false)
    }
  }

  // 头像上传预览
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
    // 重置input的value，允许重复选择同一文件
    e.target.value = ''
  }

  const removeAvatar = () => {
    setAvatar(null)
    setAvatarPreview(null)
  }

  // 保存表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data: Record<string, unknown> = {}
      // 总是提交这些字段，包括空字符串
      data.nickname = nickname
      data.bio = bio
      data.website = website
      if (avatar) data.avatar = avatar

      console.log('提交的数据:', data)
      const response = await profileAPI.update(data)
      console.log('更新响应:', response.data)
      toast.success('更新成功')
      // 触发自定义事件，通知其他组件更新
      window.dispatchEvent(new Event('profile-updated'))
      navigate('/profile')
    } catch (error) {
      console.error('更新失败:', error)
      toast.error('更新失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">编辑资料</h1>

      {/* 头像上传 */}
      <div className="space-y-2">
        <Label>头像</Label>
        <div className="flex items-center gap-6">
          {avatarPreview ? (
            <div className="relative">
              <img
                src={avatarPreview}
                alt="头像"
                className="w-24 h-24 rounded-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={removeAvatar}
                className="absolute top-0 right-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-400">U</span>
            </div>
          )}
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-upload"
            />
            <Label htmlFor="avatar-upload">
              <Upload className="h-8 w-8" />
            </Label>
          </div>
        </div>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nickname">昵称</Label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="请输入昵称"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">个人简介</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="介绍一下你自己..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">个人网站</Label>
          <Input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/profile')}
          >
            取消
          </Button>
        </div>
      </form>
    </div>
  )
}
