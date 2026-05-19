import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const novels = await prisma.novel.findMany({
      include: {
        chapters: {
          select: { id: true },
        },
        user: {
          select: { nickname: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(novels)
  } catch (error) {
    console.error('Failed to fetch public novels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
