import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ADMIN_EMAILS = ['shizhezhu@qq.com']

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const novels = await prisma.novel.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nickname: true,
          },
        },
        chapters: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(novels)
  } catch (error) {
    console.error('Failed to fetch novels:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const body = await req.json()
    const { novelId, action } = body as {
      novelId: string
      action: 'delete'
    }

    if (!novelId || !action) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    if (action === 'delete') {
      await prisma.novel.delete({
        where: { id: novelId },
      })
      return NextResponse.json({ success: true, message: '已删除' })
    }

    return NextResponse.json({ error: '无效操作' }, { status: 400 })
  } catch (error) {
    console.error('Failed to process novel:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
