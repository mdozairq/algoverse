"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

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

interface MarketplaceTemplate {
  id: string
  name: string
  description: string
  preview: string
  category: string
  configuration: {
    layout: {
      headerStyle: 'fixed' | 'static'
      navigationStyle: 'horizontal' | 'vertical' | 'minimal'
      footerStyle: 'full' | 'minimal' | 'hidden'
    }
    theme: {
      primaryColor: string
      secondaryColor: string
      accentColor: string
      backgroundColor: string
      textColor: string
      cardStyle: 'flat' | 'elevated' | 'outlined'
      borderRadius: 'none' | 'small' | 'medium' | 'large'
    }
    features: {
      heroSection: boolean
      featuredProducts: boolean
      categories: boolean
      testimonials: boolean
      newsletter: boolean
      socialLinks: boolean
    }
    sections: {
      hero: {
        type: 'image' | 'video' | 'gradient'
        height: 'small' | 'medium' | 'large' | 'full'
        overlay: boolean
      }
      products: {
        layout: 'grid' | 'list' | 'carousel'
        itemsPerRow: number
        showFilters: boolean
        showSorting: boolean
      }
      footer: {
        showLinks: boolean
        showSocial: boolean
        showNewsletter: boolean
      }
    }
  }
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}

interface TemplateLoaderProps {
  marketplaceId: string
  children: (data: {
    marketplace: Marketplace | null
    template: MarketplaceTemplate | null
    loading: boolean
    getButtonStyle: (variant?: 'primary' | 'secondary' | 'outline') => React.CSSProperties
    getCardStyle: () => React.CSSProperties
    getBadgeStyle: () => React.CSSProperties
    getThemeStyles: () => React.CSSProperties
    getHeaderStyle: () => React.CSSProperties
    getFooterStyle: () => React.CSSProperties
  }) => React.ReactNode
}

