"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface ThemeWrapperProps {
  children: React.ReactNode
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-background text-foreground">{children}</div>
  }

  const currentTheme = theme === "system" ? systemTheme : theme

  return (
    <div
      className="min-h-screen bg-background text-foreground transition-colors duration-300"
      data-theme={currentTheme}
    >
      {children}
    </div>
  )
}
