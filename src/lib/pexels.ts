const PEXELS_API_KEY = process.env.PEXELS_API_KEY || ''
const PEXELS_BASE_URL = 'https://api.pexels.com/v1'

export interface PexelsVideo {
  id: number
  width: number
  height: number
  url: string
  image: string
  duration: number
  user: {
    id: number
    name: string
    url: string
  }
  video_files: Array<{
    id: number
    quality: string
    file_type: string
    width: number
    height: number
    link: string
  }>
  video_pictures: Array<{
    id: number
    picture: string
    nr: number
  }>
}

export interface PexelsImage {
  id: number
  width: number
  height: number
  url: string
  photographer: string
  photographer_url: string
  avg_color: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    portrait: string
    landscape: string
    tiny: string
  }
  alt: string
}

export interface PexelsSearchResponse {
  total_results: number
  page: number
  per_page: number
  videos?: PexelsVideo[]
  photos?: PexelsImage[]
  next_page: string
}

export class PexelsAPI {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || PEXELS_API_KEY
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    if (!this.apiKey) {
      throw new Error('Pexels API key is not configured')
    }

    const url = new URL(`${PEXELS_BASE_URL}${endpoint}`)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - Pexels API is taking too long to respond')
      }
      throw error
    }
  }

  async searchVideos(query: string, page: number = 1, perPage: number = 15): Promise<PexelsSearchResponse> {
    return this.makeRequest('/videos/search', {
      query,
      page: page.toString(),
      per_page: perPage.toString(),
      orientation: 'landscape'
    })
  }

  async searchImages(query: string, page: number = 1, perPage: number = 15): Promise<PexelsSearchResponse> {
    return this.makeRequest('/search', {
      query,
      page: page.toString(),
      per_page: perPage.toString(),
      orientation: 'landscape'
    })
  }

  async getPopularVideos(page: number = 1, perPage: number = 15): Promise<PexelsSearchResponse> {
    return this.makeRequest('/videos/popular', {
      page: page.toString(),
      per_page: perPage.toString()
    })
  }

  async getVideo(id: number): Promise<PexelsVideo> {
    const response = await this.makeRequest(`/videos/${id}`)
    return response
  }

  async getImage(id: number): Promise<PexelsImage> {
    const response = await this.makeRequest(`/photos/${id}`)
    return response
  }

  // Helper method to get the best quality video file
  getBestVideoFile(video: PexelsVideo): string {
    const videoFiles = video.video_files
      .filter(file => file.file_type === 'video/mp4')
      .sort((a, b) => {
        // Prefer HD quality (1080p or 720p)
        const aQuality = a.height
        const bQuality = b.height
        return bQuality - aQuality
      })
    
    return videoFiles[0]?.link || video.url
  }

  // Helper method to get thumbnail
  getThumbnail(video: PexelsVideo): string {
    return video.video_pictures[0]?.picture || video.image
  }
}

// Create a singleton instance
export const pexelsAPI = new PexelsAPI() 