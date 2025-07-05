import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const videoFile = formData.get('video') as File
    const projectId = formData.get('projectId') as string

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'No projectId provided' }, { status: 400 })
    }

    // Validate file type
    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (100MB limit)
    if (videoFile.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = videoFile.name.split('.').pop()
    const filename = `video_${timestamp}.${fileExtension}`

    // TODO: Upload to cloud storage (AWS S3/Cloudflare R2)
    // For now, we'll simulate the upload
    const originalUrl = `/uploads/${filename}`
    const processedUrl = null

    // Create video record in database
    const video = await prisma.video.create({
      data: {
        title: videoFile.name.replace(/\.[^/.]+$/, ''), // Remove extension
        description: null,
        filename: filename,
        originalUrl: originalUrl,
        processedUrl: processedUrl,
        size: videoFile.size,
        format: fileExtension || 'unknown',
        status: 'UPLOADING',
        project: {
          connect: {
            id: projectId
          }
        }
      }
    })

    // TODO: Start background processing for video analysis
    // This would include:
    // 1. Extract video metadata (duration, resolution, etc.)
    // 2. Generate thumbnails
    // 3. Prepare for transcription

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
      updatedAt: video.updatedAt
    })

  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 