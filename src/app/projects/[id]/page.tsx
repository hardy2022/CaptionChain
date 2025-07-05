"use client"

import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Upload, FileVideo, Clock, Calendar } from "lucide-react"
import { VideoUpload } from "@/components/video-upload"
import { useAppStore } from "@/lib/store"

interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  videos: Video[]
}

interface Video {
  id: string
  title: string
  description?: string
  status: string
  duration?: number
  size?: number
  format?: string
  createdAt: string
}

export default function ProjectPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const { setLoading } = useAppStore()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const projectId = params.id as string

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`)
        if (response.ok) {
          const projectData = await response.json()
          setProject(projectData)
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

  const handleVideoUploaded = () => {
    // Refresh project data
    window.location.reload()
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
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload Video to {project.name}</DialogTitle>
                  </DialogHeader>
                  <VideoUpload 
                    projectId={project.id}
                    onUploadComplete={handleVideoUploaded}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                <FileVideo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{project.videos.length}</div>
                <p className="text-xs text-muted-foreground">
                  videos in this project
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Created</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  project creation date
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  last modification
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Videos List */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Videos ({project.videos.length})
              </h2>
            </div>

            {project.videos.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileVideo className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No videos yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Upload your first video to this project
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Video
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Upload Video to {project.name}</DialogTitle>
                      </DialogHeader>
                      <VideoUpload 
                        projectId={project.id}
                        onUploadComplete={handleVideoUploaded}
                      />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {project.videos.map((video) => (
                    <Card 
                      key={video.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => router.push(`/videos/${video.id}`)}
                    >
                      <CardHeader>
                        <CardTitle className="text-base">{video.title}</CardTitle>
                        <CardDescription>{video.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={
                              video.status === 'READY' ? 'default' : 
                              video.status === 'TRANSCRIBING' ? 'secondary' :
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
          </div>
        </div>
      </main>
    </div>
  )
} 