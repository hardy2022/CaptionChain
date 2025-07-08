import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const captionId = id
    const body = await request.json()
    const { text, startTime, endTime } = body

    // Verify caption exists and user owns the video
    const caption = await prisma.caption.findFirst({
      where: {
        id: captionId,
        video: {
          project: {
            userId: session.user.id
          }
        }
      }
    })

    if (!caption) {
      return NextResponse.json({ error: 'Caption not found' }, { status: 404 })
    }

    // Update caption
    const updatedCaption = await prisma.caption.update({
      where: { id: captionId },
      data: {
        text: text || caption.text,
        startTime: startTime !== undefined ? startTime : caption.startTime,
        endTime: endTime !== undefined ? endTime : caption.endTime,
      }
    })

    return NextResponse.json({
      id: updatedCaption.id,
      text: updatedCaption.text,
      startTime: updatedCaption.startTime,
      endTime: updatedCaption.endTime,
      language: updatedCaption.language
    })
  } catch (error) {
    console.error('Update caption error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const captionId = id

    // Verify caption exists and user owns the video
    const caption = await prisma.caption.findFirst({
      where: {
        id: captionId,
        video: {
          project: {
            userId: session.user.id
          }
        }
      }
    })

    if (!caption) {
      return NextResponse.json({ error: 'Caption not found' }, { status: 404 })
    }

    // Delete caption
    await prisma.caption.delete({
      where: { id: captionId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete caption error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 