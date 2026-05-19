import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const novels = await prisma.novel.findMany({
      where: { userId: user.id },
      include: {
        chapters: {
          select: { id: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(novels)
  } catch (error) {
    console.error('Failed to fetch novels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}