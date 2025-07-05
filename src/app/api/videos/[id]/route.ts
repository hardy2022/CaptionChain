import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const videoId = params.id

    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        project: {
          userId: session.user.id
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        captions: {
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: video.id,
      title: video.title,
      description: video.description,
      filename: video.filename,
      originalUrl: video.originalUrl,
      processedUrl: video.processedUrl,
      duration: video.duration,
      size: video.size,
      format: video.format,
      status: video.status,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      project: video.project,
      captions: video.captions
    })
  } catch (error) {
    console.error('Get video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const videoId = params.id
    const body = await request.json()
    const { title, description } = body

    const video = await prisma.video.updateMany({
      where: {
        id: videoId,
        project: {
          userId: session.user.id
        }
      },
      data: {
        title: title?.trim() || undefined,
        description: description?.trim() || undefined,
        updatedAt: new Date()
      }
    })

    if (video.count === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const videoId = params.id

    const video = await prisma.video.deleteMany({
      where: {
        id: videoId,
        project: {
          userId: session.user.id
        }
      }
    })

    if (video.count === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 