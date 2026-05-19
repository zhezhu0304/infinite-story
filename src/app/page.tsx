'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/context'

export default function Home() {
  const { t } = useI18n()

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-primary">{t.home.hero.title1}</span>
            <span className="text-gray-800">{t.home.hero.title2}</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8 leading-relaxed">
            {t.home.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/novel/create">
              <Button size="lg" className="bg-primary text-white px-8 rounded-full">
                {t.home.hero.startBtn}
              </Button>
            </Link>
            <Link href="/novel">
              <Button size="lg" variant="outline" className="px-8 rounded-full border-gray-300">
                {t.home.hero.browseBtn}
              </Button>
            </Link>
          </div>

          <Link href="/donate" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            <span>☕</span>
            <span>觉得不错？请作者喝杯咖啡</span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{t.home.features.choose.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t.home.features.choose.desc}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{t.home.features.create.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t.home.features.create.desc}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{t.home.features.own.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t.home.features.own.desc}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
