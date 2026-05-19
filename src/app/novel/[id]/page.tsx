'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/context'
import { StoryGeneratingAnimation } from '@/components/story-generating-animation'

type ReaderTheme = 'light' | 'dark' | 'sepia' | 'green'

interface Chapter {
  id: string
  chapterNumber: number
  title: string
  content: string
  choices: string | null
  selectedChoice: number | null
}

interface Novel {
  id: string
  title: string
  genre: string
  style: string
  setting: string | null
  status: string
  userId: string
  chapters: Chapter[]
}

const themes: Record<ReaderTheme, { bg: string; text: string; muted: string; border: string; toolbarBg: string }> = {
  light:  { bg: '#ffffff', text: '#1a1a1a', muted: '#666666', border: '#e5e7eb', toolbarBg: 'rgba(255,255,255,0.95)' },
  dark:   { bg: '#1a1a2e', text: '#d4d4d4', muted: '#888888', border: '#2a2a3e', toolbarBg: 'rgba(26,26,46,0.95)' },
  sepia:  { bg: '#f5e6c8', text: '#5b4636', muted: '#8b7355', border: '#d4c4a8', toolbarBg: 'rgba(245,230,200,0.95)' },
  green:  { bg: '#c7edcc', text: '#2d4a3e', muted: '#5a7a6a', border: '#a8d4ad', toolbarBg: 'rgba(199,237,204,0.95)' },
}

