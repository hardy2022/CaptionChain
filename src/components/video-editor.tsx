"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  Scissors, Copy, Trash2, Plus, ArrowLeft, Save,
  Clock, Film, Image, Music
} from 'lucide-react'
import { toast } from 'sonner'

interface VideoSegment {
  id: string
  type: 'video' | 'image' | 'audio'
  title: string
  description: string
  url: string
  startTime: number
  endTime: number
  duration: number
  thumbnail?: string
}

interface VideoEditorProps {
  video: {
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
  onSave: (segments: VideoSegment[]) => void
  onClose: () => void
}

export function VideoEditor({ video, onSave, onClose }: VideoEditorProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [segments, setSegments] = useState<VideoSegment[]>([
    {
      id: '1',
      type: 'video',
      title: 'Opening Scene',
      description: 'Beautiful sunset over ocean waves',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      startTime: 0,
      endTime: 5,
      duration: 5,
      thumbnail: 'https://via.placeholder.com/120x68/3b82f6/ffffff?text=Scene+1'
    },
    {
      id: '2',
      type: 'image',
      title: 'Mountain Landscape',
      description: 'Panoramic mountain view',
      url: 'https://via.placeholder.com/1280x720/10b981/ffffff?text=Mountain+Scene',
      startTime: 5,
      endTime: 8,
      duration: 3,
      thumbnail: 'https://via.placeholder.com/120x68/10b981/ffffff?text=Scene+2'
    },
    {
      id: '3',
      type: 'video',
      title: 'City Skyline',
      description: 'Urban cityscape at night',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      startTime: 8,
      endTime: 12,
      duration: 4,
      thumbnail: 'https://via.placeholder.com/120x68/f59e0b/ffffff?text=Scene+3'
    }
  ])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0)
    }
  }, [])

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.volume = volume
      setIsMuted(volume === 0)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    return duration > 0 ? (currentTime / duration) * 100 : 0
  }

  const addSegment = () => {
    const newSegment: VideoSegment = {
      id: Date.now().toString(),
      type: 'video',
      title: `New Scene ${segments.length + 1}`,
      description: 'Add description here',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      startTime: segments.length > 0 ? segments[segments.length - 1].endTime : 0,
      endTime: segments.length > 0 ? segments[segments.length - 1].endTime + 3 : 3,
      duration: 3,
      thumbnail: 'https://via.placeholder.com/120x68/6b7280/ffffff?text=New+Scene'
    }
    setSegments([...segments, newSegment])
    setSelectedSegment(newSegment.id)
  }

  const deleteSegment = (id: string) => {
    setSegments(segments.filter(seg => seg.id !== id))
    if (selectedSegment === id) {
      setSelectedSegment(null)
    }
  }

  const duplicateSegment = (segment: VideoSegment) => {
    const newSegment: VideoSegment = {
      ...segment,
      id: Date.now().toString(),
      title: `${segment.title} (Copy)`,
      startTime: segment.endTime,
      endTime: segment.endTime + segment.duration
    }
    setSegments([...segments, newSegment])
  }

  const updateSegment = (id: string, updates: Partial<VideoSegment>) => {
    setSegments(segments.map(seg => 
      seg.id === id ? { ...seg, ...updates } : seg
    ))
  }

  const handleSave = () => {
    onSave(segments)
    toast.success('Video timeline saved successfully!')
  }

  const selectedSegmentData = segments.find(seg => seg.id === selectedSegment)

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">{video.title} - Editor</h1>
              <p className="text-sm text-gray-600">Edit your video timeline</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={video.status === 'READY' ? 'default' : 'secondary'}>
              {video.status}
            </Badge>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Video Preview */}
          <div className="flex-1 bg-black p-6">
            <div className="relative h-full max-w-4xl mx-auto">
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              >
                <source src={video.processedUrl || video.originalUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="mb-2">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${getProgressPercentage()}%, #4b5563 ${getProgressPercentage()}%, #4b5563 100%)`
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        defaultValue="1"
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="h-64 bg-white border-t">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Timeline</h3>
                <Button onClick={addSegment} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Segment
                </Button>
              </div>

              <div 
                ref={timelineRef}
                className="flex gap-2 overflow-x-auto pb-4"
                style={{ scrollbarWidth: 'thin' }}
              >
                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className={`flex-shrink-0 w-48 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedSegment === segment.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSegment(segment.id)}
                  >
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {segment.type === 'video' && <Film className="h-3 w-3 text-blue-500" />}
                        {segment.type === 'image' && <Image className="h-3 w-3 text-green-500" />}
                        {segment.type === 'audio' && <Music className="h-3 w-3 text-purple-500" />}
                        <span className="text-xs font-medium">{segment.title}</span>
                      </div>
                      
                      <img
                        src={segment.thumbnail}
                        alt={segment.title}
                        className="w-full h-16 object-cover rounded mb-2"
                      />
                      
                      <div className="text-xs text-gray-600 mb-2">
                        {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {segment.duration}s
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicateSegment(segment)
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSegment(segment.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {selectedSegmentData && (
          <div className="w-80 bg-white border-l p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Segment Properties</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={selectedSegmentData.title}
                  onChange={(e) => updateSegment(selectedSegmentData.id, { title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={selectedSegmentData.description}
                  onChange={(e) => updateSegment(selectedSegmentData.id, { description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={selectedSegmentData.type}
                  onChange={(e) => updateSegment(selectedSegmentData.id, { type: e.target.value as 'video' | 'image' | 'audio' })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                  <option value="audio">Audio</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startTime">Start Time (s)</Label>
                  <Input
                    id="startTime"
                    type="number"
                    value={selectedSegmentData.startTime}
                    onChange={(e) => {
                      const startTime = parseFloat(e.target.value)
                      const duration = selectedSegmentData.endTime - selectedSegmentData.startTime
                      updateSegment(selectedSegmentData.id, { 
                        startTime,
                        endTime: startTime + duration
                      })
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time (s)</Label>
                  <Input
                    id="endTime"
                    type="number"
                    value={selectedSegmentData.endTime}
                    onChange={(e) => {
                      const endTime = parseFloat(e.target.value)
                      updateSegment(selectedSegmentData.id, { 
                        endTime,
                        duration: endTime - selectedSegmentData.startTime
                      })
                    }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Duration (s)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={selectedSegmentData.duration}
                  onChange={(e) => {
                    const duration = parseFloat(e.target.value)
                    updateSegment(selectedSegmentData.id, { 
                      duration,
                      endTime: selectedSegmentData.startTime + duration
                    })
                  }}
                />
              </div>

              <div>
                <Label htmlFor="url">Media URL</Label>
                <Input
                  id="url"
                  value={selectedSegmentData.url}
                  onChange={(e) => updateSegment(selectedSegmentData.id, { url: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 