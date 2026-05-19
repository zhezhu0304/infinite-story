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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nickname: true,
        level: true,
        membershipPlan: true,
        createdAt: true,
        _count: {
          select: {
            novels: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Failed to fetch users:', error)
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
    const { userId, action } = body as {
      userId: string
      action: 'setMember' | 'removeMember'
    }

    if (!userId || !action) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    if (action === 'setMember') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          level: 2,
          membershipPlan: 'lifetime',
          membershipStart: new Date(),
        },
      })
      return NextResponse.json({ success: true, message: '已设为会员' })
    } else if (action === 'removeMember') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          level: 1,
          membershipPlan: null,
          membershipStart: null,
          membershipEnd: null,
        },
      })
      return NextResponse.json({ success: true, message: '已移除会员' })
    }

    return NextResponse.json({ error: '无效操作' }, { status: 400 })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
