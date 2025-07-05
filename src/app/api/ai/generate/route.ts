import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, script, medium } = body

    if (!projectId || !script || !medium) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create a video record to track the generation
    const video = await prisma.video.create({
      data: {
        title: `AI Generated ${medium} Content`,
        description: `Generated from script: "${script.substring(0, 100)}..."`,
        filename: `ai_generated_${Date.now()}.${getFileExtension(medium)}`,
        originalUrl: '', // Will be populated after generation
        processedUrl: '',
        status: 'PROCESSING',
        project: {
          connect: {
            id: projectId
          }
        }
      }
    })

    // Start AI generation process (this would integrate with actual AI services)
    // For now, we'll simulate the process
    setTimeout(async () => {
      try {
        await prisma.video.update({
          where: { id: video.id },
          data: {
            status: 'READY',
            originalUrl: `/generated/${video.filename}`,
            processedUrl: `/generated/${video.filename}`,
            duration: getRandomDuration(medium)
          }
        })
      } catch (error) {
        console.error('Error updating video status:', error)
        await prisma.video.update({
          where: { id: video.id },
          data: { status: 'ERROR' }
        })
      }
    }, 5000) // Simulate 5 second generation time

    return NextResponse.json({
      id: video.id,
      status: 'PROCESSING',
      message: 'AI generation started'
    })

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getFileExtension(medium: string): string {
  switch (medium) {
    case 'video':
      return 'mp4'
    case 'image':
      return 'jpg'
    case 'audio':
      return 'mp3'
    case 'text':
      return 'txt'
    default:
      return 'mp4'
  }
}

function getRandomDuration(medium: string): number {
  switch (medium) {
    case 'video':
      return Math.random() * 60 + 10 // 10-70 seconds
    case 'audio':
      return Math.random() * 120 + 30 // 30-150 seconds
    default:
      return 0
  }
} 