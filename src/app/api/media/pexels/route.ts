import { NextRequest, NextResponse } from 'next/server'
import { pexelsAPI } from '@/lib/pexels'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const type = searchParams.get('type') || 'video' // 'video' or 'image'
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '15')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    // Check if API key is configured
    if (!process.env.PEXELS_API_KEY) {
      console.log('Pexels API key not configured, returning fallback content')
      return NextResponse.json({
        items: getFallbackMediaItems(query, type),
        total: 1,
        page: 1,
        perPage: 1,
        hasMore: false
      })
    }

    let response
    try {
      if (type === 'video') {
        response = await pexelsAPI.searchVideos(query, page, perPage)
      } else {
        response = await pexelsAPI.searchImages(query, page, perPage)
      }
    } catch (apiError) {
      console.error('Pexels API request failed:', apiError)
      return NextResponse.json({
        items: getFallbackMediaItems(query, type),
        total: 1,
        page: 1,
        perPage: 1,
        hasMore: false
      })
    }

    // Transform the response to match our app's format
    const items = type === 'video' 
      ? response.videos?.map(video => ({
          id: video.id.toString(),
          title: `Video by ${video.user.name}`,
          description: `HD video (${video.width}x${video.height})`,
          url: pexelsAPI.getBestVideoFile(video),
          thumbnail: pexelsAPI.getThumbnail(video),
          duration: video.duration,
          type: 'video',
          source: 'pexels',
          author: video.user.name,
          width: video.width,
          height: video.height
        })) || []
      : response.photos?.map(photo => ({
          id: photo.id.toString(),
          title: photo.alt || `Photo by ${photo.photographer}`,
          description: `High quality image (${photo.width}x${photo.height})`,
          url: photo.src.large2x,
          thumbnail: photo.src.medium,
          type: 'image',
          source: 'pexels',
          author: photo.photographer,
          width: photo.width,
          height: photo.height
        })) || []

    return NextResponse.json({
      items,
      total: response.total_results,
      page: response.page,
      perPage: response.per_page,
      hasMore: !!response.next_page
    })

  } catch (error) {
    console.error('Pexels API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media from Pexels' },
      { status: 500 }
    )
  }
}

function getFallbackMediaItems(query: string, type: string): any[] {
  const lowerQuery = query.toLowerCase()
  
  if (type === 'video') {
    if (lowerQuery.includes('sunset') || lowerQuery.includes('ocean')) {
      return [{
        id: 'fallback-1',
        title: 'Beautiful Sunset Scene',
        description: 'HD video (1280x720)',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnail: 'https://via.placeholder.com/320x180/ff6b35/ffffff?text=Sunset+Video',
        duration: 10,
        type: 'video',
        source: 'fallback',
        author: 'Sample Content',
        width: 1280,
        height: 720
      }]
    }
    
    if (lowerQuery.includes('mountain') || lowerQuery.includes('landscape')) {
      return [{
        id: 'fallback-2',
        title: 'Mountain Landscape',
        description: 'HD video (1280x720)',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnail: 'https://via.placeholder.com/320x180/10b981/ffffff?text=Mountain+Video',
        duration: 8,
        type: 'video',
        source: 'fallback',
        author: 'Sample Content',
        width: 1280,
        height: 720
      }]
    }
    
    return [{
      id: 'fallback-3',
      title: 'Sample Video Content',
      description: 'HD video (1280x720)',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://via.placeholder.com/320x180/6b7280/ffffff?text=Sample+Video',
      duration: 10,
      type: 'video',
      source: 'fallback',
      author: 'Sample Content',
      width: 1280,
      height: 720
    }]
  } else {
    return [{
      id: 'fallback-image',
      title: 'Sample Image',
      description: 'High quality image (1920x1080)',
      url: 'https://via.placeholder.com/1920x1080/3b82f6/ffffff?text=Sample+Image',
      thumbnail: 'https://via.placeholder.com/320x180/3b82f6/ffffff?text=Sample+Image',
      type: 'image',
      source: 'fallback',
      author: 'Sample Content',
      width: 1920,
      height: 1080
    }]
  }
} 