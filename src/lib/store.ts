import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface Project {
  id: string
  name: string
  description?: string
  script?: string
  medium?: string
  createdAt: Date
  updatedAt: Date
  videos?: Video[]
}

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
  status: 'UPLOADING' | 'PROCESSING' | 'TRANSCRIBING' | 'READY' | 'ERROR'
  createdAt: Date
  updatedAt: Date
}

interface AppState {
  user: User | null
  projects: Project[]
  currentProject: Project | null
  videos: Video[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  setVideos: (videos: Video[]) => void
  addProject: (project: Project) => void
  addVideo: (video: Video) => void
  updateVideo: (id: string, updates: Partial<Video>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      projects: [],
      currentProject: null,
      videos: [],
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setProjects: (projects) => set({ projects }),
      setCurrentProject: (project) => set({ currentProject: project }),
      setVideos: (videos) => set({ videos }),
      addProject: (project) => set((state) => ({ 
        projects: [...state.projects, project] 
      })),
      addVideo: (video) => set((state) => ({ 
        videos: [...state.videos, video] 
      })),
      updateVideo: (id, updates) => set((state) => ({
        videos: state.videos.map(video => 
          video.id === id ? { ...video, ...updates } : video
        )
      })),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'captionchain-storage',
      partialize: (state) => ({
        user: state.user,
        currentProject: state.currentProject,
      }),
    }
  )
) 