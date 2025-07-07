"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Video, 
  Home, 
  FolderOpen, 
  FileVideo, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Upload,
  Sparkles,
  BarChart3,
  Users,
  Palette
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      active: pathname === "/"
    },
    {
      name: "Projects",
      href: "/projects",
      icon: FolderOpen,
      active: pathname.startsWith("/projects")
    },
    {
      name: "Videos",
      href: "/videos",
      icon: FileVideo,
      active: pathname.startsWith("/videos")
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      active: pathname.startsWith("/analytics")
    },
    {
      name: "Team",
      href: "/team",
      icon: Users,
      active: pathname.startsWith("/team")
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      active: pathname.startsWith("/settings")
    }
  ]

  const quickActions = [
    {
      name: "New Project",
      icon: Plus,
      action: () => router.push("/projects/new")
    },
    {
      name: "Upload Video",
      icon: Upload,
      action: () => router.push("/videos/upload")
    },
    {
      name: "AI Generate",
      icon: Sparkles,
      action: () => router.push("/generate")
    }
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Sidebar Background */}
      <div className="h-full bg-gradient-to-b from-slate-900 via-purple-900/20 to-indigo-900/30 backdrop-blur-xl border-r border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 backdrop-blur-lg border border-purple-400/30 rounded-lg">
                <Video className="h-5 w-5 text-purple-300" />
              </div>
              <span className="text-lg font-bold text-white">
                CaptionChain
              </span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full justify-start h-10 px-3 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200",
                item.active && "bg-purple-600/20 text-purple-300 border border-purple-500/30",
                isCollapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && item.name}
            </Button>
          ))}
        </nav>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="px-3 py-4 border-t border-white/10">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 px-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.name}
                  variant="ghost"
                  onClick={action.action}
                  className="w-full justify-start h-9 px-3 text-white/70 hover:text-white hover:bg-white/10 text-sm"
                >
                  <action.icon className="h-4 w-4 mr-3" />
                  {action.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="p-3 border-t border-white/10">
          <div className={cn(
            "flex items-center space-x-3",
            isCollapsed && "justify-center"
          )}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback className="bg-purple-600/20 text-purple-300 text-xs">
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {session?.user?.email}
                </p>
              </div>
            )}
            
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 