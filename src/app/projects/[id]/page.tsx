"use client"

import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Sparkles, Image, Video, Music, FileText, Search, Download, Play, Scissors } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { ScriptToVideoGenerator } from "@/components/script-to-video-generator"
import { VideoPlayer } from "@/components/video-player"
import { VideoEditor } from "@/components/video-editor"
import { Sidebar } from "@/components/sidebar"
import { toast } from "sonner"

interface Project {
  id: string
  name: string
  description?: string
  script?: string
  medium?: string
  createdAt: string
  updatedAt: string
  videos: Video[]
}

interface Video {
  id: string
  title: string
  description?: string
  originalUrl: string
  processedUrl?: string
  status: string
  duration?: number
  size?: number
  format?: string
  createdAt: string
}

interface MediaItem {
  id: string
  url: string
  thumbnail: string
  title: string
  author: string
  source: 'pexels' | 'pixabay' | 'unsplash'
}

const MEDIA_SOURCES = [
  { value: 'pexels', label: 'Pexels', icon: Image },
  // { value: 'pixabay', label: 'Pixabay', icon: Image },
  // { value: 'unsplash', label: 'Unsplash', icon: Image },
]

export default function ProjectPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const { setLoading } = useAppStore()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [script, setScript] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSource, setSelectedSource] = useState("pexels")
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const projectId = params.id as string

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`)
        if (response.ok) {
          const projectData = await response.json()
          setProject(projectData)
          setScript(projectData.script || "")
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Error fetching project:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId, router])

  const handleScriptUpdate = async () => {
    if (!project) return
    
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: script.trim(),
        }),
      })

      if (response.ok) {
        const updatedProject = await response.json()
        setProject(updatedProject)
      }
    } catch (error) {
      console.error('Error updating script:', error)
    }
  }

  const handleMediaSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const response = await fetch(`/api/media/search?query=${encodeURIComponent(searchQuery)}&source=${selectedSource}`)
      if (response.ok) {
        const data = await response.json()
        setMediaItems(data.items || [])
      }
    } catch (error) {
      console.error('Error searching media:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleGenerateContent = async () => {
    if (!project || !script.trim()) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          script: script.trim(),
          medium: project.medium,
        }),
      })

      if (response.ok) {
        // Handle successful generation
        window.location.reload()
      }
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleVideoGenerated = (videoId: string) => {
    // Refresh the project data to show the new video
    window.location.reload()
  }

  const handleSaveVideoEdit = (segments: any[]) => {
    // Here you would save the edited segments to the backend
    console.log('Saving video segments:', segments)
    toast.success('Video timeline saved successfully!')
    setIsEditing(false)
    setSelectedVideo(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Project not found
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
    <div className="min-h-screen flex">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 ml-16 lg:ml-64 transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
          <div className="flex items-center justify-between">
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
                  {project.name}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{project.medium || 'AI Project'}</Badge>
                  {project.description && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {project.description}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                onClick={handleGenerateContent}
                disabled={isGenerating || !script.trim()}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <Tabs defaultValue="video-generation" className="space-y-6">
            <TabsList>
              <TabsTrigger value="video-generation">Script to Video</TabsTrigger>
              <TabsTrigger value="script">Script Editor</TabsTrigger>
              <TabsTrigger value="media">Media Library</TabsTrigger>
              <TabsTrigger value="content">Generated Content</TabsTrigger>
            </TabsList>

            <TabsContent value="video-generation" className="space-y-6">
              <ScriptToVideoGenerator 
                projectId={projectId} 
                onVideoGenerated={handleVideoGenerated}
              />
            </TabsContent>

            <TabsContent value="script" className="space-y-6">
              {/* Script Editor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Script Editor
                  </CardTitle>
                  <CardDescription>
                    Edit your script to generate AI content. The AI will use this script to create {project.medium || 'content'}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="script">Script/Content</Label>
                    <Textarea
                      id="script"
                      placeholder="Enter your script, story, or content that you want AI to generate from..."
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      rows={8}
                      className="resize-none"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {script.length} characters
                    </p>
                    <Button onClick={handleScriptUpdate} variant="outline">
                      Save Script
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Generation Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    AI Generation Options
                  </CardTitle>
                  <CardDescription>
                    Configure how your content will be generated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Medium</Label>
                      <div className="flex items-center gap-2 p-3 border rounded-lg">
                        {project.medium === 'video' && <Video className="h-4 w-4" />}
                        {project.medium === 'image' && <Image className="h-4 w-4" />}
                        {project.medium === 'audio' && <Music className="h-4 w-4" />}
                        {project.medium === 'text' && <FileText className="h-4 w-4" />}
                        <span className="capitalize">{project.medium || 'Not set'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Generation Status</Label>
                      <div className="p-3 border rounded-lg">
                        <span className="text-sm">Ready to generate</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              {/* Media Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Media Search
                  </CardTitle>
                  <CardDescription>
                    Search for images and videos from Pexels, Pixabay, and Unsplash
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Select value={selectedSource} onValueChange={setSelectedSource}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDIA_SOURCES.map((source) => {
                          const Icon = source.icon
                          return (
                            <SelectItem key={source.value} value={source.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {source.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <input
                      type="text"
                      placeholder="Search for images, videos, or music..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleMediaSearch()}
                    />
                    <Button onClick={handleMediaSearch} disabled={isSearching || !searchQuery.trim()}>
                      {isSearching ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Media Results */}
              {mediaItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Search Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {mediaItems.map((item) => (
                        <div key={item.id} className="group relative">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                            <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="mt-1">
                            <p className="text-xs text-gray-600 truncate">{item.title}</p>
                            <p className="text-xs text-gray-400">by {item.author}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              {/* Generated Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Generated Content
                  </CardTitle>
                  <CardDescription>
                    Your AI-generated content will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {project.videos.length === 0 ? (
                    <div className="text-center py-12">
                      <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No content generated yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Write a script and click &quot;Generate AI Content&quot; to create your first piece
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {project.videos.map((video) => (
                        <Card 
                          key={video.id} 
                          className="hover:shadow-lg transition-shadow"
                        >
                                                      <CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Play className="h-4 w-4 text-blue-500" />
                                  <CardTitle className="text-base">{video.title}</CardTitle>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedVideo(video)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Play className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedVideo(video)
                                      setIsEditing(true)
                                    }}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Scissors className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <CardDescription>{video.description}</CardDescription>
                            </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant={
                                  video.status === 'READY' ? 'default' : 
                                  video.status === 'PROCESSING' ? 'secondary' :
                                  video.status === 'ERROR' ? 'destructive' : 'secondary'
                                }
                              >
                                {video.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {video.duration ? `${Math.round(video.duration)}s` : 'Unknown'}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Video Player Modal */}
      {selectedVideo && !isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            <VideoPlayer 
              video={selectedVideo} 
              onClose={() => setSelectedVideo(null)}
            />
          </div>
        </div>
      )}

      {/* Video Editor Modal */}
      {selectedVideo && isEditing && (
        <div className="fixed inset-0 z-50">
          <VideoEditor
            video={selectedVideo}
            onSave={handleSaveVideoEdit}
            onClose={() => {
              setIsEditing(false)
              setSelectedVideo(null)
            }}
          />
        </div>
      )}
    </div>
  )
} 