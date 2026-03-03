import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { profileAPI } from '@/api'
import { User, Upload, X } from 'lucide-react'

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
      setNickname(response.data.profile.nickname || '')
      setBio(response.data.profile.bio || '')
      setWebsite(response.data.profile.website || '')
      setAvatarPreview(response.data.profile.avatar || null)
    } catch {
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
      if (nickname) data.nickname = nickname
      if (bio) data.bio = bio
      if (website) data.website = website
      if (avatar) data.avatar = avatar

      await profileAPI.update(data)
      toast.success('更新成功')
      navigate('/profile')
    } catch {
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
              <User className="h-12 w-12 text-gray-400" />
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
