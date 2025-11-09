"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  ExternalLink, 
  Share2, 
  Heart,
  Twitter,
  Github,
  Mail,
  Phone,
  MapPin
} from "lucide-react"
import Link from "next/link"

interface Marketplace {
  id: string
  merchantId: string
  businessName: string
  description: string
  category: string
  website?: string
  logo?: string
  banner?: string | string[]
  template: string
  primaryColor: string
  secondaryColor: string
  paymentMethod: string
  walletAddress: string
  status: "draft" | "pending" | "approved" | "rejected"
  isEnabled: boolean
  allowSwap: boolean
  allowMint?: boolean
  allowTrading?: boolean
  allowCreate?: boolean
  allowGenerate?: boolean
  createdAt: Date
  updatedAt?: Date
}

interface MarketplaceFooterProps {
  marketplace: Marketplace
}

export default function MarketplaceFooter({ marketplace }: MarketplaceFooterProps) {
  const getFooterStyle = () => {
    return {
      background: `linear-gradient(135deg, ${marketplace.primaryColor}05, ${marketplace.secondaryColor}05)`,
      borderTop: `1px solid ${marketplace.primaryColor}20`
    }
  }

  const getButtonStyle = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
    const baseStyle = {
      borderRadius: '8px',
      transition: 'all 0.2s ease'
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, ${marketplace.primaryColor}, ${marketplace.secondaryColor})`,
          color: 'white',
          border: 'none'
        }
      case 'secondary':
        return {
          ...baseStyle,
          background: `${marketplace.primaryColor}10`,
          color: marketplace.primaryColor,
          border: `1px solid ${marketplace.primaryColor}30`
        }
      case 'outline':
        return {
          ...baseStyle,
          background: 'transparent',
          color: marketplace.primaryColor,
          border: `1px solid ${marketplace.primaryColor}40`
        }
      default:
        return baseStyle
    }
  }

  return (
    <motion.footer 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      style={getFooterStyle()}
      className="w-full mt-16"
    >
      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {marketplace.businessName}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {marketplace.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: marketplace.primaryColor }}
              />
              <span className="text-xs text-muted-foreground capitalize">
                {marketplace.category} • {marketplace.template} template
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <nav className="space-y-2">
              <Link href="#products" className="block text-sm text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors">
                Products
              </Link>
              {marketplace.allowSwap && (
                <Link href={`/marketplace/${marketplace.merchantId}/${marketplace.id}/swap`} className="block text-sm text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors">
                  Swap
                </Link>
              )}
              {marketplace.allowMint && (
                <Link href={`/marketplace/${marketplace.merchantId}/${marketplace.id}/mint`} className="block text-sm text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors">
                  Mint
                </Link>
              )}
              {marketplace.allowTrading && (
                <Link href={`/marketplace/${marketplace.merchantId}/${marketplace.id}/trade`} className="block text-sm text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors">
                  Trade
                </Link>
              )}
              {marketplace?.allowCreate && <Link href={`/marketplace/${marketplace.merchantId}/${marketplace.id}/create`} className="block text-sm text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors">
                Create
              </Link>}
              {marketplace?.allowGenerate && <Link href={`/marketplace/${marketplace.merchantId}/${marketplace.id}/generate`} className="block text-sm text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors">
                Generate
              </Link>}
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Support</h4>
            <nav className="space-y-2">
              <Link href="#help" className="block text-sm text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors">
                Help Center
              </Link>
              <Link href="#contact" className="block text-sm text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors">
                Contact Us
              </Link>
              <Link href="#privacy" className="block text-sm text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#terms" className="block text-sm text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Connect</h4>
            <div className="flex flex-col gap-3">
              {marketplace.website && (
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                  style={getButtonStyle('outline')}
                >
                  <Link href={marketplace.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </Link>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                style={getButtonStyle('outline')}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Marketplace
              </Button>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2"
                style={getButtonStyle('outline')}
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2"
                style={getButtonStyle('outline')}
              >
                <Github className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2"
                style={getButtonStyle('outline')}
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm text-muted-foreground">
                Powered by NFT Marketplace Platform
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© 2024 {marketplace.businessName}</span>
              <span>•</span>
              <span>All rights reserved</span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
