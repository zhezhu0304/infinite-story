'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/context'
import { StoryGeneratingAnimation } from '@/components/story-generating-animation'

const genreKeys = [
  'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror',
  'Adventure', 'Historical', 'Modern', 'Wuxia', 'Xianxia',
]

const styleKeys = [
  'Light', 'Serious', 'Humorous', 'Dark', 'Epic',
  'Romantic', 'Suspenseful', 'Action-packed',
]

export default function CreateNovelPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useI18n()
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [style, setStyle] = useState('')
  const [setting, setSetting] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'unauthenticated') {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title || !genre || !style || !prompt) {
      setError(t.novel.create.error)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/novel/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, genre, style, setting, prompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t.common.error)
      } else {
        router.push(`/novel/${data.id}`)
      }
    } catch (err) {
      setError(t.common.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 px-4 py-8">
      {loading && <StoryGeneratingAnimation />}
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">{t.novel.create.title}</h1>
          <p className="text-gray-500 mt-1">开始创作你的互动故事</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.novel.create.storyTitle} *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder={t.novel.create.titlePlaceholder}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.novel.create.genre} *
                </label>
                <div className="flex flex-wrap gap-2">
                  {genreKeys.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenre(g)}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        genre === g
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t.novel.create.genres[g as keyof typeof t.novel.create.genres]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.novel.create.style} *
                </label>
                <div className="flex flex-wrap gap-2">
                  {styleKeys.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStyle(s)}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        style === s
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t.novel.create.styles[s as keyof typeof t.novel.create.styles]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="space-y-5">
              <div>
                <label htmlFor="setting" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.novel.create.setting}
                </label>
                <textarea
                  id="setting"
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  placeholder={t.novel.create.settingPlaceholder}
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.novel.create.prompt} *
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  placeholder={t.novel.create.promptPlaceholder}
                  rows={5}
                  required
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary text-white rounded-lg py-2.5" disabled={loading}>
            {loading ? t.novel.create.loading : t.novel.create.submitBtn}
          </Button>
        </form>
      </div>
    </div>
  )
}
