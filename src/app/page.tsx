"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Dashboard } from "@/components/dashboard"
import { AuthPage } from "@/components/auth-page"

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  return <Dashboard />
}
