'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/context'

interface Novel {
  id: string
  title: string
  genre: string
  style: string
  status: string
  chapters: { id: string }[]
  user: { nickname: string | null }
}

export default function NovelListPage() {
  const { t } = useI18n()
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublicNovels()
  }, [])

  const fetchPublicNovels = async () => {
    try {
      const response = await fetch('/api/novel/public')
      if (response.ok) {
        const data = await response.json()
        setNovels(data)
      }
    } catch (error) {
      console.error('Failed to fetch novels:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-gray-400">{t.common.loading}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t.novel.list.title}</h1>
          <p className="text-gray-500 mt-1">探索其他用户创作的故事</p>
        </div>
        <Link href="/novel/create">
          <Button className="bg-primary text-white rounded-full px-6">
            {t.novel.list.createBtn}
          </Button>
        </Link>
      </div>

      {novels.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <p className="text-gray-500 mb-4">{t.novel.list.empty}</p>
          <Link href="/novel/create">
            <Button className="bg-primary text-white rounded-full px-6">
              {t.novel.list.emptyBtn}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {novels.map((novel) => (
            <Link key={novel.id} href={`/novel/${novel.id}`}>
              <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all h-full">
                <h3 className="font-medium text-gray-800 mb-2 truncate">{novel.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span>{novel.genre}</span>
                  <span>·</span>
                  <span>{novel.style}</span>
                  <span>·</span>
                  <span>{novel.chapters.length} {t.dashboard.chapters}</span>
                </div>
                <p className="text-sm text-gray-400">
                  {t.novel.list.by} {novel.user.nickname || 'Anonymous'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
