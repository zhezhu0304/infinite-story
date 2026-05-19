'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-lg font-semibold text-primary">无限故事</p>
            <p className="text-sm text-gray-500 mt-1">
              探索无限的故事可能性
            </p>
          </div>
          <div className="flex gap-6">
            <Link href="/donate" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              ☕ 请作者喝咖啡
            </Link>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              关于我们
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              服务条款
            </a>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-sm text-gray-400">
          © 2024 无限故事。保留所有权利。
        </div>
      </div>
    </footer>
  )
}
