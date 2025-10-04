"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Eye, Palette, Layout, Settings } from "lucide-react"
import { motion } from "framer-motion"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"

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

export default function MarketplaceTemplatesPage() {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MarketplaceTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    configuration: {
      layout: {
        headerStyle: "static" as 'fixed' | 'static',
        navigationStyle: "horizontal" as 'horizontal' | 'vertical' | 'minimal',
        footerStyle: "full" as 'full' | 'minimal' | 'hidden'
      },
      theme: {
        primaryColor: "#3B82F6",
        secondaryColor: "#10B981",
        accentColor: "#F59E0B",
        backgroundColor: "#FFFFFF",
        textColor: "#1F2937",
        cardStyle: "elevated" as 'flat' | 'elevated' | 'outlined',
        borderRadius: "medium" as 'none' | 'small' | 'medium' | 'large'
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
          type: "gradient" as 'image' | 'video' | 'gradient',
          height: "medium" as 'small' | 'medium' | 'large' | 'full',
          overlay: true
        },
        products: {
          layout: "grid" as 'grid' | 'list' | 'carousel',
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
    }
  })

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/marketplace-templates")
      const data = await res.json()
      if (res.ok) setTemplates(data.templates || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleCreateTemplate = async () => {
    try {
      const res = await fetch("/api/marketplace-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setIsCreateDialogOpen(false)
        setFormData({
          name: "",
          description: "",
          category: "",
          configuration: formData.configuration
        })
        fetchTemplates()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleEditTemplate = (template: MarketplaceTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      configuration: template.configuration
    })
    setIsCreateDialogOpen(true)
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return
    
    try {
      const res = await fetch(`/api/marketplace-templates/${id}`, {
        method: "DELETE"
      })
      
      if (res.ok) {
        fetchTemplates()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      business: "bg-blue-100 text-blue-800",
      creative: "bg-purple-100 text-purple-800",
      entertainment: "bg-pink-100 text-pink-800",
      default: "bg-gray-100 text-gray-800"
    }
    return colors[category as keyof typeof colors] || colors.default
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="container mx-auto px-6 py-8">
          <FadeIn>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">Marketplace Templates</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage marketplace templates for merchants
                </p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTemplate ? "Edit Template" : "Create New Template"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Template Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Enter template name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => setFormData({...formData, category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="creative">Creative</SelectItem>
                            <SelectItem value="entertainment">Entertainment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Enter template description"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        <h3 className="text-lg font-semibold">Theme Configuration</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="primaryColor">Primary Color</Label>
                          <Input
                            id="primaryColor"
                            type="color"
                            value={formData.configuration.theme.primaryColor}
                            onChange={(e) => setFormData({
                              ...formData,
                              configuration: {
                                ...formData.configuration,
                                theme: {
                                  ...formData.configuration.theme,
                                  primaryColor: e.target.value
                                }
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="secondaryColor">Secondary Color</Label>
                          <Input
                            id="secondaryColor"
                            type="color"
                            value={formData.configuration.theme.secondaryColor}
                            onChange={(e) => setFormData({
                              ...formData,
                              configuration: {
                                ...formData.configuration,
                                theme: {
                                  ...formData.configuration.theme,
                                  secondaryColor: e.target.value
                                }
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="accentColor">Accent Color</Label>
                          <Input
                            id="accentColor"
                            type="color"
                            value={formData.configuration.theme.accentColor}
                            onChange={(e) => setFormData({
                              ...formData,
                              configuration: {
                                ...formData.configuration,
                                theme: {
                                  ...formData.configuration.theme,
                                  accentColor: e.target.value
                                }
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Layout className="w-5 h-5" />
                        <h3 className="text-lg font-semibold">Layout Configuration</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="headerStyle">Header Style</Label>
                          <Select 
                            value={formData.configuration.layout.headerStyle} 
                            onValueChange={(value) => setFormData({
                              ...formData,
                              configuration: {
                                ...formData.configuration,
                                layout: {
                                  ...formData.configuration.layout,
                                  headerStyle: value as 'fixed' | 'static'
                                }
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="static">Static</SelectItem>
                              <SelectItem value="fixed">Fixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="navigationStyle">Navigation Style</Label>
                          <Select 
                            value={formData.configuration.layout.navigationStyle} 
                            onValueChange={(value) => setFormData({
                              ...formData,
                              configuration: {
                                ...formData.configuration,
                                layout: {
                                  ...formData.configuration.layout,
                                  navigationStyle: value as 'horizontal' | 'vertical' | 'minimal'
                                }
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="horizontal">Horizontal</SelectItem>
                              <SelectItem value="vertical">Vertical</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="cardStyle">Card Style</Label>
                          <Select 
                            value={formData.configuration.theme.cardStyle} 
                            onValueChange={(value) => setFormData({
                              ...formData,
                              configuration: {
                                ...formData.configuration,
                                theme: {
                                  ...formData.configuration.theme,
                                  cardStyle: value as 'flat' | 'elevated' | 'outlined'
                                }
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="flat">Flat</SelectItem>
                              <SelectItem value="elevated">Elevated</SelectItem>
                              <SelectItem value="outlined">Outlined</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTemplate}>
                        {editingTemplate ? "Update Template" : "Create Template"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12 text-gray-600 dark:text-gray-400">
                Loading templates...
              </div>
            ) : templates.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-600 dark:text-gray-400">
                No templates found. Create your first template to get started.
              </div>
            ) : (
              templates.map((template, index) => (
                <StaggerItem key={template.id}>
                  <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full">
                    <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative">
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ 
                          background: `linear-gradient(135deg, ${template.configuration.theme.primaryColor}20, ${template.configuration.theme.secondaryColor}20)` 
                        }}
                      >
                        <div className="text-center">
                          <div 
                            className="w-16 h-16 mx-auto mb-2 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: template.configuration.theme.primaryColor }}
                          >
                            <Layout className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-sm font-medium">{template.name}</p>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {template.description}
                      </p>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))
            )}
          </StaggerContainer>
        </div>
      </div>
    </PageTransition>
  )
}
