"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Store, Upload } from "lucide-react"
import { PageTransition, FadeIn, SlideUp } from "@/components/animations/page-transition"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function MerchantAuthPage() {
  const router = useRouter()
  const { registerMerchant, loading } = useAuth()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
    description: "",
    category: "",
    walletAddress: "",
    businessLicense: null as File | null,
  })

  const categories = [
    "Concerts & Music",
    "Sports Events",
    "Conferences & Tech",
    "Movies & Cinema",
    "Hotels & Resorts",
    "Theater & Arts",
    "Festivals",
    "Other",
  ]

  const handleNext = () => {
    setStep(step + 1)
  }

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.businessName || !formData.email || !formData.password || !formData.category || !formData.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match",
          variant: "destructive",
        })
        return
      }

      if (formData.password.length < 6) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        })
        return
      }

      await registerMerchant({
        email: formData.email,
        password: formData.password,
        displayName: formData.businessName,
        businessName: formData.businessName,
        description: formData.description,
        category: formData.category,
        walletAddress: formData.walletAddress,
      })

      toast({
        title: "Application Submitted",
        description: "Your merchant application has been submitted for review. You'll receive an email once approved.",
      })

      // Redirect to a pending page or home
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      })
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <FadeIn>
            <Link
              href="/"
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-8 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Store className="w-8 h-8 text-white dark:text-black" />
              </motion.div>
              <h1 className="text-4xl font-black tracking-tight mb-4 text-gray-900 dark:text-white">
                MERCHANT
                <br />
                APPLICATION
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Apply to become a verified merchant and create your own marketplace
              </p>
            </div>
          </FadeIn>

          <SlideUp delay={0.2}>
            <Card className="border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-8 space-y-6">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center mb-8">
                  {[1, 2, 3].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{
                          scale: step >= stepNumber ? 1 : 0.8,
                          opacity: step >= stepNumber ? 1 : 0.5,
                        }}
                        transition={{ duration: 0.3 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          step >= stepNumber
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {stepNumber}
                      </motion.div>
                      {stepNumber < 3 && (
                        <div
                          className={`w-12 h-0.5 mx-2 ${step > stepNumber ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-gray-700"}`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {step === 1 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-black text-center mb-6 text-gray-900 dark:text-white">
                        Business Information
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <Label
                            htmlFor="businessName"
                            className="text-sm font-medium text-gray-900 dark:text-gray-300"
                          >
                            Business Name *
                          </Label>
                          <Input
                            id="businessName"
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            placeholder="Enter your business name"
                            className="rounded-full h-12 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                            Business Email *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Enter your business email"
                            className="rounded-full h-12 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                            Business Category *
                          </Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                          >
                            <SelectTrigger className="h-12 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-full text-gray-900 dark:text-white">
                              <SelectValue placeholder="Select your business category" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                              {categories.map((category) => (
                                <SelectItem
                                  key={category}
                                  value={category}
                                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="description" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                            Business Description *
                          </Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe your business and the types of events you organize"
                            className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                            rows={4}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleNext}
                        className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full py-3 text-sm font-medium"
                        size="lg"
                      >
                        CONTINUE
                      </Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-black text-center mb-6 text-gray-900 dark:text-white">
                        Account Setup
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                            Password *
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Create a secure password"
                            className="rounded-full h-12 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="confirmPassword"
                            className="text-sm font-medium text-gray-900 dark:text-gray-300"
                          >
                            Confirm Password *
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="Confirm your password"
                            className="rounded-full h-12 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="walletAddress"
                            className="text-sm font-medium text-gray-900 dark:text-gray-300"
                          >
                            Algorand Wallet Address *
                          </Label>
                          <Input
                            id="walletAddress"
                            value={formData.walletAddress}
                            onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                            placeholder="Enter your Algorand wallet address"
                            className="rounded-full h-12 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            This wallet will receive payments from NFT sales
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Button
                          onClick={() => setStep(1)}
                          variant="outline"
                          className="flex-1 rounded-full py-3 text-sm font-medium bg-transparent border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          BACK
                        </Button>
                        <Button
                          onClick={handleNext}
                          className="flex-1 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full py-3 text-sm font-medium"
                        >
                          CONTINUE
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-black text-center mb-6 text-gray-900 dark:text-white">
                        Verification Documents
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-900 dark:text-gray-300">
                            Business License or Registration *
                          </Label>
                          <div className="mt-2 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Upload your business license or registration document
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full bg-transparent border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Choose File
                            </Button>
                          </div>
                        </div>
                        <div className="bg-yellow-100/20 border border-yellow-700 rounded-lg p-4">
                          <h3 className="font-bold text-yellow-800 dark:text-yellow-400 mb-2">
                            Application Review Process
                          </h3>
                          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            <li>• Your application will be reviewed by our admin team</li>
                            <li>• Review typically takes 2-3 business days</li>
                            <li>• You'll receive an email notification once approved</li>
                            <li>• Approved merchants can immediately start creating events</li>
                          </ul>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Button
                          onClick={() => setStep(2)}
                          variant="outline"
                          className="flex-1 rounded-full py-3 text-sm font-medium bg-transparent border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          BACK
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={loading}
                          className="flex-1 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full py-3 text-sm font-medium"
                        >
                          {loading ? "SUBMITTING..." : "SUBMIT APPLICATION"}
                        </Button>
                      </div>
                      <div className="text-center mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Already have a merchant account?{" "}
                          <Link
                            href="/auth/merchant-login"
                            className="text-black dark:text-white hover:underline font-medium"
                          >
                            Sign in here
                          </Link>
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </SlideUp>
        </div>
      </div>
    </PageTransition>
  )
}
