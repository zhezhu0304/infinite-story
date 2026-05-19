'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LanguageSwitch } from '@/components/ui/language-switch'
import { useI18n } from '@/i18n/context'

export function Navbar() {
  const { data: session, status } = useSession()
  const { t } = useI18n()

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          {t.site.name}
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/novel" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 transition-colors">
            {t.nav.novels}
          </Link>

          {status === 'authenticated' ? (
            <>
              <Link href="/novel/create" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 transition-colors">
                {t.nav.create}
              </Link>
              <Link href="/dashboard" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 transition-colors">
                {t.nav.dashboard}
              </Link>
              <div className="ml-2 pl-2 border-l border-gray-200 flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {session.user?.name || session.user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {t.nav.logout}
                </Button>
              </div>
            </>
          ) : (
            <div className="ml-2 pl-2 border-l border-gray-200 flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  {t.nav.login}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary text-white">
                  {t.nav.register}
                </Button>
              </Link>
            </div>
          )}

          <div className="ml-2 pl-2 border-l border-gray-200">
            <LanguageSwitch />
          </div>
        </nav>
      </div>
    </header>
  )
}
