import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pexelsAPI } from '@/lib/pexels'

export async function POST(request: NextRequest) {
  try {
    console.log('Video generation API called')
    
    const session = await getServerSession(authOptions)
    console.log('Session data:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })
    
    if (!session?.user?.id) {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, script } = body

    console.log('Request body:', { projectId, scriptLength: script?.length })

    if (!projectId || !script) {
      console.log('Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify project belongs to user
    console.log('Verifying project ownership...')
    console.log('Looking for project:', projectId, 'for user:', session.user.id)
    
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })
    
    console.log('Project query result:', project ? 'Found' : 'Not found')

    if (!project) {
      console.log('Project not found or unauthorized')
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    console.log('Project verified:', project.id)

    // Create a video record to track the generation
    console.log('Creating video record...')
    console.log('Video data:', {
      title: `AI Generated Video from Script`,
      description: `Generated from script: "${script.substring(0, 100)}..."`,
      filename: `ai_video_${Date.now()}.mp4`,
      userId: session.user.id,
      projectId: projectId
    })
    
    const video = await prisma.video.create({
      data: {
        title: `AI Generated Video from Script`,
        description: `Generated from script: "${script.substring(0, 100)}..."`,
        filename: `ai_video_${Date.now()}.mp4`,
        originalUrl: '', // Will be populated after generation
        processedUrl: '',
        status: 'PROCESSING' as const,
        userId: session.user.id,
        projectId: projectId
      }
    })

    console.log('Video record created:', video.id)

    // Start the AI video generation process
    // This would integrate with actual AI services like:
    // - OpenAI for script analysis
    // - Pexels/Unsplash APIs for media search
    // - FFmpeg for video composition
    // Fire and forget - don't await to avoid blocking the response
    startVideoGeneration(video.id, script).catch(error => {
      console.error('Background video generation error:', error)
    })

    console.log('Returning success response')
    return NextResponse.json({
      videoId: video.id,
      status: 'PROCESSING',
      message: 'Video generation started'
    })

  } catch (error) {
    console.error('Video generation error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error message:', error instanceof Error ? error.message : 'No message')
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function startVideoGeneration(videoId: string, script: string) {
  try {
    console.log(`Starting video generation for video ${videoId}`)
    
    // Step 1: Analyze script and break into segments
    const segments = await analyzeScript(script)
    console.log(`Script analyzed into ${segments.length} segments`)
    
    // Step 2: Search for relevant media for each segment
    const mediaClips = await searchMediaForSegments(segments)
    console.log(`Found ${mediaClips.length} media clips`)
    
    // Step 3: Store media clips as video segments in database
    await storeVideoSegments(videoId, segments, mediaClips)
    console.log(`Stored ${mediaClips.length} video segments in database`)
    
    // Step 4: Compose video with timing synchronization
    const videoUrl = await composeVideo(segments, mediaClips)
    console.log(`Video composed successfully: ${videoUrl}`)
    
    // Step 5: Update video record with final URL
    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'READY' as const,
        originalUrl: videoUrl,
        processedUrl: videoUrl,
        duration: calculateTotalDuration(segments)
      }
    })
    
    console.log(`Video generation completed for ${videoId}`)
    
  } catch (error) {
    console.error(`Error in video generation for ${videoId}:`, error)
    
    // Update video status to ERROR
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'ERROR' as const }
    })
  }
}

interface ScriptSegment {
  id: string
  text: string
  duration: number
  keywords: string[]
  visualDescription: string
}

async function analyzeScript(script: string): Promise<ScriptSegment[]> {
  // This would integrate with OpenAI or similar AI service
  // For now, we'll create a simple segmentation
  
  const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  return sentences.map((sentence, index) => ({
    id: `segment-${index}`,
    text: sentence.trim(),
    duration: Math.max(3, sentence.length / 10), // 3-10 seconds per sentence
    keywords: extractKeywords(sentence),
    visualDescription: generateVisualDescription(sentence)
  }))
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - in production, use NLP libraries
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
  const words = text.toLowerCase().split(/\s+/)
  return words.filter(word => 
    word.length > 3 && 
    !commonWords.includes(word) &&
    /^[a-zA-Z]+$/.test(word)
  ).slice(0, 5)
}

function generateVisualDescription(text: string): string {
  // Simple visual description generation
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('sunset') || lowerText.includes('sun')) return 'sunset landscape'
  if (lowerText.includes('ocean') || lowerText.includes('sea') || lowerText.includes('wave')) return 'ocean waves'
  if (lowerText.includes('mountain')) return 'mountain landscape'
  if (lowerText.includes('bird') || lowerText.includes('fly')) return 'birds flying'
  if (lowerText.includes('night') || lowerText.includes('dark')) return 'night sky'
  if (lowerText.includes('city') || lowerText.includes('urban')) return 'city skyline'
  if (lowerText.includes('forest') || lowerText.includes('tree')) return 'forest nature'
  if (lowerText.includes('car') || lowerText.includes('road')) return 'road driving'
  
  return 'nature landscape'
}

interface MediaClip {
  id: string
  url: string
  type: 'video' | 'image'
  duration: number
  keywords: string[]
  segmentId: string
  thumbnail?: string
}

