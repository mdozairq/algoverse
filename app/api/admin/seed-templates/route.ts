import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

const templates = [
  {
    id: "modern",
    name: "Modern",
    description: "A sleek and contemporary design with clean lines and a focus on content.",
    preview: "/placeholder.svg?height=200&width=300&text=Modern+Template",
    category: "general",
    configuration: {
      layout: {
        headerStyle: 'fixed' as const,
        navigationStyle: 'horizontal' as const,
        footerStyle: 'full' as const,
      },
      theme: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#EF4444',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        cardStyle: 'elevated' as const,
        borderRadius: 'medium' as const,
      },
      features: {
        heroSection: true,
        featuredProducts: true,
        categories: true,
        testimonials: false,
        newsletter: true,
        socialLinks: true,
      },
      sections: {
        hero: {
          type: 'gradient' as const,
          height: 'medium' as const,
          overlay: false,
        },
        products: {
          layout: 'grid' as const,
          itemsPerRow: 3,
          showFilters: true,
          showSorting: true,
        },
        footer: {
          showLinks: true,
          showSocial: true,
          showNewsletter: true,
        },
      },
    },
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "classic",
    name: "Classic",
    description: "A timeless design with traditional layout and elegant styling.",
    preview: "/placeholder.svg?height=200&width=300&text=Classic+Template",
    category: "general",
    configuration: {
      layout: {
        headerStyle: 'static' as const,
        navigationStyle: 'horizontal' as const,
        footerStyle: 'full' as const,
      },
      theme: {
        primaryColor: '#8B5CF6',
        secondaryColor: '#06B6D4',
        accentColor: '#F59E0B',
        backgroundColor: '#F9FAFB',
        textColor: '#374151',
        cardStyle: 'outlined' as const,
        borderRadius: 'small' as const,
      },
      features: {
        heroSection: true,
        featuredProducts: true,
        categories: true,
        testimonials: true,
        newsletter: false,
        socialLinks: true,
      },
      sections: {
        hero: {
          type: 'image' as const,
          height: 'large' as const,
          overlay: true,
        },
        products: {
          layout: 'grid' as const,
          itemsPerRow: 2,
          showFilters: true,
          showSorting: false,
        },
        footer: {
          showLinks: true,
          showSocial: true,
          showNewsletter: false,
        },
      },
    },
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "A clean, minimalist design focusing on simplicity and functionality.",
    preview: "/placeholder.svg?height=200&width=300&text=Minimal+Template",
    category: "general",
    configuration: {
      layout: {
        headerStyle: 'fixed' as const,
        navigationStyle: 'minimal' as const,
        footerStyle: 'minimal' as const,
      },
      theme: {
        primaryColor: '#000000',
        secondaryColor: '#6B7280',
        accentColor: '#10B981',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        cardStyle: 'flat' as const,
        borderRadius: 'none' as const,
      },
      features: {
        heroSection: false,
        featuredProducts: true,
        categories: false,
        testimonials: false,
        newsletter: false,
        socialLinks: false,
      },
      sections: {
        hero: {
          type: 'gradient' as const,
          height: 'small' as const,
          overlay: false,
        },
        products: {
          layout: 'list' as const,
          itemsPerRow: 1,
          showFilters: false,
          showSorting: true,
        },
        footer: {
          showLinks: false,
          showSocial: false,
          showNewsletter: false,
        },
      },
    },
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "vibrant",
    name: "Vibrant",
    description: "A bold and colorful design with dynamic elements and rich visuals.",
    preview: "/placeholder.svg?height=200&width=300&text=Vibrant+Template",
    category: "general",
    configuration: {
      layout: {
        headerStyle: 'fixed' as const,
        navigationStyle: 'horizontal' as const,
        footerStyle: 'full' as const,
      },
      theme: {
        primaryColor: '#EC4899',
        secondaryColor: '#8B5CF6',
        accentColor: '#F59E0B',
        backgroundColor: '#FEF3C7',
        textColor: '#1F2937',
        cardStyle: 'elevated' as const,
        borderRadius: 'large' as const,
      },
      features: {
        heroSection: true,
        featuredProducts: true,
        categories: true,
        testimonials: true,
        newsletter: true,
        socialLinks: true,
      },
      sections: {
        hero: {
          type: 'gradient' as const,
          height: 'full' as const,
          overlay: true,
        },
        products: {
          layout: 'grid' as const,
          itemsPerRow: 4,
          showFilters: true,
          showSorting: true,
        },
        footer: {
          showLinks: true,
          showSocial: true,
          showNewsletter: true,
        },
      },
    },
    isActive: true,
    createdAt: new Date(),
  }
]

// POST /api/admin/seed-templates - Seed marketplace templates
export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting template seeding...')
    
    const createdTemplates = []
    const skippedTemplates = []
    
    for (const template of templates) {
      console.log(`Creating template: ${template.name}...`)
      
      try {
        // Check if template already exists
        const existingTemplate = await FirebaseService.getMarketplaceTemplateById(template.id)
        
        if (existingTemplate) {
          console.log(`⚠️  Template ${template.name} already exists, skipping...`)
          skippedTemplates.push(template.name)
          continue
        }
        
        // Create the template
        const templateId = await FirebaseService.createMarketplaceTemplate(template)
        console.log(`✅ Created template: ${template.name} with ID: ${templateId}`)
        createdTemplates.push(template.name)
        
      } catch (error) {
        console.error(`❌ Failed to create template ${template.name}:`, error)
      }
    }
    
    console.log('🎉 Template seeding completed!')
    console.log(`📊 Created: ${createdTemplates.length}, Skipped: ${skippedTemplates.length}`)
    
    return NextResponse.json({
      success: true,
      message: "Template seeding completed successfully",
      created: createdTemplates,
      skipped: skippedTemplates,
      total: templates.length
    })
    
  } catch (error: any) {
    console.error("❌ Error seeding templates:", error)
    return NextResponse.json({ 
      error: "Failed to seed templates",
      details: error.message 
    }, { status: 500 })
  }
}

// GET /api/admin/seed-templates - Check template status
export async function GET() {
  try {
    const allTemplates = await FirebaseService.getAllMarketplaceTemplates()
    
    return NextResponse.json({
      success: true,
      templates: allTemplates,
      count: allTemplates.length
    })
    
  } catch (error: any) {
    console.error("❌ Error fetching templates:", error)
    return NextResponse.json({ 
      error: "Failed to fetch templates",
      details: error.message 
    }, { status: 500 })
  }
}
