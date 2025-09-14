"use client"

import Link from "next/link"
import { motion } from "framer-motion"

interface FooterProps {
  showAnimations?: boolean
  className?: string
}

export default function Footer({ 
  showAnimations = true, 
  className = "" 
}: FooterProps) {
  const footerContent = (
    <footer className={`py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}>
      <div className="container-responsive">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div>
            <span className="text-xl font-black tracking-tight mb-4 block text-gray-900 dark:text-white">
              EVENTNFT.
            </span>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              The decentralized marketplace for event tickets and experiences.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-sm tracking-wide text-gray-900 dark:text-white">MARKETPLACE</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/events" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/concerts" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Concerts
                </Link>
              </li>
              <li>
                <Link href="/hotels" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Hotels
                </Link>
              </li>
              <li>
                <Link href="/movies" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Movies
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-sm tracking-wide text-gray-900 dark:text-white">FOR MERCHANTS</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/auth/merchant" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Become a Merchant
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-sm tracking-wide text-gray-900 dark:text-white">SUPPORT</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/help" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-gray-500 dark:text-gray-500">&copy; 2024 EventNFT. All rights reserved.</p>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )

  if (showAnimations) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {footerContent}
      </motion.div>
    )
  }

  return footerContent
}
