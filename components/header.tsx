"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Search, Menu, X, User, Wallet, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { disconnectPeraWallet } from "@/lib/wallet/pera-wallet"

interface HeaderProps {
  showSearch?: boolean
  showAuthButtons?: boolean
  className?: string
  showThemeToggle?: boolean
}

export default function Header({ 
  showSearch = true, 
  showAuthButtons = true, 
  className = "",
  showThemeToggle = true
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
console.log(user);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen) {
        const target = event.target as Element
        if (!target.closest('.user-menu-container')) {
          setIsUserMenuOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  const handleLogout = async () => {
    try {
      // Disconnect Pera wallet if connected
      disconnectPeraWallet()
      
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 bg-white dark:bg-gray-800/80 backdrop-blur-sm ${className}`}
    >
      <div className="container-responsive py-4 sm:py-6 flex items-center justify-between">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          className="flex items-center"
        >
          <Link href="/">
            <motion.span 
              className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              ALGOVERSE.
            </motion.span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="hidden md:flex items-center space-x-6 lg:space-x-8"
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
          className="flex items-center space-x-2 sm:space-x-4"
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
          {showThemeToggle && (
              <ThemeToggle/>
          )}
          
          {showAuthButtons && (
            <div className="hidden sm:flex items-center gap-2">
              {isAuthenticated && user ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.5, type: "spring", stiffness: 400, damping: 17 }}
                  className="relative user-menu-container"
                >
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
                      variant="outline"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-white dark:bg-gray-800 flex items-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      {user?.walletAddress ? formatAddress(user.walletAddress) : "Wallet"}
                      <ChevronDown className={`w-3 h-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </motion.div>
                  
                  {/* Custom Dropdown */}
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                    >
                      {/* Wallet Address Display */}
                      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Wallet Address</p>
                        <p className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                          {user?.walletAddress || "No address"}
                        </p>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
                        <Link 
                          href="/dashboard/user" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Go to Dashboard
                        </Link>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsUserMenuOpen(false)
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.5, type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link href="/auth/user">
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
                        variant="outline"
                        className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-white dark:bg-gray-800 flex items-center gap-2"
                      >
                        <Wallet className="w-4 h-4" />
                        Connect Wallet
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? "auto" : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden overflow-hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 py-6 space-y-4">
          {/* Mobile Navigation Links */}
          <nav className="space-y-3">
            {[
              { href: "/marketplace", label: "Marketplace" },
              { href: "/events", label: "Events" },
              { href: "/about", label: "About" },
              { href: "/insights", label: "Insights" }
            ].map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isMobileMenuOpen ? 1 : 0, x: isMobileMenuOpen ? 0 : -20 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Link 
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-4 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Mobile Auth Buttons */}
          {showAuthButtons && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                {isAuthenticated && user ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isMobileMenuOpen ? 1 : 0, y: isMobileMenuOpen ? 0 : 20 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="relative user-menu-container"
                  >
                    <Button
                      variant="outline"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="w-full border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg py-3 text-sm font-medium bg-white dark:bg-gray-800 flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      {user?.walletAddress ? formatAddress(user.walletAddress) : "Wallet"}
                      <ChevronDown className={`w-3 h-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </Button>
                    
                    {/* Custom Dropdown for Mobile */}
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                      >
                        {/* Wallet Address Display */}
                        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Wallet Address</p>
                          <p className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                            {user?.walletAddress || "No address"}
                          </p>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-1">
                          <Link 
                            href="/dashboard/user" 
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              setIsMobileMenuOpen(false)
                            }}
                            className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <User className="w-4 h-4 mr-2" />
                            Go to Dashboard
                          </Link>
                          
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                          
                          <button
                            onClick={() => {
                              handleLogout()
                              setIsUserMenuOpen(false)
                              setIsMobileMenuOpen(false)
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isMobileMenuOpen ? 1 : 0, y: isMobileMenuOpen ? 0 : 20 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <Link href="/auth/user" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg py-3 text-sm font-medium bg-white dark:bg-gray-800 flex items-center justify-center gap-2"
                      >
                        <Wallet className="w-4 h-4" />
                        Connect Wallet
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.header>
  )
}
