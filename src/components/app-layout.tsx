"use client"

import { ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"

interface AppLayoutProps {
  children: ReactNode
  className?: string
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className={`flex-1 ml-16 lg:ml-64 transition-all duration-300 ease-in-out ${className || ''}`}>
        {children}
      </main>
    </div>
  )
} 