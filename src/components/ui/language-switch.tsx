'use client'

import { useI18n } from '@/i18n/context'

export function LanguageSwitch() {
  const { locale, toggleLocale } = useI18n()

  return (
    <button
      onClick={toggleLocale}
      className="px-3 py-1.5 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
      title={locale === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      {locale === 'zh' ? 'EN' : '中'}
    </button>
  )
}