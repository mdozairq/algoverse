// Template Engine for Dynamic Marketplace Rendering
import React from "react"
import { MarketplaceTemplate, Marketplace } from "@/lib/firebase/collections"

export interface TemplateRenderer {
  renderHeader: (marketplace: Marketplace, template: MarketplaceTemplate) => React.ReactElement
  renderHero: (marketplace: Marketplace, template: MarketplaceTemplate) => React.ReactElement
  renderProducts: (marketplace: Marketplace, template: MarketplaceTemplate, products: any[]) => React.ReactElement
  renderFooter: (marketplace: Marketplace, template: MarketplaceTemplate) => React.ReactElement
  getStyles: (marketplace: Marketplace, template: MarketplaceTemplate) => React.CSSProperties
}

export class TemplateEngine {
  private static instance: TemplateEngine
  private renderers: Map<string, TemplateRenderer> = new Map()

  private constructor() {
    this.initializeRenderers()
  }

  public static getInstance(): TemplateEngine {
    if (!TemplateEngine.instance) {
      TemplateEngine.instance = new TemplateEngine()
    }
    return TemplateEngine.instance
  }

  private initializeRenderers() {
    // Register template renderers
    this.renderers.set('modern', new ModernTemplateRenderer())
    this.renderers.set('classic', new ClassicTemplateRenderer())
    this.renderers.set('minimal', new MinimalTemplateRenderer())
    this.renderers.set('vibrant', new VibrantTemplateRenderer())
  }

  public getRenderer(templateId: string): TemplateRenderer | null {
    return this.renderers.get(templateId) || null
  }

  public renderMarketplace(
    marketplace: Marketplace, 
    template: MarketplaceTemplate, 
    products: any[]
  ): {
    header: React.ReactElement
    hero: React.ReactElement
    products: React.ReactElement
    footer: React.ReactElement
    styles: React.CSSProperties
  } {
    const renderer = this.getRenderer(template.id)
    if (!renderer) {
      throw new Error(`Template renderer not found for: ${template.id}`)
    }

    return {
      header: renderer.renderHeader(marketplace, template),
      hero: renderer.renderHero(marketplace, template),
      products: renderer.renderProducts(marketplace, template, products),
      footer: renderer.renderFooter(marketplace, template),
      styles: renderer.getStyles(marketplace, template)
    }
  }
}

// Base Template Renderer
abstract class BaseTemplateRenderer implements TemplateRenderer {
  abstract renderHeader(marketplace: Marketplace, template: MarketplaceTemplate): React.ReactElement
  abstract renderHero(marketplace: Marketplace, template: MarketplaceTemplate): React.ReactElement
  abstract renderProducts(marketplace: Marketplace, template: MarketplaceTemplate, products: any[]): React.ReactElement
  abstract renderFooter(marketplace: Marketplace, template: MarketplaceTemplate): React.ReactElement

  getStyles(marketplace: Marketplace, template: MarketplaceTemplate): React.CSSProperties {
    const theme = template.configuration.theme
    return {
      '--primary-color': marketplace.primaryColor || theme.primaryColor,
      '--secondary-color': marketplace.secondaryColor || theme.secondaryColor,
      '--accent-color': theme.accentColor,
      '--background-color': theme.backgroundColor,
      '--text-color': theme.textColor,
    } as React.CSSProperties
  }

  protected getCardStyle(template: MarketplaceTemplate): React.CSSProperties {
    const cardStyle = template.configuration.theme.cardStyle
    const borderRadius = template.configuration.theme.borderRadius
    const primaryColor = template.configuration.theme.primaryColor
    
    const styles: any = {}
    
    if (cardStyle === "elevated") {
      styles.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      styles.transform = "translateY(0)"
      styles.transition = "all 0.3s ease"
    } else if (cardStyle === "outlined") {
      styles.border = `2px solid ${primaryColor}30`
      styles.backgroundColor = `${primaryColor}05`
    } else if (cardStyle === "flat") {
      styles.border = "1px solid rgba(0, 0, 0, 0.1)"
      styles.backgroundColor = "white"
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

  protected getButtonStyle(template: MarketplaceTemplate, variant: 'primary' | 'secondary' | 'outline' = 'primary'): React.CSSProperties {
    const theme = template.configuration.theme
    
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.primaryColor,
          color: 'white',
          border: 'none',
          borderRadius: theme.borderRadius === 'large' ? '12px' : '8px',
          transition: 'all 0.3s ease',
          boxShadow: `0 4px 14px 0 ${theme.primaryColor}40`
        }
      case 'secondary':
        return {
          backgroundColor: theme.secondaryColor,
          color: 'white',
          border: 'none',
          borderRadius: theme.borderRadius === 'large' ? '12px' : '8px',
          transition: 'all 0.3s ease'
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.primaryColor,
          border: `2px solid ${theme.primaryColor}`,
          borderRadius: theme.borderRadius === 'large' ? '12px' : '8px',
          transition: 'all 0.3s ease'
        }
      default:
        return {}
    }
  }
}