export default function NovelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useI18n()
  const [novel, setNovel] = useState<Novel | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [choices, setChoices] = useState<string[]>([])
  const [loadingChoices, setLoadingChoices] = useState(false)

  // Reader state
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('light')
  const [fontSize, setFontSize] = useState(18)
  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [showFontPicker, setShowFontPicker] = useState(false)

  const theme = themes[readerTheme]
  const isOwner = session?.user && novel?.userId === (session.user as any).id

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('readerTheme') as ReaderTheme
    if (savedTheme && themes[savedTheme]) setReaderTheme(savedTheme)
    const savedSize = localStorage.getItem('readerFontSize')
    if (savedSize) setFontSize(Number(savedSize))
  }, [])

  const handleThemeChange = useCallback((t: ReaderTheme) => {
    setReaderTheme(t)
    localStorage.setItem('readerTheme', t)
    setShowThemePicker(false)
  }, [])

  const handleFontSizeChange = useCallback((size: number) => {
    setFontSize(size)
    localStorage.setItem('readerFontSize', String(size))
  }, [])

  useEffect(() => {
    fetchNovel()
  }, [id])

  const fetchNovel = async () => {
    try {
      const res = await fetch(`/api/novel/${id}`)
      if (res.ok) setNovel(await res.json())
      else router.push('/novel')
    } catch (e) {
      console.error('Failed to fetch novel:', e)
    } finally {
      setLoading(false)
    }
  }

  const generateChoices = async () => {
    if (!session) {
      router.push('/login')
      return
    }
    setLoadingChoices(true)
    try {
      const res = await fetch(`/api/novel/${id}/choices`, { method: 'POST' })
      if (res.ok) setChoices((await res.json()).choices)
      else if (res.status === 401 || res.status === 403) router.push('/login')
    } catch (e) {
      console.error('Failed to generate choices:', e)
    } finally {
      setLoadingChoices(false)
    }
  }

  const generateChapter = async (choice: string) => {
    if (!session) {
      router.push('/login')
      return
    }
    setGenerating(true)
    try {
      const res = await fetch(`/api/novel/${id}/chapter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice }),
      })
      if (res.ok) { await fetchNovel(); setChoices([]) }
      else if (res.status === 401 || res.status === 403) router.push('/login')
      else { const d = await res.json(); alert(d.error || t.common.error) }
    } catch (e) {
      console.error('Failed to generate chapter:', e)
    } finally {
      setGenerating(false)
    }
  }

  const scrollToChapter = (chapterId: string) => {
    const el = document.getElementById(`chapter-${chapterId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setCurrentChapterIndex(novel?.chapters.findIndex(c => c.id === chapterId) ?? 0)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[80vh]"><div className="text-muted-foreground">{t.common.loading}</div></div>
  }
  if (!novel) return null

  const themeKeys = Object.keys(themes) as ReaderTheme[]
  const currentChapter = novel.chapters[currentChapterIndex]

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100vh', transition: 'background 0.3s, color 0.3s' }}>
      {(generating || loadingChoices) && <StoryGeneratingAnimation />}

      {/* ===== Chapter Drawer ===== */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setDrawerOpen(false)}
      />
      <div
        className={`fixed top-0 left-0 z-50 h-full w-[80%] max-w-xs border-r shadow-xl transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: theme.bg, borderColor: theme.border }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: theme.border }}>
          <span className="text-lg font-semibold" style={{ color: theme.text }}>{t.novel.reader.chapterList}</span>
          <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70" style={{ color: theme.muted }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          {novel.chapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => { scrollToChapter(ch.id); setDrawerOpen(false) }}
              className="w-full text-left px-4 py-3.5 border-b transition-colors"
              style={{
                borderColor: theme.border,
                color: ch.id === currentChapter?.id ? 'var(--primary)' : theme.text,
                background: ch.id === currentChapter?.id ? 'rgba(37,99,235,0.08)' : 'transparent',
              }}
            >
              <span className="text-sm font-medium">{ch.chapterNumber}. {ch.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== Top Bar ===== */}
      <div
        className={`fixed top-0 left-0 right-0 z-30 border-b transition-all duration-300 backdrop-blur-xl ${toolbarVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
        style={{ background: theme.toolbarBg, borderColor: theme.border }}
      >
        <div className="flex items-center h-12 px-4 max-w-2xl mx-auto">
          <button onClick={() => router.push('/novel')} className="w-8 h-8 flex items-center justify-center shrink-0" style={{ color: theme.text }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span className="flex-1 text-center text-sm font-medium truncate px-2" style={{ color: theme.text }}>{novel.title}</span>
          <span className="text-xs shrink-0" style={{ color: theme.muted }}>{currentChapterIndex + 1}/{novel.chapters.length}</span>
        </div>
      </div>

      {/* ===== Bottom Bar ===== */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 border-t transition-all duration-300 backdrop-blur-xl ${toolbarVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
        style={{ background: theme.toolbarBg, borderColor: theme.border }}
      >
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
          <button onClick={() => { setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1)); setToolbarVisible(false) }} disabled={currentChapterIndex <= 0} className="flex flex-col items-center gap-0.5 min-w-[48px] disabled:opacity-30" style={{ color: theme.text }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            <span className="text-[10px]">{t.novel.reader.prevChapter}</span>
          </button>
          <button onClick={() => { setDrawerOpen(true); setToolbarVisible(false) }} className="flex flex-col items-center gap-0.5 min-w-[48px]" style={{ color: theme.text }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            <span className="text-[10px]">{t.novel.reader.chapterList}</span>
          </button>
          <button onClick={() => { setShowThemePicker(!showThemePicker); setShowFontPicker(false) }} className="flex flex-col items-center gap-0.5 min-w-[48px]" style={{ color: theme.text }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
            <span className="text-[10px]">{t.novel.reader.theme}</span>
          </button>
          <button onClick={() => { setShowFontPicker(!showFontPicker); setShowThemePicker(false) }} className="flex flex-col items-center gap-0.5 min-w-[48px]" style={{ color: theme.text }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>
            <span className="text-[10px]">{t.novel.reader.fontSize}</span>
          </button>
          <button onClick={() => { setCurrentChapterIndex(Math.min(novel.chapters.length - 1, currentChapterIndex + 1)); setToolbarVisible(false) }} disabled={currentChapterIndex >= novel.chapters.length - 1} className="flex flex-col items-center gap-0.5 min-w-[48px] disabled:opacity-30" style={{ color: theme.text }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            <span className="text-[10px]">{t.novel.reader.nextChapter}</span>
          </button>
        </div>

        {showThemePicker && (
          <div className="border-t px-4 py-3" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-center gap-6">
              {themeKeys.map((key) => (
                <button key={key} onClick={() => handleThemeChange(key)} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-10 h-10 rounded-full border-2 transition-transform ${readerTheme === key ? 'scale-110' : ''}`}
                    style={{ background: themes[key].bg, borderColor: readerTheme === key ? '#2563eb' : themes[key].border, boxShadow: readerTheme === key ? '0 0 0 2px #2563eb' : 'none' }}
                  />
                  <span className="text-[10px]" style={{ color: theme.muted }}>{t.novel.reader.themes[key]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {showFontPicker && (
          <div className="border-t px-4 py-3" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => handleFontSizeChange(Math.max(14, fontSize - 2))} className="w-10 h-10 rounded-full border flex items-center justify-center text-lg font-bold" style={{ borderColor: theme.border, color: theme.text }}>A-</button>
              <span className="text-sm w-12 text-center tabular-nums" style={{ color: theme.text }}>{fontSize}px</span>
              <button onClick={() => handleFontSizeChange(Math.min(28, fontSize + 2))} className="w-10 h-10 rounded-full border flex items-center justify-center text-lg font-bold" style={{ borderColor: theme.border, color: theme.text }}>A+</button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Reading Area ===== */}
      <div
        className="max-w-[680px] mx-auto px-5 py-16 cursor-pointer select-none"
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.9 }}
        onClick={() => { setToolbarVisible(!toolbarVisible); setShowThemePicker(false); setShowFontPicker(false) }}
      >
        <div className="mb-12 text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>{novel.title}</h1>
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: theme.muted }}>
            <span>{novel.genre}</span><span>·</span><span>{novel.style}</span>
          </div>
        </div>

        {novel.chapters.map((chapter) => (
          <div key={chapter.id} id={`chapter-${chapter.id}`} className="mb-16">
            <h2 className="text-xl font-bold mb-6 text-center" style={{ color: theme.text }}>{chapter.title}</h2>
            <div>
              {chapter.content.split('\n').filter(p => p.trim()).map((paragraph, i) => (
                <p key={i} style={{ color: theme.text, textIndent: '2em', marginBottom: '0.5em' }}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}

        {/* 只有作者才能续写 */}
        {isOwner && (
          choices.length > 0 ? (
            <div className="mt-8 mb-16 rounded-lg p-6" style={{ border: `1px solid ${theme.border}` }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>{t.novel.detail.chooseTitle}</h3>
              <div className="space-y-3">
                {choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); generateChapter(choice) }}
                    disabled={generating}
                    className="w-full text-left p-4 rounded-md transition-colors disabled:opacity-50 hover:opacity-80"
                    style={{ border: `1px solid ${theme.border}`, color: theme.text }}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            novel.chapters.length > 0 && (
              <div className="mt-8 mb-16" onClick={(e) => e.stopPropagation()}>
                <Button onClick={generateChoices} disabled={loadingChoices} className="w-full">
                  {loadingChoices ? t.novel.detail.generating : t.novel.detail.generateChoices}
                </Button>
              </div>
            )
          )
        )}

        {/* 非作者登录用户提示 */}
        {session && !isOwner && (
          <div className="mt-8 mb-16 text-center" style={{ color: theme.muted }}>
            <p className="text-sm">这是其他用户创作的故事</p>
          </div>
        )}

        {/* 未登录用户提示 */}
        {!session && (
          <div className="mt-8 mb-16 text-center">
            <p className="text-sm mb-3" style={{ color: theme.muted }}>登录后可以创作自己的故事</p>
            <Button variant="outline" onClick={() => router.push('/login')}>登录 / 注册</Button>
          </div>
        )}
      </div>

      {toolbarVisible && <div className="h-20" />}
    </div>
  )
}
