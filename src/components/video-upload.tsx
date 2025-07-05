"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, X, FileVideo, CheckCircle, AlertCircle } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"

interface VideoUploadProps {
  onUploadComplete?: (videoId: string) => void
  projectId?: string
}

export function VideoUpload({ onUploadComplete, projectId }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { addVideo, setLoading } = useAppStore()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error("Please select a valid video file")
        return
      }

      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File size must be less than 100MB")
        return
      }

      setSelectedFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv']
    },
    multiple: false
  })

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('video', selectedFile)
      if (projectId) {
        formData.append('projectId', projectId)
      }

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const video = await response.json()
      
      // Add to store
      addVideo({
        id: video.id,
        title: video.title,
        description: video.description,
        filename: video.filename,
        originalUrl: video.originalUrl,
        processedUrl: video.processedUrl,
        duration: video.duration,
        size: video.size,
        format: video.format,
        status: video.status,
        createdAt: new Date(video.createdAt),
        updatedAt: new Date(video.updatedAt)
      })

      toast.success("Video uploaded successfully!")
      setSelectedFile(null)
      setUploadProgress(0)
      
      if (onUploadComplete) {
        onUploadComplete(video.id)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("Failed to upload video. Please try again.")
    } finally {
      setUploading(false)
      setLoading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Video
          </CardTitle>
          <CardDescription>
            Upload a video file to start generating captions. Supported formats: MP4, AVI, MOV, MKV, WebM, FLV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="flex justify-center">
                <FileVideo className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {isDragActive ? 'Drop the video here' : 'Drag & drop a video file'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  or click to browse files
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Maximum file size: 100MB
              </p>
            </div>
          </div>

          {/* Selected File */}
          {selectedFile && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileVideo className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Upload Button */}
              {!uploading && (
                <Button
                  onClick={handleUpload}
                  className="w-full mt-4"
                  disabled={!selectedFile}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Video
                </Button>
              )}
            </div>
          )}

          {/* Upload Status */}
          {uploading && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>Processing video...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 