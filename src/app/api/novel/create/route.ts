import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateNovelContent } from '@/lib/ai'

export async function POST(req: Request) {
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

    const { title, genre, style, setting, prompt } = await req.json()

    if (!title || !genre || !style || !prompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const content = await generateNovelContent({
      genre,
      style,
      setting,
      prompt,
    })

    const novel = await prisma.novel.create({
      data: {
        userId: user.id,
        title,
        genre,
        style,
        setting,
        chapters: {
          create: {
            chapterNumber: 1,
            title: 'Chapter 1',
            content,
          },
        },
      },
      include: {
        chapters: true,
      },
    })

    return NextResponse.json(novel)
  } catch (error) {
    console.error('Failed to create novel:', error)
    return NextResponse.json({ error: 'Failed to create novel' }, { status: 500 })
  }
}
