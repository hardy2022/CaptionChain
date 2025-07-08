"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Video, Plus, Upload, Settings, LogOut, User, FolderOpen, Clock, FileVideo, Sparkles, Zap, Trash2, MoreVertical } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { VideoUpload } from "@/components/video-upload"
import { ProjectForm } from "@/components/project-form"
import { Sidebar } from "@/components/sidebar"
import { ContentTypeSelector } from "@/components/content-type-selector"
import { toast } from "sonner"

interface Project {
  id: string
  name: string
  description: string
  medium: string
  script: string
  createdAt: string
  updatedAt: string
  videos: any[]
}

interface Video {
  id: string
  title: string
  description: string
  status: string
  duration: number
  createdAt: string
  updatedAt: string
}

export function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const { projects, videos, setProjects, setVideos } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletingProject, setIsDeletingProject] = useState<string | null>(null)
  const [isDeletingVideo, setIsDeletingVideo] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, videosResponse] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/videos')
        ])

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json()
          setProjects(projectsData)
        }

        if (videosResponse.ok) {
          const videosData = await videosResponse.json()
          setVideos(videosData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [setProjects, setVideos])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleDeleteProject = async (projectId: string) => {
    setIsDeletingProject(projectId)
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId))
        toast.success('Project deleted successfully')
      } else {
        toast.error('Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    } finally {
      setIsDeletingProject(null)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    setIsDeletingVideo(videoId)
    try {
      console.log('Attempting to delete video:', videoId)
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      })

      console.log('Delete response status:', response.status)
      const responseData = await response.json()
      console.log('Delete response data:', responseData)

      if (response.ok) {
        setVideos(videos.filter(v => v.id !== videoId))
        toast.success('Video deleted successfully')
      } else {
        console.error('Delete failed:', responseData)
        toast.error(responseData.error || 'Failed to delete video')
      }
    } catch (error) {
      console.error('Error deleting video:', error)
      toast.error('Failed to delete video')
    } finally {
      setIsDeletingVideo(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 ml-16 lg:ml-64 transition-all duration-300 ease-in-out">
        {/* Top Header */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {session?.user?.name?.split(" ")[0] || "User"}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Transform your scripts into AI-generated content across multiple mediums
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <ProjectForm />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

                {/* Content Area */}
        <div className="p-6">
          {/* Content Type Selector Section */}
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <h2 className="text-lg font-bold text-gray-900" style={{fontFamily: 'var(--font-jakarta-sans, var(--font-sans))'}}>Select Content Type</h2>
          </div>
          <div className="mb-10">
            <ContentTypeSelector />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Content Generated</CardTitle>
                <FileVideo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{videos.length}</div>
                <p className="text-xs text-muted-foreground">
                  Pieces of AI content
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Generation Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">~30s</div>
                <p className="text-xs text-muted-foreground">
                  Average per piece
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8 bg-white/20 backdrop-blur-2xl border-white/40 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Get started with AI content generation or upload existing videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-500" />
                          Generate AI Content
                        </CardTitle>
                        <CardDescription>
                          Create AI-generated content from your scripts
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Start AI Generation
                        </Button>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create AI-Generated Project</DialogTitle>
                    </DialogHeader>
                    <ProjectForm />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Upload className="h-5 w-5" />
                          Upload Existing Video
                        </CardTitle>
                        <CardDescription>
                          Upload and process existing video content
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Video
                        </Button>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Upload Video</DialogTitle>
                    </DialogHeader>
                    <VideoUpload />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Projects
            </h2>
            {projects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No projects yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first project to get started
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                      </DialogHeader>
                      <ProjectForm />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.slice(0, 6).map((project) => (
                  <Card 
                    key={project.id} 
                    className="relative group cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div 
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                            Open Project
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-600 focus:text-red-600"
                            disabled={isDeletingProject === project.id}
                          >
                            {isDeletingProject === project.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Project
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div onClick={() => router.push(`/projects/${project.id}`)}>
                      <CardHeader>
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <Badge variant="secondary" className="self-start">
                              {project.medium || 'AI Project'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(project.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          {project.script && (
                            <p className="text-xs text-gray-600 line-clamp-2">
                              &quot;{project.script.substring(0, 100)}...&quot;
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Videos */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Videos
            </h2>
            {videos.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileVideo className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No videos yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Upload your first video to start generating captions
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
                        <DialogTitle>Upload Video</DialogTitle>
                      </DialogHeader>
                      <VideoUpload />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.slice(0, 6).map((video) => (
                  <Card 
                    key={video.id} 
                    className="relative group cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div 
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/videos/${video.id}`)}>
                            Open Video
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteVideo(video.id)}
                            className="text-red-600 focus:text-red-600"
                            disabled={isDeletingVideo === video.id}
                          >
                            {isDeletingVideo === video.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Video
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div onClick={() => router.push(`/videos/${video.id}`)}>
                      <CardHeader>
                        <CardTitle className="text-base">{video.title}</CardTitle>
                        <CardDescription>{video.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start justify-between">
                          <Badge 
                            variant={
                              video.status === 'READY' ? 'default' : 
                              video.status === 'TRANSCRIBING' ? 'secondary' :
                              video.status === 'ERROR' ? 'destructive' : 'secondary'
                            }
                            className="self-start"
                          >
                            {video.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {video.duration ? `${Math.round(video.duration)}s` : 'Unknown'}
                          </span>
                        </div>
                      </CardContent>
                    </div>
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