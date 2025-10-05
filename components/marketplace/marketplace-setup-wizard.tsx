"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Palette, 
  Store, 
  Globe, 
  Settings,
  Eye,
  Sparkles,
  Zap,
  Crown,
  Star
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

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

interface MarketplaceSetupData {
  // Basic Info
  businessName: string
  description: string
  category: string
  website?: string
  logo?: string
  banner?: string
  
  // Template & Design
  template: string
  primaryColor: string
  secondaryColor: string
  
  // Settings
  paymentMethod: string
  customDomain?: string
  status: "draft" | "pending" | "approved" | "rejected"
}

interface MarketplaceSetupWizardProps {
  onComplete: (data: MarketplaceSetupData) => void
  onCancel: () => void
  initialData?: Partial<MarketplaceSetupData>
}

const STEPS = [
  { id: 1, title: "Basic Info", description: "Tell us about your business" },
  { id: 2, title: "Choose Template", description: "Select your marketplace design" },
  { id: 3, title: "Customize Colors", description: "Make it uniquely yours" },
  { id: 4, title: "Review & Create", description: "Finalize your marketplace" }
]

const CATEGORIES = [
  { value: "entertainment", label: "Entertainment", icon: "🎭" },
  { value: "sports", label: "Sports", icon: "⚽" },
  { value: "art", label: "Art & Culture", icon: "🎨" },
  { value: "technology", label: "Technology", icon: "💻" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "fashion", label: "Fashion", icon: "👗" },
  { value: "gaming", label: "Gaming", icon: "🎮" },
  { value: "music", label: "Music", icon: "🎵" },
  { value: "other", label: "Other", icon: "🌟" }
]

const PAYMENT_METHODS = [
  { value: "algorand", label: "Algorand (ALGO)", icon: "🔗" },
  { value: "usdc", label: "USDC", icon: "💵" },
  { value: "both", label: "Both ALGO & USDC", icon: "💰" }
]

const COLOR_PRESETS = [
  { name: "Ocean Blue", primary: "#3B82F6", secondary: "#1E40AF" },
  { name: "Forest Green", primary: "#10B981", secondary: "#047857" },
  { name: "Sunset Orange", primary: "#F97316", secondary: "#EA580C" },
  { name: "Royal Purple", primary: "#8B5CF6", secondary: "#7C3AED" },
  { name: "Rose Pink", primary: "#EC4899", secondary: "#DB2777" },
  { name: "Midnight", primary: "#1F2937", secondary: "#111827" },
  { name: "Emerald", primary: "#059669", secondary: "#047857" },
  { name: "Crimson", primary: "#DC2626", secondary: "#B91C1C" }
]

