import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WhisperService } from '@/lib/whisper'

export async function POST(
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
    const { language } = body

    // Verify video exists and user owns it
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        project: {
          userId: session.user.id
        }
      },
      include: {
        project: true
      }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Check if video is ready for transcription
    if (video.status !== 'UPLOADING' && video.status !== 'PROCESSING') {
      return NextResponse.json(
        { error: 'Video is not ready for transcription' },
        { status: 400 }
      )
    }

    // Start transcription in background
    // In production, this would be handled by a job queue (Redis/Bull)
    WhisperService.transcribeVideo(videoId, video.originalUrl, language)
      .then((result) => {
        console.log(`Transcription completed for video ${videoId}`)
      })
      .catch((error) => {
        console.error(`Transcription failed for video ${videoId}:`, error)
      })

    return NextResponse.json({
      message: 'Transcription started',
      videoId,
      status: 'TRANSCRIBING'
    })

  } catch (error) {
    console.error('Start transcription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Get video with captions
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        project: {
          userId: session.user.id
        }
      },
      include: {
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
      status: video.status,
      duration: video.duration,
      captions: video.captions,
      language: video.captions[0]?.language || 'en'
    })

  } catch (error) {
    console.error('Get transcription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 