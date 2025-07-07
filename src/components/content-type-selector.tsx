"use client"

import { useState } from "react"
import { Youtube, Instagram, Film, MonitorPlay, List, Sparkles, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const CONTENT_TYPES = [
  {
    key: "youtube_shorts",
    label: "YouTube Shorts",
    icon: Youtube,
    accent: "from-[#ff512f] to-[#dd2476]"
  },
  {
    key: "youtube_video",
    label: "YouTube Video",
    icon: Youtube,
    accent: "from-[#ff512f] to-[#f09819]"
  },
  {
    key: "instagram_reels",
    label: "Instagram Reels",
    icon: Instagram,
    accent: "from-[#833ab4] via-[#fd1d1d] to-[#fcb045]"
  },
  {
    key: "instagram_video",
    label: "Instagram Video",
    icon: Instagram,
    accent: "from-[#fcb045] to-[#fd1d1d]"
  },
  {
    key: "presentation",
    label: "Presentation",
    icon: MonitorPlay,
    accent: "from-[#43cea2] to-[#185a9d]"
  },
  {
    key: "listicle",
    label: "Listicle",
    icon: List,
    accent: "from-[#ffaf7b] to-[#d76d77]"
  },
  {
    key: "others",
    label: "Others",
    icon: Sparkles,
    accent: "from-[#c471f5] to-[#fa71cd]"
  }
]

export function ContentTypeSelector({
  value,
  onChange
}: {
  value?: string
  onChange?: (key: string) => void
}) {
  const [selected, setSelected] = useState(value || "youtube_shorts")

  const handleSelect = (key: string) => {
    setSelected(key)
    onChange?.(key)
  }

  return (
    <div className="w-full flex gap-4 overflow-x-auto py-2 pb-4 hide-scrollbar">
      {CONTENT_TYPES.map((type) => {
        const Icon = type.icon
        const isActive = selected === type.key
        return (
          <button
            key={type.key}
            type="button"
            onClick={() => handleSelect(type.key)}
            className={cn(
              "relative group min-w-[160px] max-w-[180px] flex-1 flex flex-col items-center justify-center px-6 py-6 rounded-2xl border border-white/20 bg-white shadow-lg transition-all duration-200 cursor-pointer",
              "hover:scale-[1.04] hover:shadow-2xl hover:border-white/40 active:scale-95",
              isActive && "border-2 border-purple-400/80 shadow-[0_0_0_4px_rgba(168,85,247,0.15)]",
              "before:absolute before:inset-0 before:rounded-2xl before:z-0 before:bg-gradient-to-br before:opacity-40 before:pointer-events-none",
              type.accent
            )}
            style={{ fontFamily: 'var(--font-jakarta-sans, var(--font-sans))' }}
          >
            <span className="relative z-10 flex flex-col items-center gap-2">
              <span className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br",
                type.accent,
                isActive ? "shadow-lg scale-105" : "opacity-80"
              )}>
                <Icon className="h-7 w-7 text-white drop-shadow" />
              </span>
              <span className="mt-2 text-base font-semibold text-black drop-shadow-sm">
                {type.label}
              </span>
              {isActive && (
                <span className="absolute top-2 right-2 z-20">
                  <CheckCircle className="h-5 w-5 text-purple-300 drop-shadow" />
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
} 