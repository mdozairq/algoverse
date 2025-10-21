"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Coins, 
  Settings, 
  Eye, 
  Save, 
  Plus,
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  Upload,
  Image,
  Palette,
  Type,
  Layout
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"

interface CoinsPageContent {
  title: string
  description: string
  featuredImage?: string
  layout: 'grid' | 'list' | 'carousel'
  showFeatured: boolean
  showCategories: boolean
  showFilters: boolean
  itemsPerPage: number
  customFields: Array<{
    id: string
    name: string
    type: 'text' | 'number' | 'select' | 'textarea'
    required: boolean
    options?: string[]
  }>
  mintingSettings: {
    allowBatchCoins: boolean
    maxBatchSize: number
    requireApproval: boolean
    showCoinsProgress: boolean
  }
  styling: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    borderRadius: string
  }
}

export default function CoinsPageManagement({
  params
}: {
  params: { id: string }
}) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageContent, setPageContent] = useState<CoinsPageContent>({
    title: "Coins NFTs",
    description: "Create and mint your own NFTs",
    layout: 'grid',
    showFeatured: true,
    showCategories: true,
    showFilters: true,
    itemsPerPage: 12,
    customFields: [],
    mintingSettings: {
      allowBatchCoins: true,
      maxBatchSize: 10,
      requireApproval: false,
      showCoinsProgress: true
    },
    styling: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      fontFamily: 'Inter',
      borderRadius: '0.5rem'
    }
  })
  
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchCoinsPage()
  }, [params.id])

  const fetchCoinsPage = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.id}/pages?type=mint`)
      if (response.ok) {
        const data = await response.json()
        if (data.pages && data.pages.length > 0) {
          setPageContent(data.pages[0].content)
        }
      }
    } catch (error) {
      console.error("Error fetching mint page:", error)
      toast({
        title: "Error",
        description: "Failed to load mint page configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCoinsPage = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/marketplaces/${params.id}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: 'mint',
          title: pageContent.title,
          description: pageContent.description,
          content: pageContent,
          isActive: true,
          order: 1,
          slug: 'mint'
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Coins page configuration saved successfully!",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to save mint page")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save mint page",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addCustomField = () => {
    setPageContent(prev => ({
      ...prev,
      customFields: [
        ...prev.customFields,
        {
          id: Date.now().toString(),
          name: '',
          type: 'text',
          required: false,
          options: []
        }
      ]
    }))
  }

  const updateCustomField = (id: string, updates: any) => {
    setPageContent(prev => ({
      ...prev,
      customFields: prev.customFields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    }))
  }

  const removeCustomField = (id: string) => {
    setPageContent(prev => ({
      ...prev,
      customFields: prev.customFields.filter(field => field.id !== id)
    }))
  }

  if (loading) {
    return (
      <AuthGuard requiredRole="merchant">
        <DashboardLayout role="merchant">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="merchant">
      <DashboardLayout role="merchant">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Coins Page Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure your NFT minting page
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCoinsPage}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleSaveCoinsPage} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Configuration
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">
                <Settings className="w-4 h-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Layout className="w-4 h-4 mr-2" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="fields">
                <Type className="w-4 h-4 mr-2" />
                Custom Fields
              </TabsTrigger>
              <TabsTrigger value="minting">
                <Coins className="w-4 h-4 mr-2" />
                Coinsing
              </TabsTrigger>
              <TabsTrigger value="styling">
                <Palette className="w-4 h-4 mr-2" />
                Styling
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure basic page information and display options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="page-title">Page Title</Label>
                        <Input
                          id="page-title"
                          value={pageContent.title}
                          onChange={(e) => setPageContent(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Coins NFTs"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="page-description">Page Description</Label>
                        <Textarea
                          id="page-description"
                          value={pageContent.description}
                          onChange={(e) => setPageContent(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Create and mint your own NFTs"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="featured-image">Featured Image URL</Label>
                        <Input
                          id="featured-image"
                          value={pageContent.featuredImage || ''}
                          onChange={(e) => setPageContent(prev => ({ ...prev, featuredImage: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-featured">Show Featured Section</Label>
                        <Switch
                          id="show-featured"
                          checked={pageContent.showFeatured}
                          onCheckedChange={(checked) => setPageContent(prev => ({ ...prev, showFeatured: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-categories">Show Categories</Label>
                        <Switch
                          id="show-categories"
                          checked={pageContent.showCategories}
                          onCheckedChange={(checked) => setPageContent(prev => ({ ...prev, showCategories: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-filters">Show Filters</Label>
                        <Switch
                          id="show-filters"
                          checked={pageContent.showFilters}
                          onCheckedChange={(checked) => setPageContent(prev => ({ ...prev, showFilters: checked }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="items-per-page">Items Per Page</Label>
                        <Input
                          id="items-per-page"
                          type="number"
                          value={pageContent.itemsPerPage}
                          onChange={(e) => setPageContent(prev => ({ ...prev, itemsPerPage: parseInt(e.target.value) }))}
                          placeholder="12"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Layout Settings */}
            <TabsContent value="layout">
              <Card>
                <CardHeader>
                  <CardTitle>Layout Settings</CardTitle>
                  <CardDescription>
                    Configure how NFTs are displayed on the mint page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="layout-type">Layout Type</Label>
                    <Select
                      value={pageContent.layout}
                      onValueChange={(value: 'grid' | 'list' | 'carousel') => 
                        setPageContent(prev => ({ ...prev, layout: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid Layout</SelectItem>
                        <SelectItem value="list">List Layout</SelectItem>
                        <SelectItem value="carousel">Carousel Layout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className={`cursor-pointer transition-all ${pageContent.layout === 'grid' ? 'ring-2 ring-blue-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-2 h-20">
                          <div className="bg-gray-200 rounded"></div>
                          <div className="bg-gray-200 rounded"></div>
                          <div className="bg-gray-200 rounded"></div>
                          <div className="bg-gray-200 rounded"></div>
                        </div>
                        <p className="text-sm font-medium mt-2">Grid Layout</p>
                      </CardContent>
                    </Card>
                    
                    <Card className={`cursor-pointer transition-all ${pageContent.layout === 'list' ? 'ring-2 ring-blue-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="bg-gray-200 rounded h-4"></div>
                          <div className="bg-gray-200 rounded h-4"></div>
                          <div className="bg-gray-200 rounded h-4"></div>
                        </div>
                        <p className="text-sm font-medium mt-2">List Layout</p>
                      </CardContent>
                    </Card>
                    
                    <Card className={`cursor-pointer transition-all ${pageContent.layout === 'carousel' ? 'ring-2 ring-blue-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="bg-gray-200 rounded h-20 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                        <p className="text-sm font-medium mt-2">Carousel Layout</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Custom Fields */}
            <TabsContent value="fields">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Fields</CardTitle>
                  <CardDescription>
                    Add custom fields for NFT metadata collection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Custom Fields</h3>
                    <Button onClick={addCustomField} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Field
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {pageContent.customFields.map((field) => (
                      <Card key={field.id}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <Label>Field Name</Label>
                              <Input
                                value={field.name}
                                onChange={(e) => updateCustomField(field.id, { name: e.target.value })}
                                placeholder="Field name"
                              />
                            </div>
                            
                            <div>
                              <Label>Field Type</Label>
                              <Select
                                value={field.type}
                                onValueChange={(value: 'text' | 'number' | 'select' | 'textarea') => 
                                  updateCustomField(field.id, { type: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="select">Select</SelectItem>
                                  <SelectItem value="textarea">Textarea</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) => updateCustomField(field.id, { required: checked })}
                              />
                              <Label>Required</Label>
                            </div>
                            
                            <div className="flex items-center justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeCustomField(field.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {field.type === 'select' && (
                            <div className="mt-4">
                              <Label>Options (comma-separated)</Label>
                              <Input
                                value={field.options?.join(', ') || ''}
                                onChange={(e) => updateCustomField(field.id, { 
                                  options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt)
                                })}
                                placeholder="Option 1, Option 2, Option 3"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Coinsing Settings */}
            <TabsContent value="minting">
              <Card>
                <CardHeader>
                  <CardTitle>Coinsing Settings</CardTitle>
                  <CardDescription>
                    Configure minting behavior and user experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-batch-mint">Allow Batch Coinsing</Label>
                        <Switch
                          id="allow-batch-mint"
                          checked={pageContent.mintingSettings.allowBatchCoins}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              mintingSettings: { ...prev.mintingSettings, allowBatchCoins: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-approval">Require Approval</Label>
                        <Switch
                          id="require-approval"
                          checked={pageContent.mintingSettings.requireApproval}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              mintingSettings: { ...prev.mintingSettings, requireApproval: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-mint-progress">Show Coins Progress</Label>
                        <Switch
                          id="show-mint-progress"
                          checked={pageContent.mintingSettings.showCoinsProgress}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              mintingSettings: { ...prev.mintingSettings, showCoinsProgress: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="max-batch-size">Maximum Batch Size</Label>
                        <Input
                          id="max-batch-size"
                          type="number"
                          value={pageContent.mintingSettings.maxBatchSize}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              mintingSettings: { ...prev.mintingSettings, maxBatchSize: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Styling Settings */}
            <TabsContent value="styling">
              <Card>
                <CardHeader>
                  <CardTitle>Styling Settings</CardTitle>
                  <CardDescription>
                    Customize the appearance of your mint page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="primary-color"
                            type="color"
                            value={pageContent.styling.primaryColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, primaryColor: e.target.value }
                              }))
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={pageContent.styling.primaryColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, primaryColor: e.target.value }
                              }))
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="secondary-color">Secondary Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="secondary-color"
                            type="color"
                            value={pageContent.styling.secondaryColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, secondaryColor: e.target.value }
                              }))
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={pageContent.styling.secondaryColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, secondaryColor: e.target.value }
                              }))
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="font-family">Font Family</Label>
                        <Select
                          value={pageContent.styling.fontFamily}
                          onValueChange={(value) => 
                            setPageContent(prev => ({
                              ...prev,
                              styling: { ...prev.styling, fontFamily: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Lato">Lato</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="border-radius">Border Radius</Label>
                        <Select
                          value={pageContent.styling.borderRadius}
                          onValueChange={(value) => 
                            setPageContent(prev => ({
                              ...prev,
                              styling: { ...prev.styling, borderRadius: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0rem">None</SelectItem>
                            <SelectItem value="0.25rem">Small</SelectItem>
                            <SelectItem value="0.5rem">Medium</SelectItem>
                            <SelectItem value="0.75rem">Large</SelectItem>
                            <SelectItem value="1rem">Extra Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
