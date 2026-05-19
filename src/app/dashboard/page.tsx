'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/context'

interface Novel {
  id: string
  title: string
  genre: string
  status: string
  createdAt: string
  chapters: { id: string }[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useI18n()
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchNovels()
    }
  }, [session])

  const fetchNovels = () => {
    fetch('/api/novel')
      .then(res => res.json())
      .then(data => setNovels(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleExport = async (novelId: string, title: string) => {
    try {
      const res = await fetch(`/api/novel/${novelId}`)
      if (!res.ok) return
      const novel = await res.json()

      let content = `${novel.title}\n类型：${novel.genre} | 风格：${novel.style}\n\n`
      content += '='.repeat(50) + '\n\n'

      for (const chapter of novel.chapters) {
        content += `第${chapter.chapterNumber}章 ${chapter.title}\n\n`
        content += chapter.content + '\n\n'
        content += '-'.repeat(30) + '\n\n'
      }

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const handleDelete = async (novelId: string) => {
    if (!confirm('确定要删除这个故事吗？此操作不可恢复。')) return

    setDeleting(novelId)
    try {
      const res = await fetch(`/api/novel/${novelId}`, { method: 'DELETE' })
      if (res.ok) {
        setNovels(prev => prev.filter(n => n.id !== novelId))
      }
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeleting(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-gray-400">{t.common.loading}</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{t.dashboard.title}</h1>
        <p className="text-gray-500 mt-1">
          {t.dashboard.welcome}, {session.user?.name || session.user?.email}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <Link href="/novel/create">
          <div className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all cursor-pointer text-center">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">✏️</span>
            </div>
            <h3 className="font-medium text-gray-800 text-sm">{t.dashboard.actions.create.title}</h3>
          </div>
        </Link>
        <Link href="/novel">
          <div className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all cursor-pointer text-center">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📚</span>
            </div>
            <h3 className="font-medium text-gray-800 text-sm">{t.dashboard.actions.browse.title}</h3>
          </div>
        </Link>
        <Link href="/donate">
          <div className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all cursor-pointer text-center">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">☕</span>
            </div>
            <h3 className="font-medium text-gray-800 text-sm">请作者喝咖啡</h3>
          </div>
        </Link>
      </div>

      {/* My Stories */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t.dashboard.myStories}</h2>
        {novels.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-gray-500 mb-4">{t.dashboard.empty}</p>
            <Link href="/novel/create">
              <Button className="bg-primary text-white rounded-full px-6">
                {t.dashboard.emptyBtn}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {novels.map((novel) => (
              <div
                key={novel.id}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <Link href={`/novel/${novel.id}`} className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 mb-1 truncate">{novel.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{novel.genre}</span>
                      <span>·</span>
                      <span>{novel.chapters.length} {t.dashboard.chapters}</span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.preventDefault(); handleExport(novel.id, novel.title) }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      导出
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.preventDefault(); handleDelete(novel.id) }}
                      disabled={deleting === novel.id}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      {deleting === novel.id ? '...' : '删除'}
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
