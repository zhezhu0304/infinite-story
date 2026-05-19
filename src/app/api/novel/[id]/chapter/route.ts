import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateNovelContent } from '@/lib/ai'

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

    const { choice } = await req.json()

    if (!choice) {
      return NextResponse.json({ error: 'Choice is required' }, { status: 400 })
    }

    const lastChapter = novel.chapters[0]
    const nextChapterNumber = lastChapter ? lastChapter.chapterNumber + 1 : 1

    const content = await generateNovelContent({
      genre: novel.genre,
      style: novel.style,
      setting: novel.setting || undefined,
      prompt: `Continue the story based on this choice: ${choice}`,
      previousContent: lastChapter?.content,
    })

    const chapter = await prisma.chapter.create({
      data: {
        novelId: novel.id,
        chapterNumber: nextChapterNumber,
        title: `Chapter ${nextChapterNumber}`,
        content,
        choices: JSON.stringify([choice]),
        selectedChoice: 0,
      },
    })

    if (lastChapter) {
      await prisma.chapter.update({
        where: { id: lastChapter.id },
        data: { selectedChoice: 0 },
      })
    }

    return NextResponse.json(chapter)
  } catch (error) {
    console.error('Failed to generate chapter:', error)
    return NextResponse.json({ error: 'Failed to generate chapter' }, { status: 500 })
  }
}
