"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  ExternalLink, 
  Share2, 
  ShoppingCart, 
  Menu, 
  X
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
  createdAt: Date
  updatedAt?: Date
}

interface MarketplaceHeaderProps {
  marketplace: Marketplace
  merchantId: string
  marketplaceId: string
}

export default function MarketplaceHeader({ marketplace, merchantId, marketplaceId }: MarketplaceHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getHeaderStyle = () => {
    return {
      background: `linear-gradient(135deg, ${marketplace.primaryColor}15, ${marketplace.secondaryColor}15)`,
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${marketplace.primaryColor}20`
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
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={getHeaderStyle()}
      className="w-full"
    >
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <motion.div 
            className="flex items-center gap-4 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Link href={`/marketplace/${merchantId}/${marketplaceId}`} className="flex items-center gap-4 cursor-pointer">
            {marketplace.logo ? (
              <div className="relative">
                <Image
                  src={marketplace.logo}
                  alt={marketplace.businessName}
                  width={48}
                  height={48}
                  className="rounded-xl shadow-lg"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
            ) : (
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${marketplace.primaryColor}, ${marketplace.secondaryColor})` 
                }}
              >
                {marketplace.businessName.charAt(0)}
                </div>
              )}
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {marketplace.businessName}
              </h1>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    borderColor: marketplace.primaryColor,
                    color: marketplace.primaryColor 
                  }}
                >
                  {marketplace.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </div>
            </div>
            </Link>
          </motion.div>
          
          {/* Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-6">
              <Link href={`/marketplace/${merchantId}/${marketplaceId}/collection`} className="text-sm font-medium hover:opacity-80 transition-opacity">
                  Collections
              </Link>
              {marketplace.allowSwap && (
                <Link href={`/marketplace/${merchantId}/${marketplaceId}/swap`} className="text-sm font-medium hover:opacity-80 transition-opacity">
                  Swap
                </Link>
              )}
              {marketplace.allowMint && (
                <Link href={`/marketplace/${merchantId}/${marketplaceId}/mint`} className="text-sm font-medium hover:opacity-80 transition-opacity">
                  Mint
                </Link>
              )}
              {marketplace.allowTrading && (
                <Link href={`/marketplace/${merchantId}/${marketplaceId}/trade`} className="text-sm font-medium hover:opacity-80 transition-opacity">
                  Trade
                </Link>
              )}
              {marketplace.allowCreate && (<Link href={`/marketplace/${merchantId}/${marketplaceId}/create`} className="text-sm font-medium hover:opacity-80 transition-opacity">
                Create
              </Link>
              )}
              {marketplace.allowCreate && (<Link href={`/marketplace/${merchantId}/${marketplaceId}/generate`} className="text-sm font-medium hover:opacity-80 transition-opacity">
                Generate
              </Link>
              )}
            </nav>
            
            <div className="flex items-center gap-2">
              {/* Theme Toggle Button */}
              <ThemeToggle />
              
              {marketplace.website && (
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                  style={getButtonStyle('outline')}
                >
                  <Link href={marketplace.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Website
                  </Link>
                </Button>
              )}
              {/* Wallet Connect Button */}
              <WalletConnectButton 
                variant="outline" 
                size="sm"
                className="ml-2"
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4 border-t border-border mt-4">
                <nav className="flex flex-col gap-3">
                  {/* <Link href="#products" className="text-sm font-medium hover:opacity-80 transition-opacity">
                    Products
                  </Link> */}
                  <Link href={`/marketplace/${merchantId}/${marketplaceId}/collection`} className="text-sm font-medium hover:opacity-80 transition-opacity">
                    Collections
                  </Link>
                  {marketplace.allowSwap && (
                    <Link href={`/marketplace/${merchantId}/${marketplaceId}/swap`} className="text-sm font-medium hover:opacity-80 transition-opacity">
                      Swap
                    </Link>
                  )}
                  {marketplace.allowMint && (
                    <Link href={`/marketplace/${merchantId}/${marketplaceId}/mint`} className="text-sm font-medium hover:opacity-80 transition-opacity">
                      Mint
                    </Link>
                  )}
                  {marketplace.allowTrading && (
                    <Link href={`/marketplace/${merchantId}/${marketplaceId}/trade`} className="text-sm font-medium hover:opacity-80 transition-opacity">
                      Trade
                    </Link>
                  )}
                  <Link href={`/marketplace/${merchantId}/${marketplaceId}/create`} className="text-sm font-medium hover:opacity-80 transition-opacity">
                    Create
                  </Link>
                  <Link href={`/marketplace/${merchantId}/${marketplaceId}/generate`} className="text-sm font-medium hover:opacity-80 transition-opacity">
                    Generate
                  </Link>
                </nav>
                <div className="flex flex-col gap-2">
                  {/* Mobile Theme Toggle Button */}
                  <div className="w-full flex justify-center">
                    <ThemeToggle />
                  </div>
                  
                  {marketplace.website && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                      style={getButtonStyle('outline')}
                    >
                      <Link href={marketplace.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Website
                      </Link>
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    style={getButtonStyle('outline')}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    size="sm"
                    style={getButtonStyle('primary')}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart
                  </Button>
                  {/* Mobile Wallet Connect Button */}
                  <WalletConnectButton 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
