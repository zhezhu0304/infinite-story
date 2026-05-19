'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type PaymentMethod = 'wechat' | 'alipay'

export default function DonatePage() {
  const [method, setMethod] = useState<PaymentMethod | null>(null)

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 px-4 py-12">
      <div className="container mx-auto max-w-lg">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">☕</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">请作者喝杯咖啡</h1>
          <p className="text-gray-500">
            如果这个项目对你有帮助，欢迎请作者喝杯咖啡
          </p>
        </div>

        {!method ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-center text-sm text-gray-500 mb-4">选择支付方式</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMethod('wechat')}
                className="p-6 border border-gray-200 rounded-xl text-center hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <div className="text-4xl mb-2">💚</div>
                <p className="font-medium text-gray-800">微信支付</p>
              </button>
              <button
                onClick={() => setMethod('alipay')}
                className="p-6 border border-gray-200 rounded-xl text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="text-4xl mb-2">💙</div>
                <p className="font-medium text-gray-800">支付宝</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gray-50 rounded-xl">
                <img
                  src={method === 'wechat' ? '/wechat-qr.jpg' : '/alipay-qr.jpg'}
                  alt={method === 'wechat' ? '微信收款码' : '支付宝收款码'}
                  className="w-56 h-56 object-contain"
                />
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mb-6">
              <p>扫描上方二维码向作者打赏</p>
              <p className="mt-1">金额随意，感谢支持！</p>
            </div>

            <Button
              variant="outline"
              className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setMethod(null)}
            >
              返回
            </Button>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>所有功能均免费使用，打赏纯属自愿</p>
        </div>
      </div>
    </div>
  )
}
