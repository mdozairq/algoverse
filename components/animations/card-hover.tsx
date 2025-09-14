"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface CardHoverProps {
  children: ReactNode
  className?: string
  scale?: number
  rotateX?: number
  rotateY?: number
}

export function CardHover({ children, className = "", scale = 1.02, rotateX = 0, rotateY = 0 }: CardHoverProps) {
  return (
    <motion.div
      whileHover={{
        scale,
        rotateX,
        rotateY,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FloatingCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
