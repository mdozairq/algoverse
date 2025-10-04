const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error('Firebase environment variables are not set properly');
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Simple Firebase service for seeding
const FirebaseService = {
  async createMarketplaceTemplate(templateData) {
    const doc = await db.collection('marketplace_templates').add({
      ...templateData,
      createdAt: new Date(),
    });
    return doc.id;
  },

  async getMarketplaceTemplateById(id) {
    const doc = await db.collection('marketplace_templates').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }
};

const templates = [
  {
    id: "modern",
    name: "Modern",
    description: "A sleek, contemporary design with clean lines and bold typography. Perfect for tech companies and modern brands.",
    preview: "/placeholder.svg?height=200&width=300&text=Modern+Template",
    category: "business",
    configuration: {
      layout: {
        headerStyle: "fixed",
        navigationStyle: "horizontal",
        footerStyle: "full"
      },
      theme: {
        primaryColor: "#3B82F6",
        secondaryColor: "#10B981",
        accentColor: "#F59E0B",
        backgroundColor: "#FFFFFF",
        textColor: "#1F2937",
        cardStyle: "elevated",
        borderRadius: "large"
      },
      features: {
        heroSection: true,
        featuredProducts: true,
        categories: true,
        testimonials: true,
        newsletter: true,
        socialLinks: true
      },
      sections: {
        hero: {
          type: "gradient",
          height: "large",
          overlay: true
        },
        products: {
          layout: "grid",
          itemsPerRow: 4,
          showFilters: true,
          showSorting: true
        },
        footer: {
          showLinks: true,
          showSocial: true,
          showNewsletter: true
        }
      }
    },
    isActive: true
  },
  {
    id: "classic",
    name: "Classic",
    description: "A timeless, elegant design with traditional elements. Ideal for established businesses and luxury brands.",
    preview: "/placeholder.svg?height=200&width=300&text=Classic+Template",
    category: "business",
    configuration: {
      layout: {
        headerStyle: "static",
        navigationStyle: "horizontal",
        footerStyle: "full"
      },
      theme: {
        primaryColor: "#1F2937",
        secondaryColor: "#6B7280",
        accentColor: "#D97706",
        backgroundColor: "#F9FAFB",
        textColor: "#111827",
        cardStyle: "outlined",
        borderRadius: "medium"
      },
      features: {
        heroSection: true,
        featuredProducts: true,
        categories: true,
        testimonials: false,
        newsletter: true,
        socialLinks: true
      },
      sections: {
        hero: {
          type: "image",
          height: "medium",
          overlay: false
        },
        products: {
          layout: "list",
          itemsPerRow: 2,
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
    isActive: true
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "A clean, minimalist design focusing on content and simplicity. Perfect for creative professionals and artists.",
    preview: "/placeholder.svg?height=200&width=300&text=Minimal+Template",
    category: "creative",
    configuration: {
      layout: {
        headerStyle: "static",
        navigationStyle: "minimal",
        footerStyle: "minimal"
      },
      theme: {
        primaryColor: "#000000",
        secondaryColor: "#FFFFFF",
        accentColor: "#6B7280",
        backgroundColor: "#FFFFFF",
        textColor: "#000000",
        cardStyle: "flat",
        borderRadius: "none"
      },
      features: {
        heroSection: false,
        featuredProducts: true,
        categories: false,
        testimonials: false,
        newsletter: false,
        socialLinks: false
      },
      sections: {
        hero: {
          type: "gradient",
          height: "small",
          overlay: false
        },
        products: {
          layout: "grid",
          itemsPerRow: 3,
          showFilters: false,
          showSorting: false
        },
        footer: {
          showLinks: false,
          showSocial: false,
          showNewsletter: false
        }
      }
    },
    isActive: true
  },
  {
    id: "vibrant",
    name: "Vibrant",
    description: "A bold, colorful design with dynamic elements. Great for entertainment, events, and creative industries.",
    preview: "/placeholder.svg?height=200&width=300&text=Vibrant+Template",
    category: "entertainment",
    configuration: {
      layout: {
        headerStyle: "fixed",
        navigationStyle: "horizontal",
        footerStyle: "full"
      },
      theme: {
        primaryColor: "#8B5CF6",
        secondaryColor: "#F97316",
        accentColor: "#10B981",
        backgroundColor: "#0F0F23",
        textColor: "#FFFFFF",
        cardStyle: "elevated",
        borderRadius: "large"
      },
      features: {
        heroSection: true,
        featuredProducts: true,
        categories: true,
        testimonials: true,
        newsletter: true,
        socialLinks: true
      },
      sections: {
        hero: {
          type: "video",
          height: "full",
          overlay: true
        },
        products: {
          layout: "carousel",
          itemsPerRow: 5,
          showFilters: true,
          showSorting: true
        },
        footer: {
          showLinks: true,
          showSocial: true,
          showNewsletter: true
        }
      }
    },
    isActive: true
  }
];

async function seedTemplates() {
  try {
    console.log("Starting to seed marketplace templates...");
    
    for (const template of templates) {
      try {
        // Check if template already exists
        const existing = await FirebaseService.getMarketplaceTemplateById(template.id);
        if (existing) {
          console.log(`Template ${template.id} already exists, skipping...`);
          continue;
        }

        // Create the template
        const templateId = await FirebaseService.createMarketplaceTemplate(template);
        console.log(`✅ Created template: ${template.name} (${templateId})`);
      } catch (error) {
        console.error(`❌ Failed to create template ${template.name}:`, error);
      }
    }
    
    console.log("✅ Template seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
  }
}

// Run the seeding function
if (require.main === module) {
  seedTemplates();
}

module.exports = { seedTemplates, templates };
