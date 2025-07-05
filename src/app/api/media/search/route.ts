import { NextRequest, NextResponse } from 'next/server'

interface MediaItem {
  id: string
  url: string
  thumbnail: string
  title: string
  author: string
  source: 'pexels' | 'pixabay' | 'unsplash'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const source = searchParams.get('source') || 'pexels'

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    let items: MediaItem[] = []

    switch (source) {
      case 'pexels':
        items = await searchPexels(query)
        break
      // case 'pixabay':
      //   items = await searchPixabay(query)
      //   break
      // case 'unsplash':
      //   items = await searchUnsplash(query)
      //   break
      default:
        return NextResponse.json({ error: 'Invalid source' }, { status: 400 })
    }

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Media search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function searchPexels(query: string): Promise<MediaItem[]> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    console.warn('PEXELS_API_KEY not configured')
    return []
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20`,
      {
        headers: {
          'Authorization': apiKey
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`)
    }

    const data = await response.json()
    return data.photos?.map((photo: any) => ({
      id: photo.id.toString(),
      url: photo.src.original,
      thumbnail: photo.src.medium,
      title: photo.alt || 'Pexels Image',
      author: photo.photographer,
      source: 'pexels' as const
    })) || []
  } catch (error) {
    console.error('Pexels search error:', error)
    return []
  }
}

// async function searchPixabay(query: string): Promise<MediaItem[]> {
//   const apiKey = process.env.PIXABAY_API_KEY
//   if (!apiKey) {
//     console.warn('PIXABAY_API_KEY not configured')
//     return []
//   }

//   try {
//     const response = await fetch(
//       `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=20`
//     )

//     if (!response.ok) {
//       throw new Error(`Pixabay API error: ${response.status}`)
//     }

//     const data = await response.json()
//     return data.hits?.map((hit: any) => ({
//       id: hit.id.toString(),
//       url: hit.largeImageURL,
//       thumbnail: hit.webformatURL,
//       title: hit.tags || 'Pixabay Image',
//       author: hit.user,
//       source: 'pixabay' as const
//     })) || []
//   } catch (error) {
//     console.error('Pixabay search error:', error)
//     return []
//   }
// }

// async function searchUnsplash(query: string): Promise<MediaItem[]> {
//   const apiKey = process.env.UNSPLASH_API_KEY
//   if (!apiKey) {
//     console.warn('UNSPLASH_API_KEY not configured')
//     return []
//   }

//   try {
//     const response = await fetch(
//       `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20`,
//       {
//         headers: {
//           'Authorization': `Client-ID ${apiKey}`
//         }
//       }
//     )

//     if (!response.ok) {
//       throw new Error(`Unsplash API error: ${response.status}`)
//     }

//     const data = await response.json()
//     return data.results?.map((photo: any) => ({
//       id: photo.id,
//       url: photo.urls.regular,
//       thumbnail: photo.urls.small,
//       title: photo.alt_description || photo.description || 'Unsplash Image',
//       author: photo.user.name,
//       source: 'unsplash' as const
//     })) || []
//   } catch (error) {
//     console.error('Unsplash search error:', error)
//     return []
//     }
// } 