async function searchMediaForSegments(segments: ScriptSegment[]): Promise<MediaClip[]> {
  const mediaClips: MediaClip[] = []
  
  for (const segment of segments) {
    try {
      // Search for media using the visual description and keywords
      const searchQuery = `${segment.visualDescription} ${segment.keywords.join(' ')}`
      
      // This would integrate with Pexels, Unsplash, or similar APIs
      const mediaItems = await searchMediaAPI(searchQuery)
      
      if (mediaItems.length > 0) {
        const selectedMedia = mediaItems[0] // Select the best match
        mediaClips.push({
          id: `clip-${segment.id}`,
          url: selectedMedia.url,
          type: selectedMedia.type,
          duration: segment.duration,
          keywords: segment.keywords,
          segmentId: segment.id,
          thumbnail: selectedMedia.thumbnail
        })
      }
    } catch (error) {
      console.error(`Error searching media for segment ${segment.id}:`, error)
    }
  }
  
  return mediaClips
}

async function searchMediaAPI(query: string): Promise<any[]> {
  try {
    console.log(`Searching Pexels for: ${query}`)
    
    // Check if API key is configured
    if (!process.env.PEXELS_API_KEY) {
      console.log('Pexels API key not configured, using fallback content')
      return getFallbackMedia(query)
    }
    
    // Search for videos first
    const videoResponse = await pexelsAPI.searchVideos(query, 1, 5)
    const videos = videoResponse.videos?.map(video => ({
      url: pexelsAPI.getBestVideoFile(video),
      type: 'video',
      duration: video.duration,
      thumbnail: pexelsAPI.getThumbnail(video),
      title: `Video by ${video.user.name}`,
      width: video.width,
      height: video.height
    })) || []

    // If no videos found, search for images
    if (videos.length === 0) {
      const imageResponse = await pexelsAPI.searchImages(query, 1, 5)
      const images = imageResponse.photos?.map(photo => ({
        url: photo.src.large2x,
        type: 'image',
        duration: 5, // Default duration for images
        thumbnail: photo.src.medium,
        title: photo.alt || `Photo by ${photo.photographer}`,
        width: photo.width,
        height: photo.height
      })) || []
      
      return images
    }

    return videos
  } catch (error) {
    console.error('Error searching Pexels:', error)
    console.log('Using fallback content due to API error')
    return getFallbackMedia(query)
  }
}

function getFallbackMedia(query: string): any[] {
  // Provide different fallback content based on query
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('sunset') || lowerQuery.includes('ocean')) {
    return [
      {
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        type: 'video',
        duration: 10,
        thumbnail: 'https://via.placeholder.com/320x180/ff6b35/ffffff?text=Sunset+Scene',
        title: 'Beautiful Sunset Scene',
        width: 1280,
        height: 720
      }
    ]
  }
  
  if (lowerQuery.includes('mountain') || lowerQuery.includes('landscape')) {
    return [
      {
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        type: 'video',
        duration: 8,
        thumbnail: 'https://via.placeholder.com/320x180/10b981/ffffff?text=Mountain+Scene',
        title: 'Mountain Landscape',
        width: 1280,
        height: 720
      }
    ]
  }
  
  if (lowerQuery.includes('city') || lowerQuery.includes('urban')) {
    return [
      {
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        type: 'video',
        duration: 12,
        thumbnail: 'https://via.placeholder.com/320x180/3b82f6/ffffff?text=City+Scene',
        title: 'City Skyline',
        width: 1280,
        height: 720
      }
    ]
  }
  
  // Default fallback
  return [
    {
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      type: 'video',
      duration: 10,
      thumbnail: 'https://via.placeholder.com/320x180/6b7280/ffffff?text=Sample+Video',
      title: 'Sample Video Content',
      width: 1280,
      height: 720
    }
  ]
}

async function composeVideo(segments: ScriptSegment[], mediaClips: MediaClip[]): Promise<string> {
  // This would integrate with FFmpeg or similar video processing library
  // For now, return the first media clip URL as the "composed" video
  
  const videoId = `generated_${Date.now()}`
  
  console.log(`Composing video with ${segments.length} segments and ${mediaClips.length} clips`)
  
  // In production, this would:
  // 1. Download media clips from URLs
  // 2. Process them with FFmpeg
  // 3. Add transitions between clips
  // 4. Synchronize with script timing
  // 5. Upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
  
  // For now, return the first available media clip
  if (mediaClips.length > 0) {
    console.log(`Using media clip: ${mediaClips[0].url}`)
    return mediaClips[0].url
  }
  
  // Fallback to sample video
  return 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
}

async function storeVideoSegments(videoId: string, segments: ScriptSegment[], mediaClips: MediaClip[]) {
  console.log(`Storing video segments for video ${videoId}`)
  
  // Create video segments in database
  const segmentData = mediaClips.map((clip, index) => {
    const segment = segments.find(s => s.id === clip.segmentId)
    const startTime = index === 0 ? 0 : mediaClips.slice(0, index).reduce((sum, c) => sum + c.duration, 0)
    const endTime = startTime + clip.duration
    
    return {
      title: segment?.text.substring(0, 50) || `Segment ${index + 1}`,
      description: segment?.text || '',
      url: clip.url,
      thumbnail: clip.thumbnail || '',
      type: clip.type,
      startTime,
      endTime,
      duration: clip.duration,
      keywords: JSON.stringify(clip.keywords),
      segmentId: clip.segmentId,
      videoId
    }
  })
  
  // Store segments in database
  for (const segment of segmentData) {
    await prisma.videoSegment.create({
      data: segment
    })
  }
  
  console.log(`Stored ${segmentData.length} video segments`)
}

function calculateTotalDuration(segments: ScriptSegment[]): number {
  return segments.reduce((total, segment) => total + segment.duration, 0)
} 