export default function TemplateLoader({ marketplaceId, children }: TemplateLoaderProps) {
  const [marketplace, setMarketplace] = useState<Marketplace | null>(null)
  const [template, setTemplate] = useState<MarketplaceTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const { theme, resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'

  const fetchMarketplaceData = async () => {
    setLoading(true)
    try {
      // Fetch marketplace details
      const marketplaceRes = await fetch(`/api/marketplaces/${marketplaceId}`)
      const marketplaceData = await marketplaceRes.json()
      
      if (marketplaceRes.ok) {
        // Check if marketplace is enabled
        if (!marketplaceData.marketplace.isEnabled) {
          setMarketplace(null)
          return
        }
        setMarketplace(marketplaceData.marketplace)
        
        // Fetch template configuration
        try {
          const templateRes = await fetch(`/api/marketplace-templates/${marketplaceData.marketplace.template}`)
          const templateData = await templateRes.json()
          
          if (templateRes.ok) {
            setTemplate(templateData.template)
          } else {
            // If template not found, create a default template
            console.warn("Template not found, using default template:", marketplaceData.marketplace.template)
            setTemplate(createDefaultTemplate(marketplaceData.marketplace))
          }
        } catch (templateError) {
          console.warn("Failed to fetch template, using default:", templateError)
          setTemplate(createDefaultTemplate(marketplaceData.marketplace))
        }
      } else {
        console.error("Failed to fetch marketplace:", marketplaceData.error)
        setMarketplace(null)
      }
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error)
      setMarketplace(null)
    } finally {
      setLoading(false)
    }
  }

  // Create a default template when template is not found
  const createDefaultTemplate = (marketplace: Marketplace): MarketplaceTemplate => {
    return {
      id: 'default',
      name: 'Default Template',
      description: 'Default marketplace template',
      preview: '',
      category: 'general',
      configuration: {
        layout: {
          headerStyle: 'static',
          navigationStyle: 'horizontal',
          footerStyle: 'full'
        },
        theme: {
          primaryColor: marketplace.primaryColor || '#3b82f6',
          secondaryColor: marketplace.secondaryColor || '#1e40af',
          accentColor: '#f59e0b',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          cardStyle: 'elevated',
          borderRadius: 'medium'
        },
        features: {
          heroSection: true,
          featuredProducts: true,
          categories: true,
          testimonials: false,
          newsletter: false,
          socialLinks: true
        },
        sections: {
          hero: {
            type: 'image',
            height: 'medium',
            overlay: true
          },
          products: {
            layout: 'grid',
            itemsPerRow: 4,
            showFilters: true,
            showSorting: true
          },
          footer: {
            showLinks: true,
            showSocial: true,
            showNewsletter: false
          }
        }
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  useEffect(() => {
    fetchMarketplaceData()
  }, [marketplaceId])

  // Marketplace color styling functions
  const getButtonStyle = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
    if (!template || !marketplace) return {}
    
    const baseStyle = {
      borderRadius: template.configuration.theme.borderRadius === 'large' ? '12px' : '8px',
      transition: 'all 0.2s ease'
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, ${marketplace.primaryColor}, ${marketplace.secondaryColor})`,
          color: 'white',
          border: 'none',
          boxShadow: `0 4px 14px 0 ${marketplace.primaryColor}40`
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

  const getCardStyle = () => {
    if (!template || !marketplace) return {}
    
    const cardStyle = template.configuration.theme.cardStyle
    const borderRadius = template.configuration.theme.borderRadius
    
    const styles: any = {
      borderColor: `${marketplace.primaryColor}20`,
      backgroundColor: `${marketplace.primaryColor}05`
    }
    
    if (cardStyle === "elevated") {
      styles.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      styles.transform = "translateY(0)"
      styles.transition = "all 0.3s ease"
    } else if (cardStyle === "outlined") {
      styles.border = `2px solid ${marketplace.primaryColor}30`
      styles.backgroundColor = `${marketplace.primaryColor}05`
    } else if (cardStyle === "flat") {
      styles.border = "1px solid rgba(0, 0, 0, 0.1)"
      styles.backgroundColor = isDarkMode ? '#1f2937' : 'white'
    }
    
    if (borderRadius === "none") {
      styles.borderRadius = "0"
    } else if (borderRadius === "small") {
      styles.borderRadius = "6px"
    } else if (borderRadius === "medium") {
      styles.borderRadius = "12px"
    } else if (borderRadius === "large") {
      styles.borderRadius = "20px"
    }
    
    return styles
  }

  const getBadgeStyle = () => {
    if (!marketplace) return {}
    
    return {
      backgroundColor: `${marketplace.primaryColor}90`,
      color: 'white'
    }
  }

  const getThemeStyles = () => {
    if (!template || !marketplace) return {}
    
    const theme = template.configuration.theme
    return {
      '--primary-color': theme.primaryColor,
      '--secondary-color': theme.secondaryColor,
      '--accent-color': theme.accentColor,
      '--background-color': theme.backgroundColor,
      '--text-color': theme.textColor,
    } as React.CSSProperties
  }

  const getHeaderStyle = () => {
    if (!template || !marketplace) return {}
    
    const headerStyle = template.configuration.layout.headerStyle
    const theme = template.configuration.theme
    
    return {
      position: headerStyle === 'fixed' ? 'fixed' as const : 'static' as const,
      top: headerStyle === 'fixed' ? '0' : 'auto',
      left: headerStyle === 'fixed' ? '0' : 'auto',
      right: headerStyle === 'fixed' ? '0' : 'auto',
      zIndex: headerStyle === 'fixed' ? 50 : 'auto',
      backgroundColor: `${theme.backgroundColor}95`,
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${theme.primaryColor}20`
    }
  }

  const getFooterStyle = () => {
    if (!template || !marketplace) return {}
    
    const footerStyle = template.configuration.layout.footerStyle
    const theme = template.configuration.theme
    
    return {
      backgroundColor: theme.backgroundColor,
      borderTop: `1px solid ${theme.primaryColor}20`,
      padding: footerStyle === 'minimal' ? '1rem 0' : '3rem 0'
    }
  }

  return (
    <>
      {children({
        marketplace,
        template,
        loading,
        getButtonStyle,
        getCardStyle,
        getBadgeStyle,
        getThemeStyles,
        getHeaderStyle,
        getFooterStyle
      })}
    </>
  )
}
