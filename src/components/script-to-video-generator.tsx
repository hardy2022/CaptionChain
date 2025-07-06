"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Video, Clock, FileText, Play, Download } from "lucide-react"
import { toast } from "sonner"

interface ScriptToVideoGeneratorProps {
  projectId: string
  onVideoGenerated: (videoId: string) => void
}

interface GenerationStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
}

export function ScriptToVideoGenerator({ projectId, onVideoGenerated }: ScriptToVideoGeneratorProps) {
  const { data: session } = useSession()
  const [script, setScript] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    {
      id: 'script-analysis',
      name: 'Script Analysis',
      description: 'Analyzing script content and breaking it into segments',
      status: 'pending',
      progress: 0
    },
    {
      id: 'media-search',
      name: 'Media Search',
      description: 'Finding relevant video and image clips for each segment',
      status: 'pending',
      progress: 0
    },
    {
      id: 'timing-sync',
      name: 'Timing Synchronization',
      description: 'Synchronizing media clips with script timing',
      status: 'pending',
      progress: 0
    },
    {
      id: 'video-composition',
      name: 'Video Composition',
      description: 'Composing final video with transitions and effects',
      status: 'pending',
      progress: 0
    }
  ])

  const handleGenerateVideo = async () => {
    if (!session?.user) {
      toast.error("Please log in to use video generation")
      return
    }
    
    if (!script.trim()) {
      toast.error("Please enter a script to generate video")
      return
    }

    setIsGenerating(true)
    
    try {
      console.log('Starting video generation for project:', projectId)
      console.log('Script length:', script.length)
      
      // Start the generation process
      const response = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          script: script.trim(),
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        
        if (response.status === 401) {
          throw new Error('Please log in to use video generation')
        } else {
          throw new Error(`Failed to start video generation: ${response.status} ${errorText}`)
        }
      }

      const { videoId } = await response.json()
      
      // Simulate progress updates (in real implementation, this would be WebSocket or polling)
      simulateProgressUpdates(videoId)
      
      toast.success('Video generation started! This may take a few minutes.')
      
    } catch (error) {
      console.error('Error starting video generation:', error)
      toast.error('Failed to start video generation')
      setIsGenerating(false)
    }
  }

  const simulateProgressUpdates = (videoId: string) => {
    const steps = [...generationSteps]
    
    // Simulate step-by-step progress
    steps.forEach((step, index) => {
      setTimeout(() => {
        setGenerationSteps(prev => prev.map((s, i) => 
          i === index 
            ? { ...s, status: 'processing' as const, progress: 0 }
            : s
        ))
        
        // Simulate progress within each step
        const progressInterval = setInterval(() => {
          setGenerationSteps(prev => prev.map((s, i) => {
            if (i === index && s.status === 'processing') {
              const newProgress = Math.min(s.progress + 10, 100)
              if (newProgress === 100) {
                clearInterval(progressInterval)
                return { ...s, status: 'completed' as const, progress: 100 }
              }
              return { ...s, progress: newProgress }
            }
            return s
          }))
        }, 200)
        
        // Move to next step after completion
        setTimeout(() => {
          if (index === steps.length - 1) {
            setIsGenerating(false)
            onVideoGenerated(videoId)
            toast.success('Video generation completed!')
          } else {
            setGenerationSteps(prev => prev.map((s, i) => 
              i === index + 1 
                ? { ...s, status: 'processing' as const, progress: 0 }
                : s
            ))
          }
        }, 2000)
      }, index * 2500)
    })
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      case 'processing':
        return <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
        </div>
      case 'error':
        return <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      default:
        return <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Script Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            Script for Video Generation
          </CardTitle>
          <CardDescription>
            Enter your script. The AI will analyze it and create a video by combining relevant media clips that match your content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="script">Script Content</Label>
            <Textarea
              id="script"
              placeholder="Enter your script here. For example: 'A beautiful sunset over the ocean waves. The camera pans slowly to reveal a mountain landscape. Birds fly overhead as the day transitions to night.'"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-sm text-gray-500">
              {script.length} characters • Estimated video length: {Math.max(10, Math.ceil(script.length / 50))} seconds
            </p>
          </div>
          
          <Button 
            onClick={handleGenerateVideo}
            disabled={isGenerating || !script.trim() || !session?.user}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Video...
              </>
            ) : !session?.user ? (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Please Log In to Generate Video
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Video from Script
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generation Progress */}
      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-500" />
              Video Generation Progress
            </CardTitle>
            <CardDescription>
              Creating your video by analyzing the script and combining relevant media clips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generationSteps.map((step, index) => (
                <div key={step.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    {getStepIcon(step.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{step.name}</span>
                        {step.status === 'completed' && (
                          <Badge variant="secondary" className="text-xs">Complete</Badge>
                        )}
                        {step.status === 'processing' && (
                          <Badge variant="default" className="text-xs">Processing</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {step.status === 'processing' && (
                    <Progress value={step.progress} className="h-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            How AI Video Generation Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Script Analysis
              </h4>
              <p className="text-sm text-gray-600">
                AI analyzes your script to understand context, emotions, and visual requirements
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Video className="h-4 w-4 text-green-500" />
                Media Matching
              </h4>
              <p className="text-sm text-gray-600">
                Finds relevant video clips and images that match your script content
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                Timing Sync
              </h4>
              <p className="text-sm text-gray-600">
                Synchronizes media clips with script timing for perfect alignment
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Play className="h-4 w-4 text-orange-500" />
                Video Composition
              </h4>
              <p className="text-sm text-gray-600">
                Combines clips with smooth transitions and professional effects
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 