// Modern Template Renderer
class ModernTemplateRenderer extends BaseTemplateRenderer {
  renderHeader(marketplace: Marketplace, template: MarketplaceTemplate): React.ReactElement {
    const headerStyle = template.configuration.layout.headerStyle
    const theme = template.configuration.theme
    
    return React.createElement('header', {
      style: {
        position: headerStyle === 'fixed' ? 'fixed' : 'static',
        top: headerStyle === 'fixed' ? '0' : 'auto',
        left: headerStyle === 'fixed' ? '0' : 'auto',
        right: headerStyle === 'fixed' ? '0' : 'auto',
        zIndex: headerStyle === 'fixed' ? 50 : 'auto',
        backgroundColor: `${theme.backgroundColor}95`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.primaryColor}20`
      },
      className: "w-full"
    },
      React.createElement('div', { className: "container mx-auto px-4 lg:px-6 py-4" },
        React.createElement('div', { className: "flex items-center justify-between" },
          React.createElement('div', { className: "flex items-center gap-4" },
            marketplace.logo ? 
              React.createElement('img', {
                src: marketplace.logo,
                alt: marketplace.businessName,
                className: "w-12 h-12 rounded-xl shadow-lg"
              }) :
              React.createElement('div', {
                className: "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg",
                style: { 
                  background: `linear-gradient(135deg, ${marketplace.primaryColor}, ${marketplace.secondaryColor})` 
                }
              }, marketplace.businessName.charAt(0)),
            React.createElement('div', null,
              React.createElement('h1', { className: "text-xl font-bold text-gray-900 dark:text-white" },
                marketplace.businessName),
              React.createElement('div', { className: "flex items-center gap-2" },
                React.createElement('span', {
                  className: "text-xs px-2 py-1 rounded-full",
                  style: { 
                    backgroundColor: `${marketplace.primaryColor}20`,
                    color: marketplace.primaryColor 
                  }
                }, marketplace.category),
                React.createElement('div', { className: "flex items-center gap-1" },
                  React.createElement('div', { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse" }),
                  React.createElement('span', { className: "text-xs text-gray-500" }, "Live")
                )
              )
            )
          ),
          React.createElement('div', { className: "hidden md:flex items-center gap-4" },
            React.createElement('nav', { className: "flex items-center gap-6" },
              React.createElement('a', { href: "#products", className: "text-sm font-medium hover:opacity-80 transition-opacity" }, "Products"),
              React.createElement('a', { href: "#about", className: "text-sm font-medium hover:opacity-80 transition-opacity" }, "About"),
              React.createElement('a', { href: "#contact", className: "text-sm font-medium hover:opacity-80 transition-opacity" }, "Contact")
            )
          )
        )
      )
    )
  }

  renderHero(marketplace: Marketplace, template: MarketplaceTemplate): React.ReactElement {
    if (!template.configuration.features.heroSection) {
      return React.createElement(React.Fragment)
    }

    const heroConfig = template.configuration.sections.hero
    const theme = template.configuration.theme
    
    const heightMap = {
      'small': '30vh',
      'medium': '50vh', 
      'large': '70vh',
      'full': '100vh'
    }
    
    return React.createElement('section', {
      className: `relative overflow-hidden ${template.configuration.layout.headerStyle === 'fixed' ? 'pt-20' : ''}`,
      style: {
        height: heightMap[heroConfig.height],
        background: marketplace.banner 
          ? `url(${marketplace.banner}) center/cover`
          : `linear-gradient(135deg, ${marketplace.primaryColor}, ${marketplace.secondaryColor})`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    },
      marketplace.banner && heroConfig.overlay && 
        React.createElement('div', { className: "absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" }),
      
      React.createElement('div', { className: "relative container mx-auto px-4 lg:px-6 py-16 flex items-center min-h-full" },
        React.createElement('div', { className: "max-w-4xl w-full" },
          React.createElement('div', {
            className: "mb-4 text-sm px-4 py-2 rounded-full inline-block",
            style: { 
              backgroundColor: `${marketplace.primaryColor}20`,
              color: marketplace.primaryColor,
              border: `1px solid ${marketplace.primaryColor}30`
            }
          }, "⚡ Premium Marketplace"),
          
          React.createElement('h1', { className: "text-5xl md:text-7xl font-black text-white mb-6 leading-tight" },
            marketplace.businessName),
          
          React.createElement('p', { className: "text-xl md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed" },
            marketplace.description),
          
          React.createElement('div', { className: "flex flex-col sm:flex-row gap-4" },
            React.createElement('button', {
              className: "bg-white text-gray-900 hover:bg-gray-100 shadow-xl px-8 py-4 rounded-lg font-semibold transition-all duration-300",
              style: { borderRadius: theme.borderRadius === 'large' ? '16px' : '12px' }
            }, "🛒 Shop Now"),
            React.createElement('button', {
              className: "border-white text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 rounded-lg font-semibold transition-all duration-300",
              style: { borderRadius: theme.borderRadius === 'large' ? '16px' : '12px' }
            }, "▶️ Watch Demo")
          )
        )
      )
    )
  }

  renderProducts(marketplace: Marketplace, template: MarketplaceTemplate, products: any[]): React.ReactElement {
    const itemsPerRow = template.configuration.sections.products.itemsPerRow
    const layout = template.configuration.sections.products.layout
    
    const gridMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6'
    }
    
    const gridClass = layout === 'list' ? 'grid-cols-1' : (gridMap[itemsPerRow] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3')

    return React.createElement('main', { className: "container mx-auto px-4 lg:px-6 py-8" },
      React.createElement('div', { className: "flex items-center justify-between mb-6" },
        React.createElement('h2', { className: "text-2xl font-bold text-gray-900 dark:text-white" },
          "Products & NFTs"),
        React.createElement('div', { className: "flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400" },
          "📦 ",
          React.createElement('span', null, `${products.length} items`)
        )
      ),
      
      React.createElement('div', { className: `grid gap-6 ${gridClass}` },
        products.map((product) => 
          React.createElement('div', {
            key: product.id,
            className: "overflow-hidden h-full group cursor-pointer",
            style: this.getCardStyle(template)
          },
            React.createElement('div', { className: "aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative" },
              React.createElement('img', {
                src: product.image,
                alt: product.name,
                className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              }),
              
              React.createElement('div', { className: "absolute top-3 left-3 flex flex-col gap-2" },
                !product.inStock && 
                  React.createElement('span', { className: "text-xs px-2 py-1 bg-red-500 text-white rounded-full" },
                    "Out of Stock"),
                product.allowSwap && 
                  React.createElement('span', {
                    className: "text-xs px-2 py-1 text-white rounded-full",
                    style: { backgroundColor: `${marketplace.secondaryColor}90` }
                  }, "🔄 Swappable")
              )
            ),
            
            React.createElement('div', { className: "p-4" },
              React.createElement('div', { className: "flex items-start justify-between mb-2" },
                React.createElement('div', { className: "flex-1" },
                  React.createElement('h3', { className: "text-lg font-semibold line-clamp-2 mb-1" },
                    product.name),
                  React.createElement('p', { className: "text-sm text-gray-600 dark:text-gray-400 line-clamp-2" },
                    product.description)
                ),
                React.createElement('span', {
                  className: "text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0",
                  style: { 
                    backgroundColor: `${marketplace.secondaryColor}20`,
                    color: marketplace.secondaryColor
                  }
                }, product.type)
              ),
              
              React.createElement('div', { className: "flex items-center justify-between mb-4" },
                React.createElement('div', { className: "flex items-center gap-1" },
                  React.createElement('span', { className: "text-yellow-400" }, "⭐"),
                  React.createElement('span', { className: "text-sm font-medium" }, product.rating),
                  React.createElement('span', { className: "text-xs text-gray-500" }, `(${product.reviews})`)
                )
              ),
              
              React.createElement('div', { className: "flex items-center justify-between" },
                React.createElement('div', null,
                  React.createElement('span', { className: "text-2xl font-bold" }, product.price),
                  React.createElement('span', { className: "text-sm text-gray-500 ml-1" }, product.currency)
                ),
                React.createElement('div', { className: "flex gap-2" },
                  React.createElement('button', {
                    className: "px-4 py-2 text-white font-medium transition-all duration-300",
                    style: this.getButtonStyle(template, 'primary'),
                    disabled: !product.inStock
                  }, "🛒 Buy"),
                  
                  product.type === "nft" && marketplace.allowSwap && product.allowSwap && 
                    React.createElement('button', {
                      className: "px-4 py-2 font-medium transition-all duration-300",
                      style: this.getButtonStyle(template, 'outline')
                    }, "🔄 Swap")
                )
              )
            )
          )
        )
      )
    )
  }

  renderFooter(marketplace: Marketplace, template: MarketplaceTemplate): React.ReactElement {
    if (!template.configuration.features.socialLinks) {
      return React.createElement(React.Fragment)
    }

    return React.createElement('footer', {
      className: "border-t border-gray-200 dark:border-gray-700 py-12 mt-16",
      style: { backgroundColor: template.configuration.theme.backgroundColor || "#F9FAFB" }
    },
      React.createElement('div', { className: "container mx-auto px-4 lg:px-6" },
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-8" },
          React.createElement('div', { className: "md:col-span-2" },
            React.createElement('div', { className: "flex items-center gap-3 mb-4" },
              marketplace.logo ? 
                React.createElement('img', {
                  src: marketplace.logo,
                  alt: marketplace.businessName,
                  className: "w-10 h-10 rounded-lg"
                }) :
                React.createElement('div', {
                  className: "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold",
                  style: { 
                    background: `linear-gradient(135deg, ${marketplace.primaryColor}, ${marketplace.secondaryColor})` 
                  }
                }, marketplace.businessName.charAt(0)),
              React.createElement('h3', { className: "font-bold text-xl" }, marketplace.businessName)
            ),
            React.createElement('p', { className: "text-gray-600 dark:text-gray-400 mb-6 max-w-md" },
              marketplace.description)
          ),
          
          React.createElement('div', null,
            React.createElement('h4', { className: "font-semibold mb-4 text-gray-900 dark:text-white" }, "Quick Links"),
            React.createElement('div', { className: "space-y-3" },
              React.createElement('a', { href: "#products", className: "block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" }, "Products"),
              React.createElement('a', { href: "#about", className: "block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" }, "About Us"),
              React.createElement('a', { href: "#contact", className: "block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" }, "Contact")
            )
          ),
          
          React.createElement('div', null,
            React.createElement('h4', { className: "font-semibold mb-4 text-gray-900 dark:text-white" }, "Contact Info"),
            React.createElement('div', { className: "space-y-3 text-sm text-gray-600 dark:text-gray-400" },
              React.createElement('div', { className: "flex items-center gap-2" },
                "📧 ",
                React.createElement('span', null, `info@${marketplace.businessName.toLowerCase().replace(/\s+/g, '')}.com`)
              ),
              React.createElement('div', { className: "flex items-center gap-2" },
                "🛡️ ",
                React.createElement('span', null, "Secure Payments")
              ),
              React.createElement('div', { className: "flex items-center gap-2" },
                "🕐 ",
                React.createElement('span', null, "24/7 Support")
              )
            )
          )
        ),
        
        React.createElement('div', { className: "border-t border-gray-200 dark:border-gray-700 mt-8 pt-8" },
          React.createElement('div', { className: "flex flex-col md:flex-row items-center justify-between gap-4" },
            React.createElement('div', { className: "text-sm text-gray-600 dark:text-gray-400" },
              React.createElement('p', null, `© 2024 ${marketplace.businessName}. All rights reserved.`)
            )
          )
        )
      )
    )
  }
}

// Classic Template Renderer
class ClassicTemplateRenderer extends BaseTemplateRenderer {
  renderHeader(marketplace: Marketplace, template: MarketplaceTemplate): React.ReactElement {
    return this.renderHeader(marketplace, template)
  }

  renderHero(marketplace: Marketplace, template: MarketplaceTemplate): React.ReactElement {
    return this.renderHero(marketplace, template)
  }

  renderProducts(marketplace: Marketplace, template: MarketplaceTemplate, products: any[]): React.ReactElement {
    return this.renderProducts(marketplace, template, products)
  }

  renderFooter(marketplace: Marketplace, template: MarketplaceTemplate): React.ReactElement {
    return this.renderFooter(marketplace, template)
  }
}

// Minimal Template Renderer
class MinimalTemplateRenderer extends BaseTemplateRenderer {
  renderHeader(marketplace: Marketplace, template: MarketplaceTemplate): React.ReactElement {
    return this.renderHeader(marketplace, template)
  }

  renderHero(marketplace: Marketplace, template: MarketplaceTemplate): React.ReactElement {
    return this.renderHero(marketplace, template)
  }

  renderProducts(marketplace: Marketplace, template: MarketplaceTemplate, products: any[]): React.ReactElement {
    return this.renderProducts(marketplace, template, products)
  }

  renderFooter(marketplace: Marketplace, template: MarketplaceTemplate): React.ReactElement {
    return this.renderFooter(marketplace, template)
  }
}

// Vibrant Template Renderer
class VibrantTemplateRenderer extends BaseTemplateRenderer {
  renderHeader(marketplace: Marketplace, template: MarketplaceTemplate): React.ReactElement {
    return this.renderHeader(marketplace, template)
  }

  renderHero(marketplace: Marketplace, template: MarketplaceTemplate): React.ReactElement {
    return this.renderHero(marketplace, template)
  }

  renderProducts(marketplace: Marketplace, template: MarketplaceTemplate, products: any[]): React.ReactElement {
    return this.renderProducts(marketplace, template, products)
  }

  renderFooter(marketplace: Marketplace, template: MarketplaceTemplate): React.ReactElement {
    return this.renderFooter(marketplace, template)
  }
}

export default TemplateEngine