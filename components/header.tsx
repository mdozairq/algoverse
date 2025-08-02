"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  showSearch?: boolean
  showAuthButtons?: boolean
  className?: string
}

export default function Header({ 
  showSearch = true, 
  showAuthButtons = true, 
  className = "" 
}: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 bg-white dark:bg-gray-800/80 backdrop-blur-sm ${className}`}
    >
      <div className="container mx-auto px-6 py-6 flex items-center justify-between">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          className="flex items-center"
        >
          <Link href="/">
            <motion.span 
              className="text-2xl font-black tracking-tight text-gray-900 dark:text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              EVENTNFT.
            </motion.span>
          </Link>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="hidden md:flex items-center space-x-8"
        >
          {[
            { href: "/marketplace", label: "Marketplace" },
            { href: "/events", label: "Events" },
            { href: "/about", label: "About" },
            { href: "/insights", label: "Insights" }
          ].map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            >
              <Link href={item.href}>
                <motion.span
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                  whileHover={{ 
                    scale: 1.05,
                    y: -2,
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </motion.nav>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-center space-x-4"
        >
          {showSearch && (
            <motion.button
              whileHover={{ 
                scale: 1.1,
                rotate: 5,
                transition: { type: "spring", stiffness: 400, damping: 17 }
              }}
              whileTap={{ 
                scale: 0.9,
                rotate: -5,
                transition: { type: "spring", stiffness: 400, damping: 17 }
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
          )}
          
          {showAuthButtons && (
            <div className="flex items-center gap-2">
              {[
                { href: "/auth/user", label: "Connect Wallet", variant: "outline" },
                // { href: "/auth/merchant", label: "MERCHANT", variant: "outline" },
                // { href: "/auth/admin", label: "ADMIN", variant: "default" }
              ].map((button, index) => (
                <motion.div
                  key={button.href}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5, type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link href={button.href}>
                    <motion.div
                      whileHover={{ 
                        scale: 1.05,
                        y: -2,
                        transition: { type: "spring", stiffness: 400, damping: 17 }
                      }}
                      whileTap={{ 
                        scale: 0.95,
                        y: 0,
                        transition: { type: "spring", stiffness: 400, damping: 17 }
                      }}
                    >
                      <Button
                        variant={button.variant as "outline" | "default"}
                        className={`${
                          button.variant === "outline" 
                            ? "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-full px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800" 
                            : "bg-red-600 text-white hover:bg-red-700 rounded-full px-4 py-2 text-sm font-medium"
                        }`}
                      >
                        {button.label}
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.header>
  )
} 