export default function MarketplaceSetupWizard({ 
  onComplete, 
  onCancel, 
  initialData 
}: MarketplaceSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<MarketplaceSetupData>({
    businessName: "",
    description: "",
    category: "",
    template: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
    paymentMethod: "algorand",
    status: "draft",
    ...initialData
  })
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/marketplace-templates")
      const data = await response.json()
      if (response.ok) {
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive"
      })
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      setFormData(prev => ({
        ...prev,
        template: templateId,
        primaryColor: template.configuration.theme.primaryColor,
        secondaryColor: template.configuration.theme.secondaryColor
      }))
    }
  }

  const handleColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setFormData(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onComplete(formData)
      toast({
        title: "Success",
        description: "Marketplace created successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create marketplace",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.businessName && formData.description && formData.category)
      case 2:
        return !!formData.template
      case 3:
        return !!(formData.primaryColor && formData.secondaryColor)
      case 4:
        return true
      default:
        return false
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Your Marketplace
            </h1>
          </motion.div>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Build your independent marketplace in minutes with our powerful template system
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Business Information
                    </CardTitle>
                    <CardDescription>
                      Tell us about your business and what you'll be selling
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input
                          id="businessName"
                          value={formData.businessName}
                          onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                          placeholder="Enter your business name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center gap-2">
                                  <span>{category.icon}</span>
                                  <span>{category.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your marketplace and what makes it unique"
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="website">Website (Optional)</Label>
                        <Input
                          id="website"
                          value={formData.website || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://yourwebsite.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_METHODS.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                <div className="flex items-center gap-2">
                                  <span>{method.icon}</span>
                                  <span>{method.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Choose Template */}
              {currentStep === 2 && (
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Choose Your Template
                    </CardTitle>
                    <CardDescription>
                      Select a template that matches your brand and style
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {templates.map((template) => (
                        <motion.div
                          key={template.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-all duration-300 ${
                              formData.template === template.id
                                ? 'ring-2 ring-blue-500 shadow-lg'
                                : 'hover:shadow-md'
                            }`}
                            onClick={() => handleTemplateSelect(template.id)}
                          >
                            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-t-lg relative overflow-hidden">
                              <div 
                                className="w-full h-full flex items-center justify-center"
                                style={{ 
                                  background: `linear-gradient(135deg, ${template.configuration.theme.primaryColor}20, ${template.configuration.theme.secondaryColor}20)` 
                                }}
                              >
                                <Store className="w-16 h-16 text-gray-400" />
                              </div>
                              {formData.template === template.id && (
                                <div className="absolute top-3 right-3">
                                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">{template.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {template.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {template.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                  style={{ backgroundColor: template.configuration.theme.primaryColor }}
                                />
                                <div 
                                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                  style={{ backgroundColor: template.configuration.theme.secondaryColor }}
                                />
                                <span className="text-xs text-gray-500">
                                  {template.configuration.theme.cardStyle} • {template.configuration.theme.borderRadius}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Customize Colors */}
              {currentStep === 3 && (
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Customize Colors
                    </CardTitle>
                    <CardDescription>
                      Choose colors that represent your brand
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Color Presets */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Quick Color Presets</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {COLOR_PRESETS.map((preset) => (
                          <motion.div
                            key={preset.name}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Card 
                              className="cursor-pointer hover:shadow-md transition-all duration-200"
                              onClick={() => handleColorPreset(preset)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <div 
                                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: preset.primary }}
                                  />
                                  <div 
                                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: preset.secondary }}
                                  />
                                </div>
                                <p className="text-xs font-medium">{preset.name}</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Custom Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={formData.primaryColor}
                            onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.primaryColor}
                            onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            id="secondaryColor"
                            type="color"
                            value={formData.secondaryColor}
                            onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.secondaryColor}
                            onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Preview</Label>
                      <Card 
                        className="p-6"
                        style={{ 
                          background: `linear-gradient(135deg, ${formData.primaryColor}10, ${formData.secondaryColor}10)` 
                        }}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ 
                              background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})` 
                            }}
                          >
                            {formData.businessName.charAt(0) || 'M'}
                          </div>
                          <div>
                            <h3 className="font-semibold">{formData.businessName || 'Your Marketplace'}</h3>
                            <p className="text-sm text-gray-600">Premium marketplace</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            style={{ 
                              backgroundColor: formData.primaryColor,
                              color: 'white'
                            }}
                          >
                            Primary Button
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            style={{ 
                              borderColor: formData.primaryColor,
                              color: formData.primaryColor
                            }}
                          >
                            Secondary Button
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Review & Create */}
              {currentStep === 4 && (
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Review & Create
                    </CardTitle>
                    <CardDescription>
                      Review your marketplace settings and create it
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Business Info */}
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Business Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div><strong>Name:</strong> {formData.businessName}</div>
                          <div><strong>Category:</strong> {CATEGORIES.find(c => c.value === formData.category)?.label}</div>
                          <div><strong>Payment:</strong> {PAYMENT_METHODS.find(p => p.value === formData.paymentMethod)?.label}</div>
                          {formData.website && <div><strong>Website:</strong> {formData.website}</div>}
                        </div>
                      </div>

                      {/* Template & Design */}
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Palette className="w-4 h-4" />
                          Design & Template
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div><strong>Template:</strong> {selectedTemplate?.name}</div>
                          <div className="flex items-center gap-2">
                            <strong>Colors:</strong>
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: formData.primaryColor }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: formData.secondaryColor }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="font-semibold mb-3">Description</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {formData.description}
                      </p>
                    </div>

                    {/* Marketplace URL Preview */}
                    <div>
                      <h3 className="font-semibold mb-3">Your Marketplace URL</h3>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <code className="text-sm">
                          {typeof window !== 'undefined' ? window.location.origin : 'localhost:3000'}/marketplace/[merchantId]/{formData.businessName.toLowerCase().replace(/\s+/g, '-')}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onCancel : handlePrevious}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </Button>

            <div className="flex items-center gap-3">
              {currentStep < STEPS.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep) || loading}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid(currentStep) || loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Create Marketplace
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
