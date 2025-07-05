"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Volume2, Edit3, Save, X, Languages, Clock } from "lucide-react"
import { toast } from "sonner"

interface Caption {
  id: string
  text: string
  startTime: number
  endTime: number
  language: string
}

interface CaptionEditorProps {
  videoId: string
  onCaptionsUpdated?: () => void
}

export function CaptionEditor({ videoId, onCaptionsUpdated }: CaptionEditorProps) {
  const [captions, setCaptions] = useState<Caption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [videoStatus, setVideoStatus] = useState<string>('')
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto')
  const [editingCaption, setEditingCaption] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [currentTime, setCurrentTime] = useState(0)

  const languages = [
    { code: 'auto', name: 'Auto-detect' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ]

  useEffect(() => {
    fetchCaptions()
  }, [videoId])

  const fetchCaptions = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}/transcribe`)
      if (response.ok) {
        const data = await response.json()
        setCaptions(data.captions || [])
        setVideoStatus(data.status)
        setVideoDuration(data.duration || 0)
      }
    } catch (error) {
      console.error('Error fetching captions:', error)
      toast.error('Failed to load captions')
    } finally {
      setIsLoading(false)
    }
  }

  const startTranscription = async () => {
    setIsTranscribing(true)
    try {
      const response = await fetch(`/api/videos/${videoId}/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: selectedLanguage === 'auto' ? undefined : selectedLanguage
        }),
      })

      if (response.ok) {
        toast.success('Transcription started! This may take a few minutes.')
        // Poll for updates
        pollTranscriptionStatus()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to start transcription')
      }
    } catch (error) {
      console.error('Error starting transcription:', error)
      toast.error('Failed to start transcription')
    } finally {
      setIsTranscribing(false)
    }
  }

  const pollTranscriptionStatus = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}/transcribe`)
        if (response.ok) {
          const data = await response.json()
          setVideoStatus(data.status)
          
          if (data.status === 'READY') {
            setCaptions(data.captions || [])
            toast.success('Transcription completed!')
            clearInterval(interval)
            if (onCaptionsUpdated) {
              onCaptionsUpdated()
            }
          } else if (data.status === 'ERROR') {
            toast.error('Transcription failed')
            clearInterval(interval)
          }
        }
      } catch (error) {
        console.error('Error polling status:', error)
      }
    }, 5000) // Poll every 5 seconds

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(interval)
    }, 600000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleEditCaption = (caption: Caption) => {
    setEditingCaption(caption.id)
    setEditText(caption.text)
  }

  const saveCaptionEdit = async (captionId: string) => {
    try {
      const response = await fetch(`/api/captions/${captionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: editText
        }),
      })

      if (response.ok) {
        setCaptions(captions.map(cap => 
          cap.id === captionId ? { ...cap, text: editText } : cap
        ))
        setEditingCaption(null)
        toast.success('Caption updated')
      } else {
        toast.error('Failed to update caption')
      }
    } catch (error) {
      console.error('Error updating caption:', error)
      toast.error('Failed to update caption')
    }
  }

  const cancelEdit = () => {
    setEditingCaption(null)
    setEditText('')
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Transcription Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Caption Generation
          </CardTitle>
          <CardDescription>
            Generate automatic captions using AI transcription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="language">Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(videoStatus)}>
                {videoStatus}
              </Badge>
              {videoDuration > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {formatTime(videoDuration)}
                </div>
              )}
            </div>
          </div>

          {videoStatus === 'UPLOADING' || videoStatus === 'PROCESSING' ? (
            <Button 
              onClick={startTranscription} 
              disabled={isTranscribing}
              className="w-full"
            >
              {isTranscribing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting Transcription...
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Start Transcription
                </>
              )}
            </Button>
          ) : videoStatus === 'TRANSCRIBING' ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
              <span>Transcribing video...</span>
            </div>
          ) : videoStatus === 'READY' ? (
            <div className="text-center py-4 text-green-600 dark:text-green-400">
              ✓ Transcription completed
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Captions List */}
      {captions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Captions ({captions.length})</CardTitle>
            <CardDescription>
              Edit captions by clicking on the text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {captions.map((caption) => (
                <div
                  key={caption.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400 min-w-[80px]">
                    {formatTime(caption.startTime)} - {formatTime(caption.endTime)}
                  </div>
                  
                  <div className="flex-1">
                    {editingCaption === caption.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => saveCaptionEdit(caption.id)}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <p className="text-sm leading-relaxed">{caption.text}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditCaption(caption)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {captions.length === 0 && videoStatus === 'READY' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Languages className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No captions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start transcription to generate captions
            </p>
            <Button onClick={startTranscription}>
              <Volume2 className="mr-2 h-4 w-4" />
              Start Transcription
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 