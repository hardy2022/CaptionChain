"use client"

import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, FileVideo, Clock, Calendar, Languages } from "lucide-react"
import { CaptionEditor } from "@/components/caption-editor"
import { useAppStore } from "@/lib/store"

interface Video {
  id: string
  title: string
  description?: string
  filename: string
  originalUrl: string
  processedUrl?: string
  duration?: number
  size?: number
  format?: string
  status: string
  createdAt: string
  updatedAt: string
  project?: {
    id: string
    name: string
  }
  captions?: Caption[]
}

interface Caption {
  id: string
  text: string
  startTime: number
  endTime: number
  language: string
}

export default function VideoPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const { setLoading } = useAppStore()
  const [video, setVideo] = useState<Video | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const videoId = params.id as string

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}`)
        if (response.ok) {
          const videoData = await response.json()
          setVideo(videoData)
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Error fetching video:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    if (videoId) {
      fetchVideo()
    }
  }, [videoId, router])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'TRANSCRIBING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'ERROR':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const handleCaptionsUpdated = () => {
    // Refresh video data
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Video not found
          </h1>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {video.title}
                </h1>
                {video.project && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Project: {video.project.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(video.status)}>
                {video.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Info */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Video Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileVideo className="h-5 w-5" />
                      Video Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Video preview coming soon
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Video Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Video Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {video.duration ? formatTime(video.duration) : 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">File Size:</span>
                        <div>{video.size ? formatFileSize(video.size) : 'Unknown'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Format:</span>
                        <div>{video.format?.toUpperCase() || 'Unknown'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Created:</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(video.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {video.description && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Description:</span>
                        <p className="text-sm mt-1">{video.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Caption Stats */}
                {video.captions && video.captions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Languages className="h-5 w-5" />
                        Caption Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Captions:</span>
                          <span className="font-medium">{video.captions.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Language:</span>
                          <span className="font-medium">{video.captions[0]?.language || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coverage:</span>
                          <span className="font-medium">
                            {video.duration ? 
                              `${Math.round((video.captions.reduce((acc, cap) => acc + (cap.endTime - cap.startTime), 0) / video.duration) * 100)}%` 
                              : 'Unknown'
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Caption Editor */}
            <div className="lg:col-span-2">
              <CaptionEditor 
                videoId={videoId}
                onCaptionsUpdated={handleCaptionsUpdated}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 