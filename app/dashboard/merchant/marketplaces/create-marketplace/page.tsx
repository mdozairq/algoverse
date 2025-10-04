"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft, ArrowRight, Upload, Eye, Save, Check, Store, Palette, CreditCard, Loader2, Layout } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
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

export default function CreateMarketplace() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    category: "",
    website: "",
    logo: null,
    banner: null,
    template: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    paymentMethod: "algorand",
    walletAddress: "",
  })

  const steps = [
    { id: 1, title: "Basic Info", icon: Store, description: "Business details" },
    { id: 2, title: "Branding", icon: Upload, description: "Logo & banner" },
    { id: 3, title: "Template", icon: Palette, description: "Choose design" },
    { id: 4, title: "Payment", icon: CreditCard, description: "Setup payments" },
    { id: 5, title: "Preview", icon: Eye, description: "Review & submit" },
  ]

  // Fetch templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/marketplace-templates")
        const data = await res.json()
        if (res.ok) {
          setTemplates(data.templates || [])
          // Set default template if available
          if (data.templates && data.templates.length > 0 && !formData.template) {
            setFormData(prev => ({ ...prev, template: data.templates[0].id }))
          }
        }
      } catch (e) {
        console.error("Failed to fetch templates:", e)
      } finally {
        setTemplatesLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  // Update colors when template changes
  const handleTemplateChange = (templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId)
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        template: templateId,
        primaryColor: selectedTemplate.configuration.theme.primaryColor,
        secondaryColor: selectedTemplate.configuration.theme.secondaryColor,
      }))
    } else {
      setFormData(prev => ({ ...prev, template: templateId }))
    }
  }

  const progress = (currentStep / steps.length) * 100

  const nextStep = () => {
    if (currentStep < steps.length && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    } else if (!validateStep(currentStep)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive",
      })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.businessName && formData.description && formData.category
      case 2:
        return true // Optional step
      case 3:
        return formData.template
      case 4:
        return true
      case 5:
        return true // Preview step
      default:
        return false
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/marketplaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status: "draft",
        }),
      })

      if (response.ok) {
        toast({
          title: "Draft saved",
          description: "Your marketplace draft has been saved successfully.",
        })
      } else {
        throw new Error("Failed to save draft")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(4)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/marketplaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status: "pending",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Marketplace Submitted",
          description: "Your marketplace has been submitted for approval. You'll be notified once it's reviewed.",
        })
        // Reset form
        setFormData({
          businessName: "",
          description: "",
          category: "",
          website: "",
          logo: null,
          banner: null,
          template: "modern",
          primaryColor: "#3B82F6",
          secondaryColor: "#10B981",
          paymentMethod: "algorand",
          walletAddress:"",
        })
        setCurrentStep(1)
      } else {
        throw new Error(data.error || "Failed to submit marketplace")
      }
    } catch (error: any) {
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit marketplace. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/merchant/marketplaces">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">CREATE MARKETPLACE</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button 
              variant="outline" 
              className="rounded-full bg-transparent"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Draft
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep >= step.id
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 dark:border-gray-600 text-gray-400"
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-20 h-0.5 mx-2 transition-colors ${
                      currentStep > step.id ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
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
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Business Information</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Tell us about your business and marketplace
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="businessName" className="text-gray-900 dark:text-white">
                          Business Name *
                        </Label>
                        <Input
                          id="businessName"
                          value={formData.businessName}
                          onChange={(e) => handleInputChange("businessName", e.target.value)}
                          placeholder="Enter your business name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category" className="text-gray-900 dark:text-white">
                          Category *
                        </Label>
                        <select
                          id="category"
                          value={formData.category}
                          onChange={(e) => handleInputChange("category", e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="">Select category</option>
                          <option value="music">Music & Concerts</option>
                          <option value="sports">Sports</option>
                          <option value="theater">Theater & Arts</option>
                          <option value="conferences">Conferences</option>
                          <option value="festivals">Festivals</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-gray-900 dark:text-white">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Describe your marketplace and what makes it unique"
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website" className="text-gray-900 dark:text-white">
                        Website (Optional)
                      </Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        placeholder="https://your-website.com"
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Branding */}
              {currentStep === 2 && (
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Branding Assets</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Upload your logo and banner to customize your marketplace
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-900 dark:text-white">Logo</Label>
                        <div className="mt-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload logo</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-900 dark:text-white">Banner</Label>
                        <div className="mt-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload banner</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            PNG, JPG up to 5MB (1920x400 recommended)
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="primaryColor" className="text-gray-900 dark:text-white">
                          Primary Color
                        </Label>
                        <div className="flex items-center gap-3 mt-2">
                          <input
                            type="color"
                            id="primaryColor"
                            value={formData.primaryColor}
                            onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                            className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                          <Input
                            value={formData.primaryColor}
                            onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                            placeholder="#3B82F6"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="secondaryColor" className="text-gray-900 dark:text-white">
                          Secondary Color
                        </Label>
                        <div className="flex items-center gap-3 mt-2">
                          <input
                            type="color"
                            id="secondaryColor"
                            value={formData.secondaryColor}
                            onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                            className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                          <Input
                            value={formData.secondaryColor}
                            onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                            placeholder="#10B981"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Template Selection */}
              {currentStep === 3 && (
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Choose Template</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Select a design template for your marketplace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {templatesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading templates...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            onClick={() => handleTemplateChange(template.id)}
                            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              formData.template === template.id
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                          >
                            {/* Template Preview */}
                            <div 
                              className="w-full h-40 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden"
                              style={{ 
                                background: `linear-gradient(135deg, ${template.configuration.theme.primaryColor}20, ${template.configuration.theme.secondaryColor}20)` 
                              }}
                            >
                              <div className="text-center">
                                <div 
                                  className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: template.configuration.theme.primaryColor }}
                                >
                                  <Layout className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-sm font-medium">{template.name}</p>
                              </div>
                              <div className="absolute top-2 left-2">
                                <span 
                                  className="text-xs px-2 py-1 rounded-full text-white"
                                  style={{ backgroundColor: template.configuration.theme.secondaryColor }}
                                >
                                  {template.category}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {template.description}
                              </p>
                              
                              {/* Template Features */}
                              <div className="mt-3 flex flex-wrap gap-1">
                                {template.configuration.features.heroSection && (
                                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Hero</span>
                                )}
                                {template.configuration.features.featuredProducts && (
                                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Products</span>
                                )}
                                {template.configuration.features.categories && (
                                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Categories</span>
                                )}
                                {template.configuration.features.testimonials && (
                                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Reviews</span>
                                )}
                              </div>
                            </div>
                            
                            {formData.template === template.id && (
                              <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Payment Setup */}
              {currentStep === 4 && (
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Payment Configuration</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Set up your payment methods and wallet
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-gray-900 dark:text-white">Payment Method</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div
                          onClick={() => handleInputChange("paymentMethod", "algorand")}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            formData.paymentMethod === "algorand"
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <h3 className="font-bold text-gray-900 dark:text-white">Algorand</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Accept ALGO payments</p>
                        </div>
                        <div
                          onClick={() => handleInputChange("paymentMethod", "mixed")}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            formData.paymentMethod === "mixed"
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <h3 className="font-bold text-gray-900 dark:text-white">Mixed Payments</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">ALGO + Credit Cards</p>
                        </div>
                      </div>
                    </div>
                    {/* <div>
                      <Label htmlFor="walletAddress" className="text-gray-900 dark:text-white">
                        Algorand Wallet Address *
                      </Label>
                      <Input
                        id="walletAddress"
                        value={formData.walletAddress}
                        onChange={(e) => handleInputChange("walletAddress", e.target.value)}
                        placeholder="Enter your Algorand wallet address"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        This is where you'll receive payments from NFT sales
                      </p>
                    </div> */}
                  </CardContent>
                </Card>
              )}

              {/* Step 5: Preview */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Marketplace Preview</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Review your marketplace before submitting for approval
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-700">
                        <div className="text-center mb-6">
                          <h2
                            className="text-2xl font-black text-gray-900 dark:text-white"
                            style={{ color: formData.primaryColor }}
                          >
                            {formData.businessName || "Your Business Name"}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {formData.description || "Your marketplace description will appear here"}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="w-full h-32 bg-gray-200 dark:bg-gray-600 rounded-lg mb-3"></div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Sample Event</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">0.5 ALGO</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="w-full h-32 bg-gray-200 dark:bg-gray-600 rounded-lg mb-3"></div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Sample Event</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">0.3 ALGO</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="w-full h-32 bg-gray-200 dark:bg-gray-600 rounded-lg mb-3"></div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Sample Event</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">1.2 ALGO</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Submission Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2">Business Details</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Name: {formData.businessName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Category: {formData.category}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Template: {formData.template}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2">Payment Setup</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Method: {formData.paymentMethod}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Wallet: {formData.walletAddress}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="rounded-full bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep < steps.length ? (
                <Button onClick={nextStep} className="rounded-full">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  className="rounded-full bg-green-600 hover:bg-green-700"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Submit for Approval
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
