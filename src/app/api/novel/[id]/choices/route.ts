import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateChapterChoices } from '@/lib/ai'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const novel = await prisma.novel.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { chapterNumber: 'desc' },
          take: 1,
        },
      },
    })

    if (!novel) {
      return NextResponse.json({ error: 'Novel not found' }, { status: 404 })
    }

    if (novel.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const lastChapter = novel.chapters[0]
    if (!lastChapter) {
      return NextResponse.json({ error: 'No chapters found' }, { status: 400 })
    }

    const choices = await generateChapterChoices(novel.genre, lastChapter.content)

    return NextResponse.json({ choices })
  } catch (error) {
    console.error('Failed to generate choices:', error)
    return NextResponse.json({ error: 'Failed to generate choices' }, { status: 500 })
  }
}