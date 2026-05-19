'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

const ADMIN_EMAILS = ['shizhezhu@qq.com']

interface User {
  id: string
  email: string
  nickname: string | null
  level: number
  membershipPlan: string | null
  createdAt: string
  _count: { novels: number }
}

interface Novel {
  id: string
  title: string
  genre: string
  createdAt: string
  user: { id: string; email: string; nickname: string | null }
  chapters: { id: string }[]
}

type Tab = 'users' | 'novels'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState<User[]>([])
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    else if (status === 'authenticated' && !ADMIN_EMAILS.includes(session?.user?.email || '')) router.push('/dashboard')
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated') {
      Promise.all([fetchUsers(), fetchNovels()]).finally(() => setLoading(false))
    }
  }, [status])

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
  }

  const fetchNovels = async () => {
    const res = await fetch('/api/admin/novels')
    if (res.ok) setNovels(await res.json())
  }

  const handleToggleMember = async (userId: string, isMember: boolean) => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: isMember ? 'removeMember' : 'setMember' }),
    })
    if (res.ok) fetchUsers()
  }

  const handleDeleteNovel = async (novelId: string) => {
    if (!confirm('确定删除这个故事？')) return
    const res = await fetch('/api/admin/novels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ novelId, action: 'delete' }),
    })
    if (res.ok) fetchNovels()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  if (!session || !ADMIN_EMAILS.includes(session.user?.email || '')) return null

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 px-4 py-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">管理后台</h1>
          <p className="text-gray-500 mt-1">管理用户和小说内容</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('users')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === 'users'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            用户管理 ({users.length})
          </button>
          <button
            onClick={() => setTab('novels')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === 'novels'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            小说管理 ({novels.length})
          </button>
        </div>

        {tab === 'users' && (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{user.nickname || user.email}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {user._count.novels} 篇故事 · 注册于 {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      user.level === 2
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {user.level === 2 ? '会员' : '普通'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleMember(user.id, user.level === 2)}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full"
                    >
                      {user.level === 2 ? '移除会员' : '设为会员'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'novels' && (
          <div className="space-y-3">
            {novels.map((novel) => (
              <div key={novel.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{novel.title}</p>
                    <p className="text-sm text-gray-500">
                      {novel.genre} · {novel.chapters.length} 章
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      作者：{novel.user.nickname || novel.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/novel/${novel.id}`)}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full"
                    >
                      查看
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteNovel(novel.id)}
                      className="border-red-200 text-red-500 hover:bg-red-50 rounded-full"
                    >
                      删除
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
