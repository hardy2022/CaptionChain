"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FolderOpen, Plus, Sparkles, Video, Image, Music, FileText } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"

interface ProjectFormProps {
  onProjectCreated?: (projectId: string) => void
  onCancel?: () => void
}

const MEDIUM_OPTIONS = [
  { value: "video", label: "Video", icon: Video, description: "Generate video content with AI" },
  { value: "image", label: "Image", icon: Image, description: "Create visual assets and graphics" },
  { value: "audio", label: "Audio", icon: Music, description: "Generate audio narration or music" },
  { value: "text", label: "Text", icon: FileText, description: "Create written content and captions" },
]

export function ProjectForm({ onProjectCreated, onCancel }: ProjectFormProps) {
  const [name, setName] = useState("")
  const [script, setScript] = useState("")
  const [medium, setMedium] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addProject, setLoading } = useAppStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Project name is required")
      return
    }

    if (!script.trim()) {
      toast.error("Script is required for AI generation")
      return
    }

    if (!medium) {
      toast.error("Please select a medium")
      return
    }

    setIsSubmitting(true)
    setLoading(true)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: `AI-generated ${medium} content from script`,
          script: script.trim(),
          medium: medium,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const project = await response.json()
      
      // Add to store
      addProject({
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
        videos: []
      })

      toast.success("AI Project created successfully!")
      
      // Reset form
      setName("")
      setScript("")
      setMedium("")
      
      if (onProjectCreated) {
        onProjectCreated(project.id)
      }
    } catch (error) {
      console.error('Project creation error:', error)
      toast.error("Failed to create project. Please try again.")
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  const selectedMedium = MEDIUM_OPTIONS.find(m => m.value === medium)

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Create AI-Generated Project
        </CardTitle>
        <CardDescription>
          Provide your script and choose your medium to generate AI-powered content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="script">Script/Content *</Label>
            <Textarea
              id="script"
              placeholder="Enter your script, story, or content that you want AI to generate from..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={6}
              disabled={isSubmitting}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              This will be used by AI to generate your {medium || 'selected medium'} content
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medium">Medium *</Label>
            <Select value={medium} onValueChange={setMedium} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select your medium" />
              </SelectTrigger>
              <SelectContent>
                {MEDIUM_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedMedium && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <selectedMedium.icon className="h-4 w-4 text-purple-500" />
                <span className="font-medium">AI Generation Preview</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your script will be processed to generate {selectedMedium.label.toLowerCase()} content using advanced AI models.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting || !name.trim() || !script.trim() || !medium}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating AI Project...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create AI Project
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={() => onCancel()} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 