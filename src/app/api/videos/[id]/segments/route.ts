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

    // Verify video belongs to user
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        userId: session.user.id
      }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Fetch video segments
    const segments = await prisma.videoSegment.findMany({
      where: {
        videoId: videoId
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // Transform segments to match video editor format
    const transformedSegments = segments.map(segment => ({
      id: segment.id,
      type: segment.type as 'video' | 'image' | 'audio',
      title: segment.title,
      description: segment.description || '',
      url: segment.url,
      startTime: segment.startTime,
      endTime: segment.endTime,
      duration: segment.duration,
      thumbnail: segment.thumbnail || 'https://via.placeholder.com/120x68/6b7280/ffffff?text=No+Thumbnail'
    }))

    return NextResponse.json(transformedSegments)

  } catch (error) {
    console.error('Error fetching video segments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 